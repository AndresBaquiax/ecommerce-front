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
      color="error"
      sx={{
        zIndex: 9,
        top: 16,
        right: 16,
        position: 'absolute',
        textTransform: 'uppercase',
        fontWeight: 'bold',
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
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', minWidth: 0 }}>
      {product.priceSale && (
        <Typography
          component="span"
          variant="caption"
          sx={{
            color: 'text.disabled',
            textDecoration: 'line-through',
            fontWeight: 'normal',
            fontSize: '0.7rem',
          }}
        >
          {fCurrency(product.priceSale)}
        </Typography>
      )}
      <Typography 
        variant="body2" 
        sx={{ 
          fontWeight: 'bold',
          fontSize: '0.95rem',
          color: product.priceSale ? 'error.main' : 'text.primary',
        }}
      >
        {fCurrency(product.price)}
      </Typography>
    </Box>
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

      <Stack spacing={1.5} sx={{ p: 3 }}>
        <Link color="inherit" underline="hover" variant="subtitle2" noWrap>
          {product.name}
        </Link>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: 1,
            height: '40px',
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
                fontSize: '0.7rem',
                height: 22,
              }}
            />
          )}
          {renderPrice}
        </Box>
      </Stack>
    </Card>
  );
}
