import { CONFIG } from 'src/config-global';

import { CartView } from 'src/sections/cart/cart-view';

// ----------------------------------------------------------------------

export default function CartPage() {
  return (
    <>
      <title>{`Carrito - ${CONFIG.appName}`}</title>

      <CartView />
    </>
  );
}
