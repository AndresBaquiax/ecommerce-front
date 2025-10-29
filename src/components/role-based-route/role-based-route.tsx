import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import { useRole } from 'src/hooks/use-role';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  requiredPath: string;
}

export function RoleBasedRoute({ children, requiredPath }: RoleBasedRouteProps) {
  const router = useRouter();
  const location = useLocation();
  const { hasAccess, userRole, getDefaultRoute } = useRole();

  useEffect(() => {
    if (userRole) {
      // Si el usuario es Cliente y está en la ruta raíz, redirigir a su ruta por defecto
      if (requiredPath === '/' && userRole === 'Cliente') {
        router.push(getDefaultRoute);
        return;
      }
      
      // Si no tiene acceso a la ruta actual, redirigir a su ruta por defecto
      if (!hasAccess(requiredPath)) {
        router.push(getDefaultRoute);
      }
    }
  }, [userRole, hasAccess, requiredPath, router, getDefaultRoute]);

  if (!userRole) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si es Cliente en la ruta raíz, no mostrar contenido (se está redirigiendo)
  if (userRole === 'Cliente' && requiredPath === '/') {
    return null;
  }

  if (!hasAccess(requiredPath)) {
    return null;
  }

  return <>{children}</>;
}
