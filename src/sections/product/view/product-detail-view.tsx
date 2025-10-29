import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

import MDEditor from '@uiw/react-md-editor';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { useCart } from 'src/context/CartContext';
import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  stock_minimo: number;
  estado: boolean;
  id_categoria: number;
  url_imagen: string;
  created_at: string;
  updated_at: string;
  nombre_categoria: string;
}

interface Inventory {
  id_inventario: number;
  cantidad: number;
  estado: boolean;
  id_producto: number;
  producto: Product;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------------

export function ProductDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [inventory, setInventory] = useState<Inventory | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      const productId = parseInt(id, 10);
      fetchProduct(productId);
      fetchInventory(productId);
    }
  }, [id]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchProduct = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos/${productId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener producto');
      }

      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  };

  const fetchInventory = async (productId: number) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setLoading(false);
        return;
      }

      // Buscar inventario por id_producto - necesito confirmar el endpoint exacto
      const response = await fetch(`${import.meta.env.VITE_URL_API}/inventario/cantidad/${productId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Producto no disponible en este momento');
      }

      const data = await response.json();
      setInventory(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      setLoading(false);
    }
  };

  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value, 10);
    if (value > 0 && inventory && value <= inventory.cantidad) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    if (product && inventory) {
      addToCart(
        {
          id: product.id_producto.toString(),
          name: product.nombre,
          price: product.precio_unitario,
          coverUrl: product.url_imagen,
          stock: inventory.cantidad, // Usar el stock real del inventario
        },
        quantity
      );
    }
  };

  const handleContinueShopping = () => {
    navigate('/shopping');
  };

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography>Cargando producto...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (!product || !inventory) {
    return (
      <DashboardContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: 400,
          gap: 3,
          textAlign: 'center'
        }}>
          <Typography variant="h5" color="error" sx={{ fontWeight: 'medium' }}>
            {!product ? 'Producto no encontrado' : 'Producto no disponible en este momento'}
          </Typography>
          
          {!inventory && (
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500 }}>
              Este producto actualmente no cuenta con inventario disponible.
              Te invitamos a explorar otros productos en nuestra tienda.
            </Typography>
          )}
          
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleContinueShopping}
            sx={{ 
              mt: 2,
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              borderRadius: 2
            }}
          >
            Seguir comprando
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Imagen del producto - Izquierda */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            sx={{
              width: '100%',
              height: 500,
              borderRadius: 2,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'grey.100',
              border: 1,
              borderColor: 'grey.300',
            }}
          >
            {product.url_imagen ? (
              <Box
                component="img"
                src={product.url_imagen}
                alt={product.nombre}
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <Typography color="text.secondary">Sin imagen</Typography>
            )}
          </Box>
        </Grid>

        {/* Información del producto - Centro */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Box sx={{ pr: 2 }}>
            {/* Título */}
            <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
              {product.nombre}
            </Typography>

            {/* Precio */}
            <Typography
              variant="h3"
              sx={{
                fontWeight: 'bold',
                color: 'primary.main',
                mb: 3,
              }}
            >
              {fCurrency(product.precio_unitario)}
            </Typography>

            {/* Información adicional */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Información del Producto
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Categoría:</Typography>
                  <Typography variant="body2">{product.nombre_categoria}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">Estado:</Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: product.estado ? 'success.main' : 'error.main',
                      fontWeight: 'medium' 
                    }}
                  >
                    {product.estado ? 'Activo' : 'Inactivo'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Grid>

        {/* Panel de compra - Derecha */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Box
            sx={{
              p: 3,
              border: 1,
              borderColor: 'grey.300',
              borderRadius: 2,
              bgcolor: 'background.paper',
              height: 500, // Mismo alto que la imagen
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box>
              {/* Stock disponible */}
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'medium' }}>
                Stock disponible
              </Typography>
              <Typography variant="h4" color="primary.main" sx={{ mb: 4, fontWeight: 'bold' }}>
                {inventory.cantidad} unidades
              </Typography>

              {/* Selector de cantidad */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="body1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  Cantidad:
                </Typography>
                <TextField
                  type="number"
                  value={quantity}
                  onChange={handleQuantityChange}
                  inputProps={{
                    min: 1,
                    max: inventory.cantidad,
                  }}
                  size="medium"
                  sx={{ 
                    width: '120px',
                    '& .MuiInputBase-input': {
                      textAlign: 'center'
                    }
                  }}
                />
              </Box>
            </Box>

            {/* Botón añadir al carrito */}
            <Box sx={{ width: '100%' }}>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={handleAddToCart}
                disabled={inventory.cantidad === 0}
                sx={{
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  borderRadius: 2,
                }}
              >
                Añadir al carrito
              </Button>

              {inventory.cantidad === 0 && (
                <Typography variant="body2" color="error" sx={{ mt: 2, textAlign: 'center' }}>
                  Sin stock disponible
                </Typography>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Descripción del producto - Abajo */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" sx={{ mb: 2, fontWeight: 'medium' }}>
          <strong>Descripción</strong>
        </Typography>
        <Box 
          sx={{ 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 3,
            backgroundColor: 'background.paper'
          }}
        >
          <MDEditor.Markdown 
            source={product.descripcion} 
            style={{ 
              backgroundColor: 'transparent',
              fontSize: '14px',
              lineHeight: '1.6',
              color: 'inherit'
            }}
          />
        </Box>
      </Box>
    </DashboardContent>
  );
}
