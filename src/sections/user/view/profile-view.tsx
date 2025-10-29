import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

interface User {
  id_usuario: number;
  nombre: string;
  contrasena_hash: string;
  telefono: string;
  direccion: string;
  correo: string;
  estado: boolean;
  fecha_creacion: string;
  rol: {
    id_rol: number;
    nombre: string;
    descripcion: string;
  };
}

interface Direccion {
  id_direccion: number;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: boolean;
  id_usuario: number;
  id_departamento: number;
  departamento?: {
    id_departamento: number;
    departamento: string;
    estado: boolean;
  };
}

// ----------------------------------------------------------------------

export function ProfileView() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [direccion, setDireccion] = useState<Direccion | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    telefono: '',
    correo: '',
  });

  useEffect(() => {
    const loadUserData = async () => {
      await fetchUserProfile();
    };
    loadUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserDireccion = async (userId: number) => {
    try {
      console.log('Buscando dirección para usuario ID:', userId);
      const response = await fetch(`${import.meta.env.VITE_URL_API}/direcciones`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const direcciones = await response.json();
        console.log('Direcciones obtenidas:', direcciones);
        console.log('Tipo de userId:', typeof userId);
        
        // Buscar la dirección que pertenece al usuario actual
        const direccionUsuario = direcciones.find((dir: Direccion) => {
          console.log('Comparando:', dir.id_usuario, 'con', userId, '- Tipos:', typeof dir.id_usuario, typeof userId);
          return dir.id_usuario === userId;
        });
        
        console.log('Dirección encontrada:', direccionUsuario);
        
        if (direccionUsuario) {
          // Obtener información del departamento
          const deptResponse = await fetch(`${import.meta.env.VITE_URL_API}/departamentos/${direccionUsuario.id_departamento}`, {
            method: 'GET',
            headers: getAuthHeaders(),
          });
          
          if (deptResponse.ok) {
            const departamento = await deptResponse.json();
            direccionUsuario.departamento = departamento;
          }
          
          setDireccion(direccionUsuario);
        } else {
          console.log('No se encontró dirección para el usuario');
        }
      } else {
        console.error('Error al obtener direcciones:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user direccion:', error);
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const getCurrentUserId = () => {
    // Obtener el ID del usuario desde el token o localStorage
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id || payload.userId || payload.sub;
      } catch (error) {
        console.error('Error parsing token:', error);
        return null;
      }
    }
    return null;
  };

  const fetchUserProfile = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user ID found');
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_URL_API}/usuario/${userId}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener perfil de usuario');
      }

      const data = await response.json();
      console.log('Datos del usuario obtenidos:', data);
      setUser(data);
      setFormData({
        nombre: data.nombre,
        telefono: data.telefono,
        correo: data.correo,
      });
      
      // Obtener la dirección del usuario
      await fetchUserDireccion(data.id_usuario);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancelEdit = () => {
    if (user) {
      setFormData({
        nombre: user.nombre,
        telefono: user.telefono,
        correo: user.correo,
      });
    }
    setEditing(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_URL_API}/usuario/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar usuario');
      }

      const updatedUser = await response.json();
      setUser(updatedUser);
      setEditing(false);
      alert('Perfil actualizado exitosamente');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error al actualizar el perfil');
    }
  };

  const handleDelete = async () => {
    try {
      const userId = getCurrentUserId();
      if (!userId) {
        console.error('No user ID found');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_URL_API}/usuario/eliminar/${userId}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar usuario');
      }

      alert('Usuario eliminado exitosamente');
      // Cerrar sesión y redirigir al login
      localStorage.removeItem('token');
      navigate('/auth/sign-in');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error al eliminar el usuario');
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography>Cargando perfil...</Typography>
        </Box>
      </DashboardContent>
    );
  }

  if (!user) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <Typography variant="h6" color="error">
            No se pudo cargar el perfil del usuario
          </Typography>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent>
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
          Mi Perfil
        </Typography>

        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ p: 4 }}>
            {/* Información básica */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium', color: 'primary.main' }}>
                Información Personal
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  label="Nombre"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  disabled={!editing}
                  fullWidth
                />
                <TextField
                  label="Correo Electrónico"
                  name="correo"
                  value={formData.correo}
                  onChange={handleInputChange}
                  disabled={!editing}
                  fullWidth
                  type="email"
                />
                <TextField
                  label="Teléfono"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  disabled={!editing}
                  fullWidth
                />
              </Box>
            </Box>

            {/* Información de Dirección */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium', color: 'primary.main' }}>
                Dirección Domiciliar
              </Typography>
              
              {direccion ? (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                  <TextField
                    label="Calle"
                    value={direccion.calle}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Colonia"
                    value={direccion.colonia}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Ciudad"
                    value={direccion.ciudad}
                    disabled
                    fullWidth
                  />
                  <TextField
                    label="Departamento"
                    value={direccion.departamento?.departamento || 'No disponible'}
                    disabled
                    fullWidth
                  />
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No se ha registrado una dirección para este usuario.
                </Typography>
              )}
            </Box>

            {/* Información del rol */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 'medium', color: 'primary.main' }}>
                Rol y Permisos
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
                <TextField
                  label="Rol"
                  value={user.rol.nombre}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Fecha de Creación"
                  value={formatDate(user.fecha_creacion)}
                  disabled
                  fullWidth
                />
                <TextField
                  label="Descripción del Rol"
                  value={user.rol.descripcion}
                  disabled
                  fullWidth
                  multiline
                  rows={2}
                  sx={{ gridColumn: { md: 'span 2' } }}
                />
              </Box>
            </Box>

            {/* Botones de acción */}
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              {!editing ? (
                <>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={handleEdit}
                    sx={{ minWidth: 120 }}
                  >
                    Editar Perfil
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => setDeleteDialog(true)}
                    sx={{ minWidth: 120 }}
                  >
                    Eliminar Cuenta
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={handleCancelEdit}
                    sx={{ minWidth: 120 }}
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSave}
                    sx={{ minWidth: 120 }}
                  >
                    Guardar Cambios
                  </Button>
                </>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Dialog de confirmación para eliminar */}
        <Dialog
          open={deleteDialog}
          onClose={() => setDeleteDialog(false)}
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-description"
        >
          <DialogTitle id="delete-dialog-title">
            Confirmar Eliminación de Cuenta
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="delete-dialog-description">
              ¿Estás seguro de que quieres eliminar tu cuenta? Esta acción cambiará el estado de tu cuenta a inactivo
              y cerrarás sesión automáticamente. Esta acción puede ser reversible por un administrador.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)} color="primary">
              Cancelar
            </Button>
            <Button onClick={handleDelete} color="error" autoFocus>
              Eliminar Cuenta
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </DashboardContent>
  );
}
