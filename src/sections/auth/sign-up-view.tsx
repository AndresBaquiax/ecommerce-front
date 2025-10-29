import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

interface Departamento {
  id_departamento: number;
  departamento: string;
  estado: boolean;
  created_at: string;
  updated_at: string;
}

export function SignUpView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [telefono, setTelefono] = useState('');
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [idDepartamento, setIdDepartamento] = useState('');
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cargar departamentos al montar el componente
  useEffect(() => {
    fetchDepartamentos();
  }, []);

  const fetchDepartamentos = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}/departamentos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDepartamentos(Array.isArray(data) ? data : []);
      } else {
        console.error('Error al obtener departamentos');
      }
    } catch (err) {
      console.error('Error de conexión al obtener departamentos:', err);
    }
  };

  const handleSignUp = useCallback(async () => {
    setLoading(true);
    setError(''); // Limpiar errores previos
    try {
      // Primer paso: crear el usuario
      const userResponse = await fetch(`${import.meta.env.VITE_URL_API}/usuarios/registro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombre,
          correo,
          contrasena,
          telefono,
          id_rol: 2,
        }),
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        
        // Segundo paso: crear la dirección asociada al usuario
        if (calle || colonia || ciudad || idDepartamento) {
          const direccionResponse = await fetch(`${import.meta.env.VITE_URL_API}/direcciones`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              calle,
              colonia,
              ciudad,
              estado: true,
              id_departamento: parseInt(idDepartamento),
              id_usuario: userData.id_usuario || userData.user?.id_usuario
            }),
          });

          if (!direccionResponse.ok) {
            console.warn('Error al crear la dirección, pero el usuario fue creado exitosamente');
          }
        }

        // Redirigir al login después de un registro exitoso
        router.push('/sign-in');
      } else {
        // Mostrar mensaje de error cuando el registro falla
        setError('Error en el registro. Por favor, verifica tus datos.');
      }
    } catch (err) {
      console.error('Error de conexión:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [nombre, correo, contrasena, telefono, calle, colonia, ciudad, idDepartamento, router]);

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
        name="nombre"
        label="Nombre completo"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="correo"
        label="Correo electrónico"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      <TextField
        fullWidth
        name="telefono"
        label="Teléfono"
        value={telefono}
        onChange={(e) => setTelefono(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      {/* Sección de Dirección Domiciliar */}
      <Box sx={{ mb: 3, p: 3, border: '1px solid #e0e0e0', borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.primary', fontWeight: 'medium' }}>
          Dirección domiciliar
        </Typography>
        
        <TextField
          fullWidth
          name="calle"
          label="Calle"
          value={calle}
          onChange={(e) => setCalle(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <TextField
          fullWidth
          name="colonia"
          label="Colonia"
          value={colonia}
          onChange={(e) => setColonia(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <TextField
          fullWidth
          name="ciudad"
          label="Ciudad"
          value={ciudad}
          onChange={(e) => setCiudad(e.target.value)}
          sx={{ mb: 2 }}
          slotProps={{
            inputLabel: { shrink: true },
          }}
        />

        <FormControl fullWidth>
          <InputLabel id="departamento-label">Departamento</InputLabel>
          <Select
            labelId="departamento-label"
            id="departamento-select"
            value={idDepartamento}
            label="Departamento"
            onChange={(e) => setIdDepartamento(e.target.value)}
          >
            <MenuItem value="">
              <em>Selecciona un departamento</em>
            </MenuItem>
            {departamentos.map((dept) => (
              <MenuItem key={dept.id_departamento} value={dept.id_departamento.toString()}>
                {dept.departamento}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <TextField
        fullWidth
        name="contrasena"
        label="Contraseña"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
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
        onClick={handleSignUp}
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Create account'}
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
        <Typography variant="h5">Crear una cuenta</Typography>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Ya tienes una cuenta?  
          <Link variant="subtitle2" sx={{ ml: 0.5, cursor: 'pointer' }} onClick={() => router.push('/sign-in')}>
            Iniciar sesión
          </Link>
        </Typography>
      </Box>
      {renderForm}
    </>
  );
}
