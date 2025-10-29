import { CONFIG } from 'src/config-global';

import { HistorialComprasView } from 'src/sections/historial-compras/historial-compras-view';

// ----------------------------------------------------------------------

export default function HistorialComprasPage() {
  return (
    <>
      <title>{`Historial de Compras - ${CONFIG.appName}`}</title>

      <HistorialComprasView />
    </>
  );
}
