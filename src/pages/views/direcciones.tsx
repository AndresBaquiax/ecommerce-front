import 'react-toastify/dist/ReactToastify.css';

import { toast } from 'react-toastify';
import { useState, useEffect, useCallback } from 'react';

const SearchIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const EditIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const XIcon = () => (
  <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const MapPinIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="72" height="72" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01" />
  </svg>
);

// Types
interface Direccion {
  id_direccion: number;
  calle: string;
  colonia: string;
  ciudad: string;
  estado: boolean;
  id_usuario: number;
  id_departamento: number;
  created_at?: string;
  updated_at?: string;
}

export function DireccionesView() {
  // State
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDireccion, setEditingDireccion] = useState<Direccion | null>(null);
  const [formData, setFormData] = useState({
    calle: '',
    colonia: '',
    ciudad: '',
    estado: true,
    id_usuario: 1, // Adjust based on your auth system
    id_departamento: 1, // Adjust based on your business logic
  });

  // Auth headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  // Fetch data
  const fetchDirecciones = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL_API}/direcciones`, {
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      //logServer('/direcciones', 'GET', 'Fetched direcciones');
      setDirecciones(data);
    } catch (error) {
      console.error('Error fetching direcciones:', error);
      toast.error('Error al cargar direcciones');
      setDirecciones([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const method = editingDireccion ? 'PUT' : 'POST';
    const url = editingDireccion
      ? `${import.meta.env.VITE_URL_API}/direcciones/${editingDireccion.id_direccion}`
      : `${import.meta.env.VITE_URL_API}/direcciones`;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }
      
      await fetchDirecciones();
      closeModal();
      //logServer('/direcciones', method, editingDireccion ? 'Actualizar direccion' : 'Crear direccion');
      toast.success(`Dirección ${editingDireccion ? 'actualizada' : 'creada'} correctamente`);
    } catch (error) {
      console.error('Error saving direccion:', error);
      toast.error('Error al guardar la dirección');
    }
  };

  // Delete function
  const deleteDireccion = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta dirección?')) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}/direcciones/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      await fetchDirecciones();
      //logServer('/direcciones', 'DELETE', 'Eliminar direccion');
      toast.success('Dirección eliminada correctamente');
    } catch (error) {
      console.error('Error deleting direccion:', error);
      toast.error('Error al eliminar la dirección');
    }
  };

  // Modal functions
  const openModal = (direccion?: Direccion) => {
    if (direccion) {
      setEditingDireccion(direccion);
      setFormData({
        calle: direccion.calle,
        colonia: direccion.colonia,
        ciudad: direccion.ciudad,
        estado: direccion.estado,
        id_usuario: direccion.id_usuario,
        id_departamento: direccion.id_departamento,
      });
    } else {
      setEditingDireccion(null);
      setFormData({
        calle: '',
        colonia: '',
        ciudad: '',
        estado: true,
        id_usuario: 1,
        id_departamento: 1,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDireccion(null);
  };

  // Filter function
  const filteredDirecciones = direcciones.filter(dir =>
    dir.calle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dir.colonia.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dir.ciudad.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Initial fetch
  useEffect(() => {
    fetchDirecciones();
  }, [fetchDirecciones]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600">Cargando direcciones...</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-blue-600 mr-3">
              <MapPinIcon />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Direcciones</h1>
          </div>
          <p className="text-xl text-gray-600">
            Administra tus direcciones registradas
          </p>
        </div>

        {/* Search and Add Button */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full sm:w-96">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Buscar direcciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            type="button"
            onClick={() => openModal()}
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <div className="mr-2">
              <PlusIcon />
            </div>
            Nueva Dirección
          </button>
        </div>

        {/* Content */}
        {filteredDirecciones.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto text-gray-400 mb-4">
              <AlertCircleIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron direcciones' : 'No hay direcciones registradas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Intenta con un término de búsqueda diferente' 
                : 'Comienza agregando tu primera dirección'}
            </p>
            {!searchTerm && (
              <button
                type="button"
                onClick={() => openModal()}
                className="flex items-center mx-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <div className="mr-2">
                  <PlusIcon />
                </div>
                Agregar primera dirección
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredDirecciones.map((dir) => (
              <div
                key={dir.id_direccion}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {dir.calle}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-gray-600">
                        <span className="font-medium">Colonia:</span> {dir.colonia}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Ciudad:</span> {dir.ciudad}
                      </p>
                      <p className="text-gray-600">
                        <span className="font-medium">Estado:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                          dir.estado 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {dir.estado ? 'Activo' : 'Inactivo'}
                        </span>
                      </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(dir.created_at || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openModal(dir)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDireccion(dir.id_direccion)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingDireccion ? 'Editar Dirección' : 'Nueva Dirección'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label htmlFor="calle" className="block text-sm font-medium text-gray-700 mb-2">
                    Calle *
                  </label>
                  <input
                    id="calle"
                    type="text"
                    value={formData.calle}
                    onChange={(e) => setFormData({ ...formData, calle: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Av. Siempre Viva 742"
                  />
                </div>

                <div>
                  <label htmlFor="colonia" className="block text-sm font-medium text-gray-700 mb-2">
                    Colonia *
                  </label>
                  <input
                    id="colonia"
                    type="text"
                    value={formData.colonia}
                    onChange={(e) => setFormData({ ...formData, colonia: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Centro"
                  />
                </div>

                <div>
                  <label htmlFor="ciudad" className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad *
                  </label>
                  <input
                    id="ciudad"
                    type="text"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Ciudad de México"
                  />
                </div>

                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    id="estado"
                    value={formData.estado.toString()}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="true">Activo</option>
                    <option value="false">Inactivo</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <div className="mr-2">
                      <XIcon />
                    </div>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <div className="mr-2">
                      <CheckIcon />
                    </div>
                    {editingDireccion ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}