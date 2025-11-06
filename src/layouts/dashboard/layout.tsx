import type { Breakpoint } from '@mui/material/styles';

import { merge } from 'es-toolkit';
import { useState, useEffect } from 'react';
import { useBoolean } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { useRole } from 'src/hooks/use-role';

import { CartWidget } from 'src/components/cart/cart-widget';

import { NavMobile, NavDesktop } from './nav';
import { layoutClasses } from '../core/classes';
import { _account } from '../nav-config-account';
import { dashboardLayoutVars } from './css-vars';
import { navData } from '../nav-config-dashboard';
import { MainSection } from '../core/main-section';
import { _workspaces } from '../nav-config-workspace';
import { MenuButton } from '../components/menu-button';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { ThemeToggle } from '../components/theme-toggle';
import { AccountPopover } from '../components/account-popover';
import { UserRoleDisplay } from '../components/user-role-display';

import type { MainSectionProps } from '../core/main-section';
import type { HeaderSectionProps } from '../core/header-section';
import type { LayoutSectionProps } from '../core/layout-section';

// ----------------------------------------------------------------------

type LayoutBaseProps = Pick<LayoutSectionProps, 'sx' | 'children' | 'cssVars'>;

export type DashboardLayoutProps = LayoutBaseProps & {
  layoutQuery?: Breakpoint;
  slotProps?: {
    header?: HeaderSectionProps;
    main?: MainSectionProps;
  };
};

export function DashboardLayout({
  sx,
  cssVars,
  children,
  slotProps,
  layoutQuery = 'lg',
}: DashboardLayoutProps) {
  const theme = useTheme();
  const router = useRouter();
  const { filterRoutesByRole } = useRole();

  const { value: open, onFalse: onClose, onTrue: onOpen } = useBoolean();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Filtrar elementos de navegación según el rol
  const filteredNavData = filterRoutesByRole(navData);

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  // Verificar autenticación
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/sign-in');
    }
  }, [router]);

  const renderHeader = () => {
    const headerSlotProps: HeaderSectionProps['slotProps'] = {
      container: {
        maxWidth: false,
      },
    };

    const headerSlots: HeaderSectionProps['slots'] = {
      topArea: (
        <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
          This is an info Alert.
        </Alert>
      ),
      leftArea: (
        <>
          {/** @slot Nav mobile */}
          <MenuButton
            onClick={onOpen}
            sx={{ 
              mr: 1, 
              ml: -1, 
              [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
              '&:hover': {
                transform: 'scale(1.05)',
              },
              transition: 'transform 0.2s ease'
            }}
          />
          <NavMobile data={filteredNavData} open={open} onClose={onClose} workspaces={_workspaces} />
        </>
      ),
      rightArea: (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 } }}>
          {/** @slot User Role */}
          <UserRoleDisplay />

          {/** @slot Theme toggle */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {/* Theme toggle button (CSS-only theme switch) */}
            <ThemeToggle />
          </Box>

          {/** @slot Cart widget */}
          <CartWidget />

          {/** @slot Account drawer */}
          <AccountPopover data={_account} />
        </Box>
      ),
    };

    return (
      <HeaderSection
        disableElevation
        layoutQuery={layoutQuery}
        {...slotProps?.header}
        slots={{ ...headerSlots, ...slotProps?.header?.slots }}
        slotProps={merge(headerSlotProps, slotProps?.header?.slotProps ?? {})}
        sx={slotProps?.header?.sx}
      />
    );
  };

  const renderFooter = () => null;

  const renderMain = () => <MainSection {...slotProps?.main}>{children}</MainSection>;

  return (
    <LayoutSection
      /** **************************************
       * @Header
       *************************************** */
      headerSection={renderHeader()}
      /** **************************************
       * @Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop 
          data={filteredNavData} 
          layoutQuery={layoutQuery} 
          workspaces={_workspaces}
          collapsed={sidebarCollapsed}
          onToggleCollapse={handleToggleSidebar}
        />
      }
      /** **************************************
       * @Footer
       *************************************** */
      footerSection={renderFooter()}
      /** **************************************
       * @Styles
       *************************************** */
      cssVars={{ ...dashboardLayoutVars(theme), ...cssVars }}
      sx={[
        {
          [`& .${layoutClasses.sidebarContainer}`]: {
            [theme.breakpoints.up(layoutQuery)]: {
              pl: sidebarCollapsed ? 'var(--layout-nav-collapsed-width)' : 'var(--layout-nav-vertical-width)',
              transition: theme.transitions.create(['padding-left'], {
                easing: theme.transitions.easing.easeInOut,
                duration: theme.transitions.duration.standard,
              }),
            },
          },
          // Efecto de fondo: dejar transparente para que el <body> controle los fondos temáticos
          background: 'transparent',
          minHeight: '100vh',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {renderMain()}
    </LayoutSection>
  );
}