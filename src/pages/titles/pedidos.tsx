import { CONFIG } from 'src/config-global';
import PedidosView from 'src/pages/views/pedidos';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Pedidos - ${CONFIG.appName}`}</title>

      <PedidosView />
    </>
  );
}
