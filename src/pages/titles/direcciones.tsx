import { CONFIG } from 'src/config-global';
import { DireccionesView } from 'src/pages/views/direcciones';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Direcciones - ${CONFIG.appName}`}</title>

      <DireccionesView />
    </>
  );
}
