import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';

import { fDate } from 'src/utils/format-time';
import { fCurrency } from 'src/utils/format-number';

import { api } from 'src/services/api';

interface HistorialCompra {
  id: number;
  usuario: {
    id_usuario: number;
    nombre: string;
    correo: string;
  };
  factura: {
    id_factura: number;
    tipo: string;
    fecha: string;
    subtotal: string;
    total: string;
    descuento: string | null;
    estado: boolean;
    created_at: string;
  };
  created_at: string;
}

export function HistorialComprasView() {
  const [compras, setCompras] = useState<HistorialCompra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHistorialCompras();
  }, []);

  const fetchHistorialCompras = async () => {
    try {
      setLoading(true);
      
      // Decodificar JWT para obtener el ID del usuario
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay sesión activa');
      }

      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      
      const decodedToken = JSON.parse(jsonPayload);
      const userId = decodedToken.sub;

      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Hacer petición específica para las compras del usuario
      const response = await api.get<HistorialCompra[]>(`/usuarios-factura/usuario/compras/${userId}`);
      setCompras(response);
    } catch (err) {
      console.error('Error al obtener historial de compras:', err);
      setError('Error al cargar el historial de compras');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Historial de Compras
        </Typography>
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" sx={{ mb: 5 }}>
        Historial de Compras
      </Typography>

      {compras.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No tienes compras registradas
          </Typography>
          <Typography color="text.secondary">
            Tus compras aparecerán aquí una vez que realices tu primera compra
          </Typography>
        </Card>
      ) : (
        <Card>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID Factura</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Subtotal</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell>Descuento</TableCell>
                  <TableCell>Estado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {compras.map((compra) => (
                  <TableRow key={compra.id}>
                    <TableCell>
                      <Typography variant="subtitle2">
                        #{compra.factura.id_factura}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {fDate(compra.factura.fecha)}
                    </TableCell>
                    <TableCell>
                      {fCurrency(Number(compra.factura.subtotal))}
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" color="primary.main">
                        {fCurrency(Number(compra.factura.total))}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {compra.factura.descuento 
                        ? fCurrency(Number(compra.factura.descuento))
                        : '-'
                      }
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          padding: '4px 8px',
                          borderRadius: 1,
                          backgroundColor: compra.factura.estado ? 'success.lighter' : 'error.lighter',
                          color: compra.factura.estado ? 'success.dark' : 'error.dark',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {compra.factura.estado ? 'Activa' : 'Inactiva'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </Container>
  );
}
