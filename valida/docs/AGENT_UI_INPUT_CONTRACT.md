# VALIDA frontend → `agent_ui` input contract

> Branch: `feature/new_valida`
> Scope: how the React wizard (`CreateReport` → `WizardShell`) builds the JSON payload
> that VALIDA's `agent_ui` node (`Valida/src/graph/nodes/agent_ui.py`) consumes when the
> user presses **Iniciar Validación**.

The wizard collects a flat `WizardForm` (see `src/interface/Report.ts`). The backend
node expects a **`ValidaState`** object (`Valida/src/graph/state.py`). This document
defines the transformation the frontend (or the Power Automate / API layer behind it)
must perform before invoking the graph. The OCR step
`procaps-framework-ai/src/steps/indexing/s01_valida_ocr.py` accepts this **same** payload
via its `--valida_input` argument.

---

## 1. What the user produces, step by step

The wizard has three steps. Each contributes a slice of the final payload.

### Step 1 — *Datos del informe*
Plain text fields plus the mandatory protocol PDF.

| UI field (`WizardForm`) | Becomes (`ValidaState`)        | Notes |
|-------------------------|--------------------------------|-------|
| `nombreReporte`         | `validacion`                   | Free-text report title |
| `codigoInforme`         | `codigo_informe`               | Also used as the report `id` |
| `nombreProducto`        | `nombre_producto`              | |
| `codigoProducto`        | `codigo_producto`              | |
| `ingredientes`          | `lista_activos: API[]`         | **Split** the comma string → one `{nombre, concentracion}` per active (see §4) |
| `rango`                 | `rango_validado`               | e.g. `"95 % - 105 %"` |
| `protocolo` (PDF)       | `dir_protocolo` + a `document_groups` entry `(Protocolo, Protocolo)` | Mandatory. Encoded to base64 (see §3) |

### Step 2 — *Métodos y adjuntos*
The user checks one or more analytical methods. For **each selected method** they attach
one file and pick its document type from a dropdown (`Reporte LIMS` or
`Soportes Cromatográficos`).

`WizardForm.groups` is `Record<methodLabel, { selected, doc, file }>`. Every selected
entry becomes **one `document_groups` entry** and populates the matching `dir_*` field
(see the mapping in §5).

### Step 3 — *Soportes de preparación*
Two mandatory PDFs that back the preparation process.

| UI field    | Becomes (`ValidaState`)                                                | Triggers |
|-------------|-----------------------------------------------------------------------|----------|
| `hojas`     | `dir_hoja_trabajo_preparacion` + group `(Hojas de Trabajo Preparacion, Hojas de Trabajo Preparacion)` | Set 2 |
| `bitacoras` | `dirs_bitacora_preparacion` + group `(Preparacion Bitacoras, Preparacion Bitacoras)` | Set 2 |

---

## 2. The shape `agent_ui` actually reads

`agent_ui.build_documents()` resolves files for each set in two ways, in this order:

1. **`document_groups`** — a list of `{ group, document, files: FileDescriptor[] }`.
   This is the primary, UI-faithful channel: each selection in steps 1–3 maps to exactly
   one entry, keyed by a `(group, document)` label pair.
2. **Typed `dir_*` fields** — used as a fallback when no matching group entry exists.

> Populate **both** to be safe: emit a `document_groups` entry *and* set the corresponding
> `dir_*` field with the same `FileDescriptor`. `agent_ui` de-duplicates by content
> fingerprint, so a file present in both channels is processed once.

A `FileDescriptor` (the file object inside `files` / `dir_*`) minimally needs:

```jsonc
{
  "name": "reporte_lims_linealidad_hidrocodona.pdf",  // required
  "content_base64": "JVBERi0xLjcK...",                // inline upload (preferred)
  "content_type": "application/pdf",
  "checksum": "77aa88...",                            // sha1, used for dedup
  "size": 120044
}
```

Alternatives to `content_base64` (any one source is enough): `url` (http/https),
or SharePoint fields (`siteLookup`, `serverRelativePath`, `uniqueId`, `driveId`).

---

## 3. Encoding the files (the part the mock skips)

The current `WizardShell` stores **placeholder filenames** (e.g.
`set('protocolo', 'documento_protocolo.pdf')`) — it does not read bytes. For the real
integration the attach handlers must read the `File` and base64-encode it:

```ts
async function toDescriptor(file: File): Promise<FileDescriptor> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  const content_base64 = btoa(bin);
  const checksum = await sha1Hex(buf); // SubtleCrypto: crypto.subtle.digest('SHA-1', buf)
  return {
    name: file.name,
    content_type: file.type || 'application/pdf',
    size: file.size,
    checksum,
    content_base64,
  };
}
```

`content_base64` must be the **raw base64** (no `data:` prefix). `agent_ui` and
`index_node` / `s01_valida_ocr` both base64-decode it directly.

---

## 4. `ingredientes` → `lista_activos`

The textarea is a comma-separated string. Split it into `API` objects. Concentration is
optional; when the active carries it inline (e.g. `"Acetaminofen 325 mg"`), parse it,
otherwise leave `concentracion` empty.

```ts
const lista_activos = form.ingredientes
  .split(',')
  .map(s => s.trim())
  .filter(Boolean)
  .map(token => {
    const m = token.match(/^(.*?)(\d.*)$/);        // "Acetaminofen 325 mg"
    return m
      ? { nombre: m[1].trim(), concentracion: m[2].trim() }
      : { nombre: token, concentracion: '' };
  });
```

---

## 5. Method label → backend group → set (CRITICAL mapping)

The UI `METHODS` labels (`src/mock/data.ts`) use accents that **do not match** the
backend `DocumentGroupName` values. The frontend MUST normalize the label before
writing the `group` field, or `agent_ui` will silently fail to resolve the file.

| UI label (`METHODS`)     | `document_groups.group` (backend) | Set(s) it triggers      | Default `document` |
|--------------------------|-----------------------------------|-------------------------|--------------------|
| `Linealidad`             | `Linealidad`                      | Set 3                   | `Reporte LIMS` |
| `Precisión del sistema`  | `Precision del sistema`           | Set 5                   | `Reporte LIMS` |
| `Precisión del método`   | `Precision del método`            | Set 6                   | `Reporte LIMS` |
| `Precisión intermedia`   | `Precision Intermedia`            | Set 7                   | `Reporte LIMS` |
| `Exactitud`              | `Exactitud`                       | Set 4                   | `Reporte LIMS` |
| `Estabilidad solución`   | `Estabilidad solución`            | Set 8                   | `Reporte LIMS` |
| `Estabilidad fase móvil` | `Estabilidad fase móvil`          | Set 10                  | `Soportes Cromatográficos` |
| `Robustez`               | `Robustez`                        | Set 12 (+ Set 11 from protocolo) | `Reporte LIMS` |
| *(step 1 protocol)*      | `Protocolo`                       | Protocolo (+ Set 11)    | `Protocolo` |
| *(step 3 hojas)*         | `Hojas de Trabajo Preparacion`    | Set 2                   | `Hojas de Trabajo Preparacion` |
| *(step 3 bitácoras)*     | `Preparacion Bitacoras`           | Set 2                   | `Preparacion Bitacoras` |

The `document` field comes from the Step 2 dropdown (`Reporte LIMS` /
`Soportes Cromatográficos`). The pair `(group, document)` is what `agent_ui` matches on.

> **Data-driven dispatch:** after the `feature/new_valida` change to `agent_ui`, only sets
> with at least one resolved document are sent to `index_node` (Protocolo always runs).
> Sets for methods the user did **not** select are skipped — no wasted OCR/LLM calls.

The exact `group`/`document` string constants live in
`Valida/src/graph/state.py` (`DocumentGroupName`, `DocumentName`) and are mirrored in
`procaps-framework-ai/src/config/valida_sets.py` (`DOC_KEY_TO_GROUP`).

---

## 6. Building `document_groups` from `WizardForm.groups`

```ts
const LABEL_TO_GROUP: Record<string, string> = {
  'Linealidad': 'Linealidad',
  'Precisión del sistema': 'Precision del sistema',
  'Precisión del método': 'Precision del método',
  'Precisión intermedia': 'Precision Intermedia',
  'Exactitud': 'Exactitud',
  'Estabilidad solución': 'Estabilidad solución',
  'Estabilidad fase móvil': 'Estabilidad fase móvil',
  'Robustez': 'Robustez',
};

const methodGroups = Object.entries(form.groups)
  .filter(([, g]) => g.selected && g.fileDescriptor)   // fileDescriptor from §3
  .map(([label, g]) => ({
    group: LABEL_TO_GROUP[label],
    document: g.doc,                                   // 'Reporte LIMS' | 'Soportes Cromatográficos'
    files: [g.fileDescriptor],
  }));
```

---

## 7. Full payload assembled at "Iniciar Validación"

```jsonc
{
  "messages": [],
  "validacion": "PRUEBA-VALIDA-DK",
  "codigo_informe": "PRO-I&D-0404-03",
  "nombre_producto": "hidrocona 10 mg + acetaminofen 325 mg",
  "codigo_producto": "400006770",
  "lista_activos": [
    { "nombre": "Acetaminofen", "concentracion": "325 mg" },
    { "nombre": "Hidrocodona",  "concentracion": "10 mg" }
  ],
  "rango_validado": "95 % - 105 %",
  "op": "stage",

  "document_groups": [
    { "group": "Protocolo", "document": "Protocolo",
      "files": [ { "name": "protocolo_validacion_hidrocodona.pdf", "content_base64": "JV...", "content_type": "application/pdf", "checksum": "a1b2c3", "size": 481233 } ] },
    { "group": "Hojas de Trabajo Preparacion", "document": "Hojas de Trabajo Preparacion",
      "files": [ { "name": "hojas_de_trabajo_solucion.pdf", "content_base64": "JV...", "checksum": "d4e5f6", "size": 95210 } ] },
    { "group": "Preparacion Bitacoras", "document": "Preparacion Bitacoras",
      "files": [ { "name": "bitacoras_preparacion.pdf", "content_base64": "JV...", "checksum": "0011aa", "size": 41022 } ] },
    { "group": "Linealidad", "document": "Reporte LIMS",
      "files": [ { "name": "reporte_lims_linealidad_hidrocodona.pdf", "content_base64": "JV...", "checksum": "77aa88", "size": 120044 } ] },
    { "group": "Estabilidad solución", "document": "Reporte LIMS",
      "files": [ { "name": "reporte_lims_estabilidad_solucion_hidrocodona.pdf", "content_base64": "JV...", "checksum": "99bb00", "size": 134900 } ] }
  ],

  "dir_protocolo": { "name": "protocolo_validacion_hidrocodona.pdf", "content_base64": "JV...", "checksum": "a1b2c3" },
  "dir_hoja_trabajo_preparacion": [ { "name": "hojas_de_trabajo_solucion.pdf", "content_base64": "JV...", "checksum": "d4e5f6" } ],
  "dirs_bitacora_preparacion": [ { "name": "bitacoras_preparacion.pdf", "content_base64": "JV...", "checksum": "0011aa" } ],
  "dir_reporte_lims_linealidad": [ { "name": "reporte_lims_linealidad_hidrocodona.pdf", "content_base64": "JV...", "checksum": "77aa88" } ],
  "dir_reporte_lims_estabilidad_solucion": [ { "name": "reporte_lims_estabilidad_solucion_hidrocodona.pdf", "content_base64": "JV...", "checksum": "99bb00" } ],

  "extraction_content": [],
  "context_for_render": [],
  "fname_out": "informe_validacion_hidrocodona.docx"
}
```

With this payload, the data-driven `agent_ui` dispatches **Protocolo, Set 2, Set 3, Set 8**
(and **Set 11**, which reads the protocol); every other set is skipped because the user
selected only Linealidad and Estabilidad solución.

---

## 8. Validation rules the wizard already enforces

- **Step 1**: all text fields + `protocolo` required (`WizardShell.next`).
- **Step 2**: at least one method selected.
- **Step 3**: `hojas` and `bitacoras` required (`CreateReport.registrar`).

These guarantee `dir_protocolo`, `dir_hoja_trabajo_preparacion`, and
`dirs_bitacora_preparacion` are always present — so **Protocolo** and **Set 2** always run.
