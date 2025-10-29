import { useNavigate } from 'react-router-dom';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { fCurrency } from 'src/utils/format-number';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

export type ProductItemProps = {
  id: string;
  name: string;
  price: number;
  status: string;
  coverUrl: string;
  available: boolean; // Cambiar colors por available
  priceSale: number | null;
};

export function ProductItem({ product }: { product: ProductItemProps }) {
  const navigate = useNavigate();

  const handleProductClick = () => {
    navigate(`/products/${product.id}`);
  };
  const renderStatus = (
    <Label
      variant="inverted"
      color={(product.status === 'sale' && 'error') || 'info'}
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
      }}
    >
      {product.status}
    </Label>
  );

  const renderImg = (
    <Box
      component="img"
      alt={product.name}
      src={product.coverUrl}
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'contain',
        position: 'absolute',
      }}
    />
  );

  const renderPrice = (
    <Typography 
      variant="h5" 
      sx={{ 
        fontWeight: 'bold',
        fontSize: '1.25rem',
      }}
    >
      <Typography
        component="span"
        variant="body2"
        sx={{
          color: 'text.disabled',
          textDecoration: 'line-through',
          fontWeight: 'normal',
          fontSize: '0.875rem',
          mr: 1,
        }}
      >
        {product.priceSale && fCurrency(product.priceSale)}
      </Typography>
      {fCurrency(product.price)}
    </Typography>
  );

  return (
    <Card 
      sx={{ 
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
      onClick={handleProductClick}
    >
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {product.status && renderStatus}
        {renderImg}
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.name}
        </Link>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {product.available && (
            <Chip 
              label="Disponible" 
              size="small"
              color="success"
              variant="filled"
              sx={{
                fontWeight: 600,
                fontSize: '0.75rem',
                height: 24,
              }}
            />
          )}
          {renderPrice}
        </Box>
      </Stack>
    </Card>
  );
}
