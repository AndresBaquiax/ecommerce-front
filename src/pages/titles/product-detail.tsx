import { CONFIG } from 'src/config-global';

import { ProductDetailView } from 'src/sections/product/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Product Detail - ${CONFIG.appName}`}</title>

      <ProductDetailView />
    </>
  );
}
