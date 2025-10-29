import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import CircularProgress from '@mui/material/CircularProgress';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { ProductItem } from '../product-item';
import { ProductSort } from '../product-sort';
import { CartIcon } from '../product-cart-widget';

// ----------------------------------------------------------------------

// Interfaz para productos de la API
interface ApiProduct {
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

// ----------------------------------------------------------------------

export function ProductsView() {
  const [sortBy, setSortBy] = useState('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener headers de autenticación
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Función para obtener productos de la API
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setProducts([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const data = await response.json();
      // Filtrar solo productos activos
      const activeProducts = Array.isArray(data) ? data.filter((product: ApiProduct) => product.estado) : [];
      setProducts(activeProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Error al cargar los productos');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para transformar datos de API a formato del componente
  const transformProductData = (apiProduct: ApiProduct) => ({
      id: apiProduct.id_producto.toString(),
      name: apiProduct.nombre,
      price: apiProduct.precio_unitario,
      status: '', // Sin etiquetas de estado
      coverUrl: apiProduct.url_imagen || '/assets/images/product/product-1.webp', // Imagen por defecto si no hay
      available: apiProduct.estado, // Usar el estado del producto para determinar disponibilidad
      priceSale: null, // Sin precio de venta, solo precio original
    });

  // Cargar productos al montar el componente
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSort = useCallback((newSort: string) => {
    setSortBy(newSort);
  }, []);

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  }, []);

  // Filtrar productos por término de búsqueda
  const filteredProducts = products.filter(product => 
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.nombre_categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Procesar y filtrar productos
  const processedProducts = filteredProducts.map(transformProductData);
  
  // Agrupar productos filtrados por categoría
  const groupedProducts = filteredProducts.reduce((acc, product) => {
    const categoryName = product.nombre_categoria;
    if (!acc[categoryName]) {
      acc[categoryName] = [];
    }
    acc[categoryName].push(transformProductData(product));
    return acc;
  }, {} as Record<string, any[]>);

  // Obtener las categorías ordenadas alfabéticamente
  const categoryNames = Object.keys(groupedProducts).sort();

  // Aplicar ordenamiento dentro de cada categoría
  categoryNames.forEach(categoryName => {
    const categoryProducts = groupedProducts[categoryName];
    
    groupedProducts[categoryName] = [...categoryProducts].sort((a, b) => {
      // Encontrar los productos originales para acceder a las fechas
      const productA = filteredProducts.find(p => p.id_producto.toString() === a.id);
      const productB = filteredProducts.find(p => p.id_producto.toString() === b.id);
      
      switch (sortBy) {
        case 'oldest':
          // Más antiguo primero
          return new Date(productA?.created_at || '').getTime() - new Date(productB?.created_at || '').getTime();
        case 'newest':
          // Más reciente primero
          return new Date(productB?.created_at || '').getTime() - new Date(productA?.created_at || '').getTime();
        case 'priceAsc':
          // Precio más bajo primero
          return a.price - b.price;
        case 'priceDesc':
          // Precio más alto primero
          return b.price - a.price;
        default:
          return 0;
      }
    });
  });

  // También mantener la lista completa ordenada para referencia
  const sortedProducts = [...processedProducts].sort((a, b) => {
    // Encontrar los productos originales para acceder a las fechas
    const productA = products.find(p => p.id_producto.toString() === a.id);
    const productB = products.find(p => p.id_producto.toString() === b.id);
    
    switch (sortBy) {
      case 'oldest':
        // Más antiguo primero
        return new Date(productA?.created_at || '').getTime() - new Date(productB?.created_at || '').getTime();
      case 'newest':
        // Más reciente primero
        return new Date(productB?.created_at || '').getTime() - new Date(productA?.created_at || '').getTime();
      case 'priceAsc':
        // Precio más bajo primero
        return a.price - b.price;
      case 'priceDesc':
        // Precio más alto primero
        return b.price - a.price;
      default:
        return 0; // Sin ordenamiento específico
    }
  });

  if (error) {
    return (
      <DashboardContent>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Products
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <CartIcon totalItems={8} />

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 5 }}>
        <Iconify icon="solar:cart-3-bold" width={58} height={58} />
        <Typography variant="h2" component="span" sx={{ ml: 1 }}>
          Tienda en linea
        </Typography>
      </Box>

      {/* Campo de búsqueda */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar productos por nombre, descripción o categoría..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" width={20} height={20} />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      <Box
        sx={{
          mb: 5,
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap-reverse',
          justifyContent: 'space-between',
        }}
      >
        {/* Mostrar resultados de búsqueda */}
        {searchTerm && (
          <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
            {filteredProducts.length} resultado(s) para &quot;{searchTerm}&quot;
          </Typography>
        )}

        <Box
          sx={{
            my: 1,
            gap: 1,
            flexShrink: 0,
            display: 'flex',
          }}
        >
          <ProductSort
            sortBy={sortBy}
            onSort={handleSort}
            options={[
              { value: 'newest', label: 'Más Reciente' },
              { value: 'oldest', label: 'Más Antiguo' },
              { value: 'priceAsc', label: 'Precio: Menor a Mayor' },
              { value: 'priceDesc', label: 'Precio: Mayor a Menor' },
            ]}
          />
        </Box>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {categoryNames.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400, flexDirection: 'column' }}>
              <Iconify icon="eva:search-fill" width={64} height={64} sx={{ color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                {searchTerm ? `No se encontraron productos para &quot;${searchTerm}&quot;` : 'No se encontraron productos'}
              </Typography>
              {searchTerm && (
                <Typography variant="body2" color="text.secondary">
                  Intenta con otros términos de búsqueda
                </Typography>
              )}
            </Box>
          ) : (
            categoryNames.map(categoryName => (
              <Box key={categoryName} sx={{ mb: 6 }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    mb: 3, 
                    fontWeight: 'bold',
                    color: 'primary.main',
                    borderBottom: 2,
                    borderColor: 'primary.main',
                    pb: 1,
                    display: 'inline-block'
                  }}
                >
                  {categoryName} ({groupedProducts[categoryName].length})
                </Typography>
                <Grid container spacing={3}>
                  {groupedProducts[categoryName].map((product) => (
                    <Grid key={product.id} size={{ xs: 12, sm: 6, md: 3 }}>
                      <ProductItem product={product} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))
          )}

          {sortedProducts.length > 0 && (
            <Pagination 
              count={Math.ceil(sortedProducts.length / 12)} 
              color="primary" 
              sx={{ mt: 8, mx: 'auto' }} 
            />
          )}
        </>
      )}
    </DashboardContent>
  );
}
