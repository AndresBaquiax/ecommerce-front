import { CONFIG } from 'src/config-global';

import ProveedoresView from '../views/proveedores';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Proveedores - ${CONFIG.appName}`}</title>

      <ProveedoresView />
    </>
  );
}
