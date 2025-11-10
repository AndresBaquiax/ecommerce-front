import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use-auth';

import { Iconify } from 'src/components/iconify';
import { logServer } from 'src/services/api';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();
  const { checkAuth } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = useCallback(async () => {
    setLoading(true);
    setError(''); // Limpiar errores previos
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          correo: email,
          contrasena: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Guardar el token en localStorage
        localStorage.setItem('token', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        logServer('/auth/login', 'POST', `Usuario ${data.usuario.correo} ha iniciado sesión`);
        // Actualizar el estado de autenticación
        checkAuth();
        router.push('/');
      } else {
        // Mostrar mensaje de error cuando las credenciales son incorrectas
        setError('Correo o contraseña incorrecta');
        logServer('/auth/login', 'POST', `Fallo de inicio de sesión para correo: ${email}`);
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
      logServer('/auth/login', 'POST', `Error de conexión para correo: ${email}`);
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const renderForm = (
    <Card sx={{ width: '100%', boxShadow: 6, borderRadius: 2 }}>
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            fullWidth
            name="email"
            label="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 0 }}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            fullWidth
            name="password"
            label="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            InputLabelProps={{ shrink: true }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            fullWidth
            size="large"
            type="submit"
            color="primary"
            variant="contained"
            onClick={handleSignIn}
            disabled={loading}
          >
            {loading ? 'Iniciando...' : 'Iniciar sesión'}
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72 }}>
          <Iconify icon="solar:cart-3-bold" width={36} height={36} />
        </Avatar>

        <Typography variant="h4">Bienvenido</Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center' }}>
          Accede a tu cuenta para administrar pedidos, inventario y reportes.
        </Typography>
      </Box>

      {renderForm}

      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          ¿No tienes una cuenta?
          <Link variant="subtitle2" sx={{ ml: 0.5, cursor: 'pointer' }} onClick={() => router.push('/sign-up')}>
            Regístrate
          </Link>
        </Typography>
      </Box>
    </Box>
  );
}
