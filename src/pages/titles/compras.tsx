
import { CONFIG } from 'src/config-global';
import ComprasView from 'src/pages/views/compras';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Compras - ${CONFIG.appName}`}</title>
      
      <ComprasView />
    </>
  );
}
