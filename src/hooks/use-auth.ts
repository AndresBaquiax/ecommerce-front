import { useState, useEffect } from 'react';

export interface User {
  id: number;
  nombre: string;
  correo: string;
  rol: string;
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    checkAuth();
    
    // Verificar el token cada 5 minutos
    const interval = setInterval(() => {
      checkAuth();
    }, 5 * 60 * 1000); // 5 minutos en milisegundos
    
    return () => clearInterval(interval);
  }, []);

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('usuario');

      if (token && userData) {
        // Verificar si el token ha expirado
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        
        if (payload.exp && payload.exp > currentTime) {
          // Token válido y no expirado - extraer datos del token
          const parsedUser = JSON.parse(userData);
          
          // Si el rol no está en userData, intentar extraerlo del token
          if (!parsedUser.rol && payload.rol) {
            parsedUser.rol = payload.rol;
          }
          
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Token expirado - limpiar localStorage
          console.log('Token expirado, limpiando sesión...');
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    checkAuth,
    logout,
  };
}
