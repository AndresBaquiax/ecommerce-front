import { useMemo } from 'react';

import { useAuth } from './use-auth';

export type UserRole = 'Analista' | 'Compras' | 'Administrador' | 'Cliente';

// Configuración de rutas permitidas por rol
const ROLE_ROUTES: Record<UserRole, string[]> = {
  Analista: [
    '/',           
    '/user',       
    '/profile'
  ],
  Compras: [            
    '/user',         
    '/compras',      
    '/pedidos',
    '/profile'
  ],
  Cliente: [
    '/shopping',
    '/products',
    '/cart',
    '/profile',
    '/direcciones',
    '/registrocompras'
  ],
  Administrador: [] // Sin restricciones
};

// Ruta por default
const DEFAULT_ROUTES: Record<UserRole, string> = {
  Analista: '/',
  Compras: '/compras',
  Cliente: '/shopping',
  Administrador: '/'
};

export function useRole() {
  const { user } = useAuth();

  const userRole = useMemo(() => {
    if (!user?.rol) return null;
    return user.rol as UserRole;
  }, [user]);

  const hasAccess = useMemo(() => (path: string): boolean => {
    if (!userRole) return false;
    
    // Administrador tiene acceso a todo
    if (userRole === 'Administrador') return true;
    
    // Verificar si la ruta está permitida para el rol
    const allowedRoutes = ROLE_ROUTES[userRole];
    
    // Para rutas dinámicas como /products/:id, verificar la ruta base
    const basePath = path.split('/')[1] ? `/${path.split('/')[1]}` : path;
    
    return allowedRoutes.includes(path) || allowedRoutes.includes(basePath);
  }, [userRole]);

  const filterRoutesByRole = useMemo(() => (routes: any[]): any[] => {
    if (!userRole) return [];
    
    // Administrador ve todas las rutas
    if (userRole === 'Administrador') return routes;
    
    // Filtrar rutas según el rol
    const allowedRoutes = ROLE_ROUTES[userRole];
    return routes.filter(route => allowedRoutes.includes(route.path));
  }, [userRole]);

  const getDefaultRoute = useMemo(() => {
    if (!userRole) return '/';
    return DEFAULT_ROUTES[userRole];
  }, [userRole]);

  return {
    userRole,
    hasAccess,
    filterRoutesByRole,
    getDefaultRoute
  };
}
