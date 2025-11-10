import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useEffect } from 'react';
import { varAlpha } from 'minimal-shared/utils';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import { useTheme } from '@mui/material/styles';
import ListItemButton from '@mui/material/ListItemButton';
import Drawer, { drawerClasses } from '@mui/material/Drawer';

import { usePathname } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useAuth } from 'src/hooks/use-auth';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import type { NavItem } from '../nav-config-dashboard';
import type { WorkspacesPopoverProps } from '../components/workspaces-popover';

// ----------------------------------------------------------------------

export type NavContentProps = {
  data: NavItem[];
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
  workspaces: WorkspacesPopoverProps['data'];
  sx?: SxProps<Theme>;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
};

export function NavDesktop({
  sx,
  data,
  slots,
  workspaces,
  layoutQuery,
  collapsed = false,
  onToggleCollapse,
}: NavContentProps & { layoutQuery: Breakpoint }) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        pt: 2.5,
        px: collapsed ? 1 : 2.5,
        top: 0,
        left: 0,
        height: 1,
        display: 'none',
        position: 'fixed',
        flexDirection: 'column',
        zIndex: 'var(--layout-nav-zIndex)',
        width: collapsed ? 'var(--layout-nav-collapsed-width)' : 'var(--layout-nav-vertical-width)',
        background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%) !important',
        boxShadow: '4px 0 20px rgba(33, 150, 243, 0.15)',
        borderRight: 'none',
        [theme.breakpoints.up(layoutQuery)]: {
          display: 'flex',
        },
        transition: theme.transitions.create(['width', 'padding'], {
          duration: theme.transitions.duration.standard,
          easing: theme.transitions.easing.easeInOut,
        }),
        ...sx,
      }}
    >
      <NavContent 
        data={data} 
        slots={slots} 
        workspaces={workspaces} 
        collapsed={collapsed}
        onToggleCollapse={onToggleCollapse}
      />
    </Box>
  );
}

// ----------------------------------------------------------------------

export function NavMobile({
  sx,
  data,
  open,
  slots,
  onClose,
  workspaces,
}: NavContentProps & { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      sx={{
        [`& .${drawerClasses.paper}`]: {
          pt: 2.5,
          px: 2.5,
          overflow: 'unset',
          width: 'var(--layout-nav-mobile-width)',
          background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%) !important',
          ...sx,
        },
      }}
    >
      <NavContent data={data} slots={slots} workspaces={workspaces} />
    </Drawer>
  );
}

// ----------------------------------------------------------------------

export function NavContent({ data, slots, workspaces, sx, collapsed = false, onToggleCollapse }: NavContentProps) {
  const pathname = usePathname();
  const muiTheme = useTheme();
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: collapsed ? 'center' : 'flex-start', 
        mb: 2,
        px: collapsed ? 0 : 1 
      }}>
        <Logo />
      </Box>

      {slots?.topArea}

      <Scrollbar fillContent>
        <Box
          component="nav"
          sx={[
            {
              display: 'flex',
              flex: '1 1 auto',
              flexDirection: 'column',
            },
            ...(Array.isArray(sx) ? sx : [sx]),
          ]}
        >
          <Box
            component="ul"
            sx={{
              gap: 0.5,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {data
              .filter((item) => {
                  // ocultar items que requieran auth si no hay sesión
                  const { requiresAuth } = item as any;
                  if (requiresAuth && !isAuthenticated) return false;
                  return true;
                })
              .map((item) => {
              const isActived = item.path === pathname;

              return (
                <ListItem disableGutters disablePadding key={item.title}>
                  <ListItemButton
                    disableGutters
                    component={RouterLink}
                    href={item.path}
                    sx={[
                      (theme) => ({
                        pl: collapsed ? 1 : 2,
                        py: 1,
                        gap: collapsed ? 0 : 2,
                        pr: collapsed ? 1 : 1.5,
                        borderRadius: 2,
                        typography: 'body2',
                        fontWeight: 'fontWeightMedium',
                        color: 'rgba(255, 255, 255, 0.9)',
                        minHeight: 44,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        transition: theme.transitions.create([
                          'padding', 'gap', 'justify-content', 'background-color', 'transform'
                        ], {
                          duration: theme.transitions.duration.standard,
                          easing: theme.transitions.easing.easeInOut,
                        }),
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          transform: 'translateX(4px)',
                          color: '#FFFFFF',
                        },
                        ...(isActived && {
                          fontWeight: 'fontWeightSemiBold',
                          color: '#FFFFFF',
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                          borderLeft: '4px solid #FFC107',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.2)',
                            transform: 'translateX(4px)',
                          },
                        }),
                      }),
                    ]}
                    title={collapsed ? item.title : undefined}
                  >
                    <Box 
                      component="span" 
                      sx={{ 
                        width: 24, 
                        height: 24, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: isActived ? '#FFC107' : 'rgba(255, 255, 255, 0.8)'
                      }}
                    >
                      {item.icon}
                    </Box>

                    {!collapsed && (
                      <Box 
                        component="span" 
                        sx={{ 
                          flexGrow: 1,
                          opacity: collapsed ? 0 : 1,
                          transition: muiTheme.transitions.create(['opacity'], {
                            duration: muiTheme.transitions.duration.standard,
                            easing: muiTheme.transitions.easing.easeInOut,
                          }),
                        }}
                      >
                        {item.title}
                      </Box>
                    )}

                    {!collapsed && item.info && (
                      <Box
                        sx={{
                          opacity: collapsed ? 0 : 1,
                          transition: muiTheme.transitions.create(['opacity'], {
                            duration: muiTheme.transitions.duration.standard,
                            easing: muiTheme.transitions.easing.easeInOut,
                          }),
                        }}
                      >
                        {item.info}
                      </Box>
                    )}
                  </ListItemButton>
                </ListItem>
              );
            })}
          </Box>
        </Box>
      </Scrollbar>

      {slots?.bottomArea}

      {onToggleCollapse && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: collapsed ? 'center' : 'flex-start',
            mt: 2,
            pb: 2,
            px: collapsed ? 0 : 1,
          }}
        >
          <Box
            component="button"
            onClick={onToggleCollapse}
            sx={{
              p: 1,
              border: 'none',
              borderRadius: 2,
              cursor: 'pointer',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.9)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                transform: 'scale(1.05)',
              },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              transition: 'all 0.3s ease',
            }}
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <Box
              component="span"
              className="material-icons"
              sx={{ 
                fontSize: 20,
                transition: 'transform 0.3s ease'
              }}
            >
              {collapsed ? 'chevron_right' : 'chevron_left'}
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}