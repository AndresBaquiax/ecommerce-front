import { Iconify } from 'src/components/iconify';

import type { AccountPopoverProps } from './components/account-popover';

// ----------------------------------------------------------------------

export const _account: AccountPopoverProps['data'] = [
  {
    label: 'Perfil',
    href: '/profile',
    icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
  },
];
