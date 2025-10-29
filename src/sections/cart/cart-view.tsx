import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Radio from '@mui/material/Radio';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import RadioGroup from '@mui/material/RadioGroup';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControlLabel from '@mui/material/FormControlLabel';
import CircularProgress from '@mui/material/CircularProgress';

import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';
import { useCart } from 'src/context/CartContext';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

export function CartView() {
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{ factura_id: number | string; productos: any[] } | null>(null);
  
  // Estados para el modal de pago
  const [openPaymentModal, setOpenPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [cardData, setCardData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: ''
  });
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleContinueShopping = () => {
    navigate('/shopping');
  };

  const handleOpenPaymentModal = () => {
    setLoading(false); // Resetear loading al abrir el modal
    setOpenPaymentModal(true);
  };

  const handleClosePaymentModal = () => {
    setOpenPaymentModal(false);
    setPaymentMethod('efectivo');
    setCardData({
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvv: ''
    });
  };

  const handlePaymentMethodChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentMethod(event.target.value);
  };

  const handleCardDataChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;

    if (field === 'cardNumber') {
      // Remover espacios y caracteres no numéricos
      value = value.replace(/\s/g, '').replace(/\D/g, '');
      
      // Limitar a 16 dígitos
      value = value.substring(0, 16);
      
      // Formatear en grupos de 4 (ej: 1234 5678 9012 3456)
      value = value.match(/.{1,4}/g)?.join(' ') || value;
    } else if (field === 'expiryDate') {
      // Remover caracteres no numéricos excepto /
      value = value.replace(/[^\d/]/g, '');
      
      // Remover slashes existentes para reformatear
      const digitsOnly = value.replace(/\//g, '');
      
      // Limitar a 4 dígitos
      const limitedDigits = digitsOnly.substring(0, 4);
      
      // Formatear automáticamente MM/AA
      if (limitedDigits.length >= 2) {
        value = limitedDigits.substring(0, 2) + '/' + limitedDigits.substring(2);
      } else {
        value = limitedDigits;
      }
    } else if (field === 'cvv') {
      // Solo números para CVV, máximo 3 dígitos
      value = value.replace(/\D/g, '');
      value = value.substring(0, 3);
    }

    setCardData({ ...cardData, [field]: value });
  };

  const validateCardData = () => {
    if (paymentMethod === 'efectivo') return true;
    
    // Remover espacios del número de tarjeta para validar
    const cardNumberDigits = cardData.cardNumber.replace(/\s/g, '');
    
    // Validaciones básicas de tarjeta
    if (!cardNumberDigits || cardNumberDigits.length !== 16) {
      alert('Número de tarjeta inválido. Debe tener 16 dígitos');
      return false;
    }
    
    // Validar que sea un número válido usando expresión regular
    if (!/^\d{16}$/.test(cardNumberDigits)) {
      alert('El número de tarjeta solo debe contener dígitos');
      return false;
    }
    
    if (!cardData.cardName || cardData.cardName.trim() === '') {
      alert('Nombre del titular requerido');
      return false;
    }
    
    if (!cardData.expiryDate || !/^\d{2}\/\d{2}$/.test(cardData.expiryDate)) {
      alert('Fecha de expiración inválida (formato: MM/AA)');
      return false;
    }
    
    // Validar que el mes sea válido (01-12)
    const month = parseInt(cardData.expiryDate.substring(0, 2));
    if (month < 1 || month > 12) {
      alert('Mes inválido. Debe estar entre 01 y 12');
      return false;
    }
    
    if (!cardData.cvv || cardData.cvv.length < 3) {
      alert('CVV inválido');
      return false;
    }
    
    return true;
  };

  const handleConfirmPayment = () => {
    if (validateCardData()) {
      handleClosePaymentModal();
      handlePurchase();
    }
  };

  // Función para decodificar JWT
  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decodificando JWT:', error);
      return null;
    }
  };

  const handlePurchase = async () => {
    setLoading(true);
    
    try {
      // Obtener token y decodificar para obtener id_direccion
      const token = localStorage.getItem('token');
      if (!token) {
        alert('No hay sesión activa');
        setLoading(false);
        return;
      }

      const decodedToken = decodeJWT(token);
      if (!decodedToken || !decodedToken.id_direccion) {
        alert('Token inválido o sin dirección asociada');
        setLoading(false);
        return;
      }

      // Obtener inventario y productos para mapear id_inventario
      const [inventarioResponse, productosResponse] = await Promise.all([
        api.get<any[]>('/inventario'),
        api.get<any[]>('/productos')
      ]);

      // Crear mapa de productos por id_producto
      const productosMap = new Map();
      productosResponse.forEach((producto: any) => {
        productosMap.set(producto.id_producto, producto);
      });

      // Mapear cartItems a productos con id_inventario
      const productosVenta = [];
      
      for (const cartItem of cartItems) {
        // Buscar en el inventario el item que coincida con el nombre del producto del carrito
        const inventarioItem = inventarioResponse.find((inv: any) => {
          const producto = inv.producto;
          return producto && producto.nombre === cartItem.name;
        });

        if (inventarioItem) {
          productosVenta.push({
            id_inventario: inventarioItem.id_inventario,
            cantidad: cartItem.quantity,
            precio_unitario: Number(cartItem.price) // Convertir a número
          });
        } else {
          console.warn(`No se encontró inventario para el producto: ${cartItem.name}`);
        }
      }

      if (productosVenta.length === 0) {
        alert('No se pudieron mapear los productos del carrito con el inventario');
        setLoading(false);
        return;
      }

      const currentDate = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      
      const purchaseData = {
        tipo: "Venta",
        fecha: currentDate,
        id_direccion: decodedToken.id_direccion,
        productos: productosVenta
      };

      const response = await api.post<{ factura_id: number }>('/ventas', purchaseData);

      if (response) {
        setInvoiceData({
          factura_id: response.factura_id || 'N/A',
          productos: cartItems
        });
        setShowInvoice(true);
        clearCart(); // Limpiar el carrito después de la compra exitosa
      } else {
        alert('Error al procesar la compra');
      }
    } catch (error: any) {
      console.error('Error:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Error desconocido';
      alert(`Error al procesar la compra: ${errorMessage}`);
      setLoading(false); // Asegurar que loading se resetee en error
    } finally {
      setLoading(false);
    }
  };

  // Vista de factura
  if (showInvoice && invoiceData) {
    return (
      <Container maxWidth="md">
        <Card sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 2, color: 'success.main' }}>
              ¡Compra Exitosa!
            </Typography>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Factura ID: {invoiceData.factura_id}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tu compra ha sido procesada correctamente
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" sx={{ mb: 3 }}>
            Productos Comprados:
          </Typography>

          {invoiceData.productos.map((item, index) => (
            <Box key={item.id} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'background.neutral', borderRadius: 1 }}>
                <Box
                  component="img"
                  src={item.coverUrl}
                  alt={item.name}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    objectFit: 'cover',
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">
                    {item.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad: {item.quantity} | Precio unitario: {fCurrency(item.price)}
                  </Typography>
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {fCurrency(item.price * item.quantity)}
                </Typography>
              </Box>
            </Box>
          ))}

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6">
              Total Pagado:
            </Typography>
            <Typography variant="h6" color="primary.main">
              {fCurrency(invoiceData.productos.reduce((sum, item) => sum + item.price * item.quantity, 0))}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="contained"
              onClick={handleContinueShopping}
              startIcon={<Iconify icon="solar:restart-bold" />}
            >
              Continuar Comprando
            </Button>
          </Box>
        </Card>
      </Container>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Carrito de Compras
        </Typography>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ mb: 3 }}>
            <Iconify icon="solar:cart-3-bold" width={64} sx={{ color: 'text.disabled' }} />
          </Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Tu carrito está vacío
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Agrega algunos productos para continuar con tu compra
          </Typography>
          <Button variant="contained" onClick={handleContinueShopping}>
            Continuar Comprando
          </Button>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Carrito de Compras
      </Typography>

      <Grid container spacing={3}>
        {/* Lista de productos */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Productos ({totalItems} artículos)
              </Typography>
              
              <Scrollbar>
                {cartItems.map((item, index) => (
                  <Box key={item.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
                      {/* Imagen del producto */}
                      <Box
                        component="img"
                        src={item.coverUrl}
                        alt={item.name}
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: 1,
                          objectFit: 'cover',
                          border: (theme) => `1px solid ${theme.palette.divider}`,
                        }}
                      />
                      
                      {/* Información del producto */}
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" sx={{ mb: 0.5 }}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Precio unitario: {fCurrency(item.price)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Cantidad:
                          </Typography>
                          <Typography variant="subtitle2">
                            {item.quantity}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {/* Precio total del item */}
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {fCurrency(item.price * item.quantity)}
                        </Typography>
                      </Box>
                      
                      {/* Botón para eliminar */}
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => removeFromCart(item.id)}
                        sx={{ ml: 1 }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                      </IconButton>
                    </Box>
                    
                    {index < cartItems.length - 1 && (
                      <Divider sx={{ borderStyle: 'dashed' }} />
                    )}
                  </Box>
                ))}
              </Scrollbar>
            </Box>
          </Card>
        </Grid>

        {/* Resumen de la compra */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              Resumen de Compra
            </Typography>
            
            {/* Detalles del cálculo */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Subtotal ({totalItems} artículos)
                </Typography>
                <Typography variant="body2">
                  {fCurrency(subtotal)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6">
                  Total
                </Typography>
                <Typography variant="h6" color="primary.main">
                  {fCurrency(subtotal)}
                </Typography>
              </Box>
            </Box>
            
            {/* Botones de acción */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                onClick={handleOpenPaymentModal}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Iconify icon="solar:cart-3-bold" />}
              >
                {loading ? 'Procesando...' : 'Ir a pagar'}
              </Button>
              
              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleContinueShopping}
                startIcon={<Iconify icon="solar:restart-bold" />}
              >
                Continuar Comprando
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Modal de Método de Pago */}
      <Dialog open={openPaymentModal} onClose={handleClosePaymentModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h5" component="div">
            Seleccione su método de pago
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <RadioGroup value={paymentMethod} onChange={handlePaymentMethodChange}>
              <FormControlLabel 
                value="efectivo" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      component="img" 
                      src="/assets/efectivo.png" 
                      alt="Efectivo"
                      sx={{ width: 50, height: 50, objectFit: 'contain' }}
                    />
                    <Typography>Efectivo</Typography>
                  </Box>
                }
                sx={{ 
                  mb: 2,
                  p: 2,
                  border: '1px solid',
                  borderColor: paymentMethod === 'efectivo' ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: paymentMethod === 'efectivo' ? 'action.selected' : 'transparent'
                }}
              />
              
              <FormControlLabel 
                value="tarjeta" 
                control={<Radio />} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box 
                      component="img" 
                      src="/assets/tarjeta.png" 
                      alt="Tarjeta"
                      sx={{ width: 50, height: 50, objectFit: 'contain' }}
                    />
                    <Typography>Tarjeta de Crédito/Débito</Typography>
                  </Box>
                }
                sx={{ 
                  p: 2,
                  border: '1px solid',
                  borderColor: paymentMethod === 'tarjeta' ? 'primary.main' : 'divider',
                  borderRadius: 1,
                  bgcolor: paymentMethod === 'tarjeta' ? 'action.selected' : 'transparent'
                }}
              />
            </RadioGroup>

            {paymentMethod === 'tarjeta' && (
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Número de Tarjeta"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={handleCardDataChange('cardNumber')}
                  inputProps={{ maxLength: 19 }}
                />
                
                <TextField
                  fullWidth
                  label="Nombre del Titular"
                  placeholder="Como aparece en la tarjeta"
                  value={cardData.cardName}
                  onChange={handleCardDataChange('cardName')}
                />
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Fecha de Expiración"
                    placeholder="MM/AA"
                    value={cardData.expiryDate}
                    onChange={handleCardDataChange('expiryDate')}
                    inputProps={{ maxLength: 5 }}
                    sx={{ flex: 1 }}
                  />
                  
                  <TextField
                    label="CVV"
                    placeholder="123"
                    type="password"
                    value={cardData.cvv}
                    onChange={handleCardDataChange('cvv')}
                    inputProps={{ maxLength: 4 }}
                    sx={{ flex: 1 }}
                  />
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleClosePaymentModal} variant="outlined">
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirmPayment} 
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {paymentMethod === 'efectivo' ? 'Comprar' : 'Pagar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
