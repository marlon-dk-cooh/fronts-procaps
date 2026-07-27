import type { Report, DocumentGroup } from '../interface/Report';

export const INITIAL_REPORTS: Report[] = [
  { id: 'TEST-001', name: 'PRUEBA-VALIDA-DK', product: 'Producto de prueba', date: '18 Jun 2026', status: 'en_cola', hasWord: false },
  { id: 'PRO-I&D-0404-03', name: 'Validación del método analítico de valoración de Hidrocodona y acetaminofén en producto terminado Hidrocona 10 mg + Acetaminofén 325 mg', product: 'Hidrocona 10mg + Acet. 325mg', date: '12 Jun 2026', status: 'terminado', hasWord: true },
  { id: 'REP-I&D-0868', name: 'Validación del método analítico de contenido de Sorbato de Potasio en CMC Sod. 0.5% Lubriyet Sol OFT ST', product: 'CMC Sod. 0.5% Lubriyet', date: '10 Jun 2026', status: 'terminado', hasWord: true },
  { id: 'REP-I&D-0561', name: 'Determinación de impurezas de Dienogest y Estradiol en producto terminado Dienogest 2 + Estradiol Hemihid 1.5 Tab', product: 'Dienogest 2 + Estradiol 1.5', date: '09 Jun 2026', status: 'procesando', hasWord: false },
  { id: 'REP-I&D-0853', name: 'Valoración y uniformidad de contenido de Ácido Fólico por HPLC en Fumarato Ferroso 330 mg + Ácido Fólico 1 mg + Vitamina C 100 mg Tab', product: 'Fumarato Ferroso + Ác. Fólico', date: '08 Jun 2026', status: 'error', hasWord: false },
];

export const SAMPLE_GROUPS: DocumentGroup[] = [
  { name: 'Linealidad', doc: 'Reporte LIMS', files: 2 },
  { name: 'Exactitud', doc: 'Reporte LIMS', files: 2 },
  { name: 'Precisión del método', doc: 'Reporte LIMS', files: 1 },
  { name: 'Precisión intermedia', doc: 'Reporte LIMS', files: 1 },
  { name: 'Estabilidad solución', doc: 'Reporte LIMS', files: 1 },
  { name: 'Robustez', doc: 'Reporte LIMS', files: 1 },
  { name: 'Estabilidad fase móvil', doc: 'Soportes Cromatográficos', files: 3 },
];

export const METHODS = [
  'Linealidad', 'Precisión del sistema', 'Precisión del método',
  'Precisión intermedia', 'Exactitud', 'Estabilidad solución',
  'Estabilidad fase móvil', 'Robustez',
];
