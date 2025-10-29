import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/hooks/use-auth';

import { Iconify } from 'src/components/iconify';

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
        // Actualizar el estado de autenticación
        checkAuth();
        router.push('/');
      } else {
        // Mostrar mensaje de error cuando las credenciales son incorrectas
        setError('Correo o contraseña incorrecta');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [email, password, router]);

  const renderForm = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <TextField
        fullWidth
        name="email"
        label="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="password"
        label="Contrasena"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        onClick={handleSignIn}
        disabled={loading}
      >
        {loading ? 'Iniciando...' : 'Iniciar sesión'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        <Typography variant="h5">Iniciar sesión</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          No tienes una cuenta?
          <Link variant="subtitle2" sx={{ ml: 0.5, cursor: 'pointer' }} onClick={() => router.push('/sign-up')}>
            Comienza aquí
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
