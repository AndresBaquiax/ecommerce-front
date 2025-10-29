import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

import MDEditor from '@uiw/react-md-editor';
import React, { useState, useEffect } from 'react';

import { api } from 'src/services/api';

interface Product {
  id_producto: number;
  nombre: string;
  descripcion: string;
  precio_unitario: number;
  stock_minimo: number;
  estado: boolean;
  id_categoria: number;
  url_imagen: string;
  created_at: string;
  updated_at: string;
}

interface Category {
  id_categoria: number;
  nombre: string;
  descripcion: string;
  created_at: string;
  updated_at: string;
}

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio_unitario: '',
    stock_minimo: '',
    id_categoria: '',
    url_imagen: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [categorySearch, setCategorySearch] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');

  // Función para truncar y limpiar la descripción
  const truncateDescription = (description: string, maxLength: number = 100) => {
    // Remover marcas de markdown básicas
    const cleanText = description
      .replace(/[#*`_~[\]()]/g, '') // Remover caracteres de markdown
      .replace(/\n/g, ' ') // Reemplazar saltos de línea con espacios
      .trim();
    
    if (cleanText.length <= maxLength) return cleanText;
    return cleanText.substring(0, maxLength) + '...';
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // Resetear página cuando cambie el término de búsqueda
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.dropdown-container')) {
        setShowDropdown(null);
      }
      if (!target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };
    
    if (showDropdown !== null || showCategoryDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  }, [showDropdown, showCategoryDropdown]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio_unitario: '',
      stock_minimo: '',
      id_categoria: '',
      url_imagen: ''
    });
    setEditingProduct(null);
    setSelectedFile(null);
    setPreviewUrl('');
    setCategorySearch('');
    setShowCategoryDropdown(false);
    setSelectedCategoryName('');
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        nombre: product.nombre,
        descripcion: product.descripcion,
        precio_unitario: product.precio_unitario.toString(),
        stock_minimo: product.stock_minimo.toString(),
        id_categoria: product.id_categoria.toString(),
        url_imagen: product.url_imagen || ''
      });
      // Buscar el nombre de la categoría
      const category = categories.find(cat => cat.id_categoria === product.id_categoria);
      setSelectedCategoryName(category?.nombre || '');
      setCategorySearch(category?.nombre || '');
      // Usar directamente la URL de imagen del producto
      setPreviewUrl(product.url_imagen || '');
    } else {
      resetForm();
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategorySearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCategorySearch(value);
    setShowCategoryDropdown(true);
    // Si el campo está vacío, limpiar la selección
    if (!value) {
      setFormData(prev => ({ ...prev, id_categoria: '' }));
      setSelectedCategoryName('');
    }
  };

  const selectCategory = (category: Category) => {
    setFormData(prev => ({ ...prev, id_categoria: category.id_categoria.toString() }));
    setSelectedCategoryName(category.nombre);
    setCategorySearch(category.nombre);
    setShowCategoryDropdown(false);
  };

  const filteredCategories = categories.filter(category =>
    category.nombre.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Crear una URL de vista previa
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const productData = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        precio_unitario: parseFloat(formData.precio_unitario),
        stock_minimo: parseInt(formData.stock_minimo),
        id_categoria: parseInt(formData.id_categoria),
        url_imagen: formData.url_imagen
      };

      if (editingProduct) {
        // Si hay un archivo seleccionado, usar updateProductWithImage, sino usar el método normal
        if (selectedFile) {
          await updateProductWithImage(editingProduct.id_producto, productData, selectedFile);
        } else {
          await updateProduct(editingProduct.id_producto, productData);
        }
        alert('Producto actualizado exitosamente');
      } else {
        // Si hay un archivo seleccionado, usar createProductWithImage, sino usar el método normal
        if (selectedFile) {
          await createProductWithImage(productData, selectedFile);
        } else {
          await createProduct(productData);
        }
        alert('Producto creado exitosamente');
      }

      closeModal();
      // Recargar la página para reflejar los cambios
      window.location.reload();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  };

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setProducts([]);
        setLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener productos');
      }

      const data = await response.json();
      setProducts(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        setCategories([]);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_URL_API}/categorias`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const createProduct = async (productData: Omit<Product, 'id_producto' | 'created_at' | 'updated_at' | 'estado'>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al crear producto');
      }

      const newProduct = await response.json();
      
      // Crear entrada en inventario para el nuevo producto
      try {
        await api.post('/inventario', {
          cantidad: 0,
          id_producto: newProduct.id_producto,
          estado: true
        });
        console.log('Entrada de inventario creada para producto:', newProduct.id_producto);
      } catch (inventoryError) {
        console.error('Error al crear entrada de inventario:', inventoryError);
        // No lanzamos el error para no interrumpir la creación del producto
      }
      
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  };

  const createProductWithImage = async (productData: Omit<Product, 'id_producto' | 'created_at' | 'updated_at' | 'estado' | 'url_imagen'>, imageFile: File) => {
    try {
      const formDataToSend = new FormData();
      
      // Agregar todos los campos del producto al FormData
      formDataToSend.append('nombre', productData.nombre);
      formDataToSend.append('descripcion', productData.descripcion);
      formDataToSend.append('precio_unitario', productData.precio_unitario.toString());
      formDataToSend.append('stock_minimo', productData.stock_minimo.toString());
      formDataToSend.append('id_categoria', productData.id_categoria.toString());
      
      // Agregar la imagen
      formDataToSend.append('imagen', imageFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // No incluir Content-Type para que el navegador lo configure automáticamente con boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Error al crear producto con imagen');
      }

      const newProduct = await response.json();
      
      // Crear entrada en inventario para el nuevo producto
      try {
        await api.post('/inventario', {
          cantidad: 0,
          id_producto: newProduct.id_producto,
          estado: true
        });
        console.log('Entrada de inventario creada para producto con imagen:', newProduct.id_producto);
      } catch (inventoryError) {
        console.error('Error al crear entrada de inventario:', inventoryError);
        // No lanzamos el error para no interrumpir la creación del producto
      }
      
      setProducts(prev => [...prev, newProduct]);
      return newProduct;
    } catch (error) {
      console.error('Error creating product with image:', error);
      throw error;
    }
  };

  const updateProduct = async (id: number, productData: Omit<Product, 'id_producto' | 'created_at' | 'updated_at' | 'estado'>) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error('Error al actualizar producto');
      }

      const updatedProduct = await response.json();
      setProducts(prev => prev.map(product => 
        product.id_producto === id ? updatedProduct : product
      ));
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  };

  const updateProductWithImage = async (id: number, productData: Omit<Product, 'id_producto' | 'created_at' | 'updated_at' | 'estado' | 'url_imagen'>, imageFile: File) => {
    try {
      const formDataToSend = new FormData();
      
      // Agregar todos los campos del producto al FormData
      formDataToSend.append('nombre', productData.nombre);
      formDataToSend.append('descripcion', productData.descripcion);
      formDataToSend.append('precio_unitario', productData.precio_unitario.toString());
      formDataToSend.append('stock_minimo', productData.stock_minimo.toString());
      formDataToSend.append('id_categoria', productData.id_categoria.toString());
      
      // Agregar la imagen
      formDataToSend.append('imagen', imageFile);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          // No incluir Content-Type para que el navegador lo configure automáticamente con boundary
        },
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Error al actualizar producto con imagen');
      }

      const updatedProduct = await response.json();
      setProducts(prev => prev.map(product => 
        product.id_producto === id ? updatedProduct : product
      ));
      return updatedProduct;
    } catch (error) {
      console.error('Error updating product with image:', error);
      throw error;
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_URL_API}/productos/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Error al eliminar producto');
      }

      const result = await response.json();
      // Actualizar el producto en el estado local cambiando su estado a false
      setProducts(prev => prev.map(product => 
        product.id_producto === id ? { ...product, estado: false } : product
      ));
      return result;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  };

  const filteredProducts = Array.isArray(products) ? products.filter(product =>
    product.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  ) : [];

  // Lógica de paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getVisiblePages = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  if (loading) {
    return <div className="p-8">Cargando productos...</div>;
  }

  return (
    <main className="p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Productos</h1>
        <button 
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center font-semibold hover:bg-blue-600"
          onClick={(e) => {
            e.stopPropagation();
            openModal();
          }}
        >
          <span className="material-icons mr-2">add</span>
          Nuevo Producto
        </button>
      </header>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="relative">
            <span className="material-icons absolute left-3 top-2.5 text-gray-400" style={{fontSize: '20px'}}>search</span>
            <input
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Buscar producto..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-fixed">
            <thead className="bg-gray-50 text-gray-500 uppercase text-sm font-semibold">
              <tr>
                <th className="p-4 w-12">
                  <input className="rounded" type="checkbox" />
                </th>
                <th className="p-4 w-20">Imagen</th>
                <th className="p-4 w-48">Nombre</th>
                <th className="p-4 w-64">Descripción</th>
                <th className="p-4 w-24">Precio</th>
                <th className="p-4 w-24">Stock Mínimo</th>
                <th className="p-4 w-20">Estado</th>
                <th className="p-4 w-16" />
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {currentProducts.map((product) => (
                <tr key={product.id_producto} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <input className="rounded" type="checkbox" />
                  </td>
                  <td className="p-4">
                    {product.url_imagen ? (
                      <img
                        src={product.url_imagen}
                        alt={product.nombre}
                        className="w-12 h-12 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="material-icons text-gray-400 text-sm">image</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="max-w-48 overflow-hidden">
                      <div className="font-medium truncate">{product.nombre}</div>
                      <div className="text-sm text-gray-500">ID: {product.id_producto}</div>
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="text-sm text-gray-700 break-words">
                      {truncateDescription(product.descripcion)}
                    </div>
                  </td>
                  <td className="p-4">${Number(product.precio_unitario).toFixed(2)}</td>
                  <td className="p-4">{product.stock_minimo}</td>
                  <td className="p-4">
                    <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${
                      product.estado 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="relative dropdown-container">
                      <button 
                        className="p-2 text-gray-500 hover:text-gray-800"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDropdown(showDropdown === product.id_producto ? null : product.id_producto);
                        }}
                      >
                        <span className="material-icons">more_vert</span>
                      </button>
                      
                      {showDropdown === product.id_producto && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal(product);
                                setShowDropdown(null);
                              }}
                            >
                              <span className="material-icons mr-2 text-sm">edit</span>
                              Editar
                            </button>
                            <button
                              className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
                                  try {
                                    await deleteProduct(product.id_producto);
                                    console.log('Producto eliminado');
                                    alert('Producto eliminado exitosamente');
                                  } catch (error) {
                                    console.error('Error al eliminar producto:', error);
                                    alert('Error al eliminar el producto');
                                  }
                                }
                                setShowDropdown(null);
                              }}
                            >
                              <span className="material-icons mr-2 text-sm">delete</span>
                              Eliminar
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-500">
            Mostrando {startIndex + 1} a {Math.min(endIndex, filteredProducts.length)} de {filteredProducts.length} productos
          </div>
          <div className="flex items-center space-x-1">
            <button 
              className={`px-3 py-1 rounded-md ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-200'}`}
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="material-icons">chevron_left</span>
            </button>
            
            {getVisiblePages().map((page) => (
              <button
                key={page}
                className={`px-3 py-1 rounded-md ${
                  currentPage === page 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </button>
            ))}
            
            <button 
              className={`px-3 py-1 rounded-md ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-200'}`}
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="material-icons">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal para agregar/editar producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <span className="material-icons text-xl">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción *
                  </label>
                  <div data-color-mode="light">
                    <MDEditor
                      value={formData.descripcion}
                      onChange={(val) => setFormData(prev => ({ ...prev, descripcion: val || '' }))}
                      preview="edit"
                      hideToolbar={false}
                      height={300}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio Unitario *
                  </label>
                  <input
                    type="number"
                    name="precio_unitario"
                    value={formData.precio_unitario}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock Mínimo *
                  </label>
                  <input
                    type="number"
                    name="stock_minimo"
                    value={formData.stock_minimo}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría *
                  </label>
                  <div className="relative category-dropdown-container">
                    <input
                      type="text"
                      value={categorySearch}
                      onChange={handleCategorySearch}
                      onFocus={() => setShowCategoryDropdown(true)}
                      placeholder="Buscar o seleccionar categoría..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    
                    {/* Dropdown de categorías */}
                    {showCategoryDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredCategories.length > 0 ? (
                          filteredCategories.map((category) => (
                            <div
                              key={category.id_categoria}
                              onClick={() => selectCategory(category)}
                              className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                            >
                              <div className="font-medium text-gray-900">{category.nombre}</div>
                              <div className="text-sm text-gray-500">{category.descripcion}</div>
                            </div>
                          ))
                        ) : (
                          <div className="px-3 py-2 text-gray-500 text-sm">
                            No se encontraron categorías
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Campo oculto para el ID de categoría */}
                    <input
                      type="hidden"
                      name="id_categoria"
                      value={formData.id_categoria}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Subir Imagen del producto
                  </label>
                  
                  {/* Área de drag and drop mejorada */}
                  <div className="border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-all duration-300 ease-in-out">
                    <label className="flex flex-col items-center justify-center h-48 cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      
                      {previewUrl ? (
                        /* Vista previa con imagen cargada */
                        <div className="flex flex-col items-center">
                          <div className="relative mb-4">
                            <img
                              src={previewUrl}
                              alt="Vista previa"
                              className="max-w-32 max-h-32 object-cover rounded-lg shadow-md"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 rounded-lg transition-all duration-200 flex items-center justify-center">
                              <span className="material-icons text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                edit
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 font-medium">
                            Clic para cambiar imagen
                          </p>
                        </div>
                      ) : (
                        /* Estado inicial sin imagen */
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-300 transition-colors duration-200">
                            <svg 
                              className="w-8 h-8 text-gray-500" 
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
                              />
                            </svg>
                          </div>
                          <div className="mb-2">
                            <p className="text-lg font-semibold text-gray-700 group-hover:text-gray-800 transition-colors duration-200">
                              Arrastra y suelta tus archivos aquí.
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              O haz clic para seleccionar archivos
                            </p>
                          </div>
                        </div>
                      )}
                    </label>
                  </div>
                  
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Formatos soportados: JPG, PNG, GIF. Máximo 5MB.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingProduct ? 'Actualizar' : 'Crear'} Producto
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default ProductsPage;
