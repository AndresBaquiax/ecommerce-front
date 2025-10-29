import { CONFIG } from 'src/config-global';
import CategoriasView from 'src/pages/views/categorias';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Categorías - ${CONFIG.appName}`}</title>

      <CategoriasView />
    </>
  );
}
