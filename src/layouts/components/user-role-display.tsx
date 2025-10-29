import type { BoxProps } from '@mui/material/Box';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { alpha, useTheme } from '@mui/material/styles';

import { useAuth } from 'src/hooks/use-auth';

// ----------------------------------------------------------------------

export function UserRoleDisplay({ sx, ...other }: BoxProps) {
  const theme = useTheme();
  const { user } = useAuth();

  if (!user?.rol) {
    return null;
  }

  // Colores según el rol
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Analista':
        return '#1976d2'; // Azul
      case 'Compras':
        return '#d32f2f'; // Rojo
      case 'Cliente':
        return '#2e7d32'; // Verde
      case 'Administrador':
        return '#7b1fa2'; // Púrpura
      default:
        return '#757575'; // Gris
    }
  };

  const roleColor = getRoleColor(user.rol);

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          mr: 1,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...other}
    >
      <Chip
        label={user.rol}
        size="small"
        sx={{
          height: 26,
          fontSize: 12,
          fontWeight: 600,
          bgcolor: roleColor,
          color: 'white',
          '&:hover': {
            bgcolor: alpha(roleColor, 0.8),
          },
        }}
      />
    </Box>
  );
}
