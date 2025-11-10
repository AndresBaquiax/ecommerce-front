import React, { useState, useEffect } from 'react';

import { logServer } from 'src/services/api';

// Custom Icons (same as Direcciones)
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

const FolderIcon = () => (
  <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const AlertCircleIcon = () => (
  <svg width="72" height="72" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" strokeWidth={1.5} />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01" />
  </svg>
);

// Toast mock functions
const toast = {
  success: (message: string) => console.log('Success:', message),
  error: (message: string) => console.log('Error:', message)
};

interface Categoria {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

const CategoriasPage: React.FC = () => {
  // Estados (mismos del código original)
  const [categorias, setCategorias] = useState<Categoria[]>([
    {
      id_categoria: 1,
      nombre: "Lácteos",
      descripcion: "Productos lácteos como leche, queso, yogurt y mantequilla",
      created_at: "2024-01-15T10:30:00Z",
      updated_at: "2024-01-15T10:30:00Z"
    },
    {
      id_categoria: 2,
      nombre: "Panadería",
      descripcion: "Pan fresco, pasteles, galletas y productos horneados",
      created_at: "2024-01-16T09:15:00Z",
      updated_at: "2024-01-16T09:15:00Z"
    },
    {
      id_categoria: 3,
      nombre: "Carnes",
      descripcion: "Carnes frescas, embutidos y productos cárnicos",
      created_at: "2024-01-17T11:45:00Z",
      updated_at: "2024-01-17T11:45:00Z"
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
  });

  // Funciones originales mantenidas
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_URL_API}/categorias`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        logServer('/categorias', 'GET', `Error ${response.status}`);
        throw new Error('Error al obtener categorías'); 
      }
      const data = await response.json();
      logServer('/categorias', 'GET', `Success: Categorías cargadas`);
      setCategorias(data);
    } catch (error) {
      console.error(error);
      toast.error('Error al cargar categorías');
      setCategorias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();
    const method = editingCategoria ? 'PUT' : 'POST';
    const url = editingCategoria
      ? `${import.meta.env.VITE_URL_API}/categorias/${editingCategoria.id_categoria}`
      : `${import.meta.env.VITE_URL_API}/categorias`;

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Error al guardar categoría');
      await fetchCategorias();

      logServer('/categorias', method, `Categoría ${editingCategoria ? 'actualizada' : 'creada'}: ${formData.nombre}`);
      closeModal();
      toast.success(`Categoría ${editingCategoria ? 'actualizada' : 'creada'} correctamente`);
    } catch (error) {
      console.error(error);
      toast.error('Error al guardar la categoría');
    }
  };

  const deleteCategoria = async (id: number) => {
    if (!window.confirm('¿Estás seguro de eliminar esta categoría?')) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}/categorias/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error('Error al eliminar categoría');
      await fetchCategorias();
      logServer(`/categorias/${id}`, 'DELETE', `Categoría eliminada [ ID: ${id} ]`);
      toast.success('Categoría eliminada correctamente');
    } catch (error) {
      console.error(error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const openModal = (categoria?: Categoria) => {
    if (categoria) {
      setEditingCategoria(categoria);
      setFormData({ nombre: categoria.nombre, descripcion: categoria.descripcion });
    } else {
      setEditingCategoria(null);
      setFormData({ nombre: '', descripcion: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategoria(null);
    setFormData({ nombre: '', descripcion: '' });
  };

  const filteredCategorias = categorias.filter(c =>
    c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCategorias();
  }, []);

  // Loading state (mismo diseño que Direcciones)
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
          <p className="text-gray-600">Cargando categorías...</p>
        </div>
      </div>
    );
  }

  // Main render (nuevo diseño basado en Direcciones)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="text-blue-600 mr-3">
              <FolderIcon />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Gestión de Categorías</h1>
          </div>
          <p className="text-xl text-gray-600">
            Administra las categorías de tu supermercado
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
              placeholder="Buscar categorías..."
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
            Nueva Categoría
          </button>
        </div>

        {/* Content */}
        {filteredCategorias.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto text-gray-400 mb-4">
              <AlertCircleIcon />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm ? 'No se encontraron categorías' : 'No hay categorías registradas'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Intenta con un término de búsqueda diferente' 
                : 'Comienza agregando tu primera categoría'}
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
                Agregar primera categoría
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCategorias.map((categoria) => (
              <div
                key={categoria.id_categoria}
                className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="p-6 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {categoria.nombre}
                    </h3>
                    <div className="space-y-1">
                      <p className="text-gray-600">
                        <span className="font-medium">Descripción:</span> {categoria.descripcion}
                      </p>
                      <p className="text-gray-500 text-sm">
                        Creado: {new Date(categoria.created_at).toLocaleDateString()}
                      </p>
                      {categoria.updated_at !== categoria.created_at && (
                        <p className="text-gray-500 text-sm">
                          Actualizado: {new Date(categoria.updated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => openModal(categoria)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Editar"
                    >
                      <EditIcon />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategoria(categoria.id_categoria)}
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

        {/* Modal (mismo diseño que Direcciones) */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingCategoria ? 'Editar Categoría' : 'Nueva Categoría'}
                </h2>
                <button
                  type="button"
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XIcon />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre *
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    autoFocus
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Ej: Lácteos"
                  />
                </div>

                <div>
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción *
                  </label>
                  <textarea
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe la categoría..."
                  />
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
                    onClick={handleSubmit}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <div className="mr-2">
                      <CheckIcon />
                    </div>
                    {editingCategoria ? 'Actualizar' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriasPage;