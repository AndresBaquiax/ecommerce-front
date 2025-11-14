import { CONFIG } from 'src/config-global';

import { DevolucionView } from 'src/sections/devoluciones/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Devoluciones - ${CONFIG.appName}`}</title>

      <DevolucionView />
    </>
  );
}
