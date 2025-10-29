import path from 'path';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: 'Dashboard de reportes',
    path: '/',
    icon: icon('ic-analytics'),
  },
  {
    title: 'Tienda en linea',
    path: '/shopping',
    icon: icon('ic--twotone-add-shopping-cart'),
    info: (
      <Label color="error" variant="inverted">
        +9
      </Label>
    ),
  },
  {
    title: 'Productos',
    path: '/productos',
    icon: icon('ic--baseline-shopping-bag'),
  },
  {
    title: 'Compras',
    path: '/compras',
    icon: icon('material-symbols--shopping-bag-speed'), 
  },
  {
    title: 'Proveedores',
    path: '/proveedores',
    icon: icon('material-symbols--folder-supervised'), 
  },
  {
    title: 'Categorías',
    path: '/categorias',
    icon: icon('material-symbols--category-search-rounded'), 
  },
  {
    title: 'Pedidos',
    path: '/pedidos',
    icon: icon('material-symbols--order-approve'), 
  },
  {
    title: 'Usuarios',
    path: '/usuarios',
    icon: icon('ic-user'), 
  },
  {
    title: 'Direcciones',
    path: '/direcciones',
    icon: icon('material-symbols--move-location-rounded'),
  },
  {
    title: 'Historial de Compras',
    path: '/registrocompras',
    icon: icon('material-symbols--order-approve'),
  },
];