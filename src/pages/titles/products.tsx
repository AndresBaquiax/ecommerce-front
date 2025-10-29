import { CONFIG } from 'src/config-global';

import { ProductsView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Tienda - ${CONFIG.appName}`}</title>

      <ProductsView />
    </>
  );
}
