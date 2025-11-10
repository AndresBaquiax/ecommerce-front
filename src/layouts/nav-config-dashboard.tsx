import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

// Función para generar íconos con colores modernos
const icon = (name: string) => (
  <SvgColor 
    src={`/assets/icons/navbar/${name}.svg`} 
    sx={{ 
      width: 24, 
      height: 24,
      // Color moderno para íconos
      color: 'rgba(255, 255, 255, 0.9)'
    }} 
  />
);

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
    // visible sin autenticación
    public: true,
    icon: icon('ic--twotone-add-shopping-cart'),
    info: (
      <Label 
        color="warning" 
        variant="filled"
        sx={{
          background: 'linear-gradient(135deg, #FFC107, #FF9800)',
          color: '#1C252E',
          fontWeight: 'bold',
          fontSize: '0.75rem',
          minWidth: 24,
          height: 20,
          borderRadius: 10,
          boxShadow: '0 2px 8px rgba(255, 193, 7, 0.3)'
        }}
      >
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
    // Mostrar solo si el usuario está autenticado
    requiresAuth: true,
  },
  {
    title: 'Historial de Compras',
    path: '/registrocompras',
    icon: icon('material-symbols--order-approve'),
    // Mostrar solo si el usuario está autenticado
    requiresAuth: true,
  },
];