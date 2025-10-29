import { CONFIG } from 'src/config-global';

import { ProfileView } from 'src/sections/user/view';

// ----------------------------------------------------------------------

export default function ProfilePage() {
  return (
    <>
      <title>{`Mi Perfil - ${CONFIG.appName}`}</title>

      <ProfileView />
    </>
  );
}
