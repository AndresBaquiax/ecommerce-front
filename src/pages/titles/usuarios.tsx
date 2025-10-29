import { CONFIG } from 'src/config-global';
import UsuariosView from 'src/pages/views/usuarios';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Usuarios - ${CONFIG.appName}`}</title>
      <UsuariosView />
    </>
  );
}
