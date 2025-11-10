/* eslint-disable perfectionist/sort-imports */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import { styled } from '@mui/material/styles';
import DialogActions from '@mui/material/DialogActions';
import Divider from '@mui/material/Divider';
import Popover from '@mui/material/Popover';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { useAuth } from 'src/hooks/use-auth';
import { useCart } from 'src/context/CartContext';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

const StyledRoot = styled('div')(({ theme }) => ({
  marginRight: theme.spacing(1.5),
}));

export function CartWidget() {
  const { cartItems } = useCart();
  const navigate = useNavigate();
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { isAuthenticated } = useAuth();

  // Estado para el prompt de autenticación desde el widget
  const [openAuthPrompt, setOpenAuthPrompt] = useState(false);

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleGoToCart = () => {
    handleClose();
    // Si el usuario no está autenticado, mostrar modal para iniciar sesión/registrarse
    if (!isAuthenticated) {
      try {
        localStorage.setItem('guest_cart', JSON.stringify(cartItems));
      } catch (err) {
        console.warn('No se pudo guardar el carrito en localStorage', err);
      }
      setOpenAuthPrompt(true);
      return;
    }

    navigate('/cart');
  };

  const open = Boolean(anchorEl);

  if (totalItems === 0) {
    return null;
  }

  return (
    <>
      <StyledRoot>
        <IconButton onClick={handleOpen}>
          <Badge showZero badgeContent={totalItems} color="error" max={99}>
            <Iconify icon="solar:cart-3-bold" width={24} />
          </Badge>
        </IconButton>
      </StyledRoot>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            padding: 0,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Carrito</Typography>
          <Typography variant="body2" color="text.secondary">
            {totalItems} items
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Scrollbar sx={{ height: cartItems.length > 3 ? 320 : 'auto' }}>
          {cartItems.length === 0 ? (
            <Typography sx={{ p: 3, textAlign: 'center' }}>Tu carrito está vacío.</Typography>
          ) : (
            cartItems.map((item) => (
              <Box key={item.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                <Box
                  component="img"
                  src={item.coverUrl}
                  alt={item.name}
                  sx={{ width: 64, height: 64, borderRadius: 1, objectFit: 'cover' }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" noWrap>
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad: {item.quantity}
                  </Typography>
                </Box>
                <Typography variant="subtitle2">{fCurrency(item.price * item.quantity)}</Typography>
              </Box>
            ))
          )}
        </Scrollbar>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              Subtotal
            </Typography>
            <Typography variant="subtitle1">{fCurrency(subtotal)}</Typography>
          </Box>
          <Button fullWidth variant="contained" size="large" onClick={handleGoToCart}>
            Pagar
          </Button>
        </Box>
      </Popover>

      {/* Dialog para pedir autenticación si el usuario no está logueado */}
      <Dialog open={openAuthPrompt} onClose={() => setOpenAuthPrompt(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Necesitas iniciar sesión</DialogTitle>
        <DialogContent>
          <Typography>
            Para completar la compra debes iniciar sesión o crear una cuenta. ¿Deseas iniciar sesión ahora?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button variant="outlined" onClick={() => setOpenAuthPrompt(false)}>Cancelar</Button>
          <Button variant="contained" onClick={() => navigate('/sign-in?next=/cart')}>Iniciar sesión</Button>
          <Button variant="text" onClick={() => navigate('/sign-up?next=/cart')}>Registrarse</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
