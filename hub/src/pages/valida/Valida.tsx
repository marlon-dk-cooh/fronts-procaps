// VALIDA corre con su propio stack (React 19 + Tailwind 4 + Vite 8), que es
// incompatible con el del hub (React 18 + Tailwind 3). Para no mezclar bundles
// lo montamos aislado en un <iframe>: en dev el proxy de Vite manda /valida-app
// al dev server de VALIDA; en prod nginx sirve su build desde /valida-app/.
export function Valida() {
  return (
    <iframe
      src="/valida-app/"
      title="VALIDA"
      className="w-full h-screen border-0"
    />
  );
}
