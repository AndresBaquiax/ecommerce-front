import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';
import { varAlpha } from 'minimal-shared/utils';
import { Outlet, Navigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { ProtectedRoute } from 'src/components/protected-route';
import { RoleBasedRoute } from 'src/components/role-based-route';

// ----------------------------------------------------------------------
// Pages
export const DashboardPage = lazy(() => import('src/pages/titles/dashboard'));
export const BlogPage = lazy(() => import('src/pages/titles/blog'));
export const UserPage = lazy(() => import('src/pages/titles/user'));
export const ProfilePage = lazy(() => import('src/pages/titles/profile'));
export const SignInPage = lazy(() => import('src/pages/titles/sign-in'));
export const SignUpPage = lazy(() => import('src/pages/titles/sign-up'));
export const ProductsPage = lazy(() => import('src/pages/titles/products'));
export const ProductDetailPage = lazy(() => import('src/pages/titles/product-detail'));
export const CartPage = lazy(() => import('src/pages/titles/cart'));
export const ComprasPage = lazy(() => import('src/pages/titles/compras'));
export const CategoriasPage = lazy(() => import('src/pages/titles/categorias'));
export const PedidosPage = lazy(() => import('src/pages/titles/pedidos'));
export const DireccionesPage = lazy(() => import('src/pages/titles/direcciones'));
export const Page404 = lazy(() => import('src/pages/titles/page-not-found'));
export const UsersPage = lazy(() => import('src/pages/views/productos'));
export const ProvidersPage = lazy(() => import('src/pages/titles/proveedores'));
export const UsersPage2 = lazy(() => import('src/pages/titles/usuarios'));
export const CRUDProductos = lazy(() => import('src/pages/views/productos'));
export const HistorialComprasPage = lazy(() => import('src/pages/titles/historial-compras'));

// ----------------------------------------------------------------------
// Loader Fallback
const renderFallback = () => (
  <Box
    sx={{
      display: 'flex',
      flex: '1 1 auto',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

// ----------------------------------------------------------------------
// Routes
export const routesSection: RouteObject[] = [
  // Public entry: redirect root to shopping
  {
    index: true,
    element: <Navigate to="/shopping" replace />,
  },

  // Public shopping route (show DashboardLayout but without auth gating)
  {
    path: 'shopping',
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <ProductsPage />
        </Suspense>
      </DashboardLayout>
    ),
  },
  // Public products routes: allow viewing list and details without login
  {
    path: 'products',
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <ProductsPage />
        </Suspense>
      </DashboardLayout>
    ),
  },
  {
    path: 'products/:id',
    element: (
      <DashboardLayout>
        <Suspense fallback={renderFallback()}>
          <ProductDetailPage />
        </Suspense>
      </DashboardLayout>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout>
          <Suspense fallback={renderFallback()}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      </ProtectedRoute>
    ),
    children: [
      { 
        index: true, 
        element: (
          <RoleBasedRoute requiredPath="/">
            <DashboardPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'user', 
        element: (
          <RoleBasedRoute requiredPath="/user">
            <UserPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'profile', 
        element: (
          <RoleBasedRoute requiredPath="/profile">
            <ProfilePage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'shopping', 
        element: (
          <RoleBasedRoute requiredPath="/shopping">
            <ProductsPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'products', 
        element: (
          <RoleBasedRoute requiredPath="/products">
            <ProductsPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'products/:id', 
        element: (
          <RoleBasedRoute requiredPath="/products">
            <ProductDetailPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'cart', 
        element: (
          <RoleBasedRoute requiredPath="/cart">
            <CartPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'compras', 
        element: (
          <RoleBasedRoute requiredPath="/compras">
            <ComprasPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'categorias', 
        element: (
          <RoleBasedRoute requiredPath="/categorias">
            <CategoriasPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'direcciones', 
        element: (
          <RoleBasedRoute requiredPath="/direcciones">
            <DireccionesPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'pedidos', 
        element: (
          <RoleBasedRoute requiredPath="/pedidos">
            <PedidosPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'blog', 
        element: (
          <RoleBasedRoute requiredPath="/blog">
            <BlogPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'users', 
        element: (
          <RoleBasedRoute requiredPath="/users">
            <UsersPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'usuarios', 
        element: (
          <RoleBasedRoute requiredPath="/usuarios">
            <UsersPage2 />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'productos', 
        element: (
          <RoleBasedRoute requiredPath="/productos">
            <CRUDProductos />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'proveedores', 
        element: (
          <RoleBasedRoute requiredPath="/proveedores">
            <ProvidersPage />
          </RoleBasedRoute>
        ) 
      },
      { 
        path: 'registrocompras', 
        element: (
          <RoleBasedRoute requiredPath="/registrocompras">
            <HistorialComprasPage />
          </RoleBasedRoute>
        ) 
      },
    ],
  },
  {
    path: 'sign-in',
    element: (
      <AuthLayout>
        <SignInPage />
      </AuthLayout>
    ),
  },
  {
    path: 'sign-up',
    element: (
      <AuthLayout>
        <SignUpPage />
      </AuthLayout>
    ),
  },
  { path: '404', element: <Page404 /> },
  { path: '*', element: <Page404 /> },
];
