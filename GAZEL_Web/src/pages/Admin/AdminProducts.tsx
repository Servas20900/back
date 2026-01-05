import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCamera } from 'react-icons/fa';
import { api } from '../../services/api';
import './AdminCategories.css'; // Reutilizamos los estilos

interface Product {
  id_product: number;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  image_url: string | null;
  id_category: number;
  status: 'ACTIVE' | 'INACTIVE';
  category: {
    name: string;
  };
}

interface Category {
  id_category: number;
  name: string;
}

export function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    id_category: 0,
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        api.products.getAll(),
        api.categories.getAll(),
      ]);
      setProducts(productsData as Product[]);
      setCategories(categoriesData as Category[]);
    } catch (error) {
      console.error('Error al cargar datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen no debe superar los 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.id_category) {
      alert('Por favor selecciona una categoría');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('stock', formData.stock.toString());
      formDataToSend.append('id_category', formData.id_category.toString());
      
      if (editingId) {
        formDataToSend.append('status', formData.status);
      }

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingId) {
        await api.products.update(editingId, formDataToSend);
      } else {
        await api.products.create(formDataToSend);
      }

      await loadData();
      resetForm();
    } catch (error) {
      console.error('Error al guardar producto:', error);
      alert('Error al guardar el producto');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock: product.stock,
      id_category: product.id_category,
      status: product.status,
    });
    setEditingId(product.id_product);
    setImagePreview(product.image_url);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      await api.products.delete(id);
      await loadData();
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert('Error al eliminar el producto');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock: 0,
      id_category: 0,
      status: 'ACTIVE',
    });
    setEditingId(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-products">
      <div className="admin-header">
        <h1>Gestión de Productos</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : <><FaPlus /> Nuevo Producto</>}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Licra Deportiva Negro"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Precio (₡) *</label>
              <input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
                placeholder="18500.00"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">Stock *</label>
              <input
                id="stock"
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                required
                placeholder="25"
              />
            </div>

            <div className="form-group">
              <label htmlFor="id_category">Categoría *</label>
              <select
                id="id_category"
                value={formData.id_category}
                onChange={(e) => setFormData({ ...formData, id_category: parseInt(e.target.value) })}
                required
              >
                <option value={0}>Selecciona una categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id_category} value={cat.id_category}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {editingId && (
              <div className="form-group">
                <label htmlFor="status">Estado</label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'INACTIVE' })}
                >
                  <option value="ACTIVE">Activo</option>
                  <option value="INACTIVE">Inactivo</option>
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Imagen del Producto</label>
              <div className="image-upload-section">
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="file-input-label">
                    📷 {imageFile ? 'Cambiar imagen' : 'Seleccionar imagen'}
                  </label>
                </div>
                {!editingId && !imageFile && (
                  <p style={{ fontSize: '0.875rem', color: '#666' }}>
                    Se recomienda subir una imagen
                  </p>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button type="button" onClick={resetForm} className="btn-secondary">
                Cancelar
              </button>
              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Precio</th>
              <th>Stock</th>
              <th>Categoría</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id_product}>
                <td>
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="product-thumbnail" />
                  ) : (
                    <div className="product-thumbnail" style={{ backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FaCamera />
                    </div>
                  )}
                </td>
                <td><strong>{product.name}</strong></td>
                <td>₡{product.price.toLocaleString('es-CR', { minimumFractionDigits: 2 })}</td>
                <td>{product.stock}</td>
                <td>{product.category.name}</td>
                <td>
                  <span className={`status-badge ${product.status.toLowerCase()}`}>
                    {product.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(product)} className="btn-edit">
                      <FaEdit /> Editar
                    </button>
                    <button onClick={() => handleDelete(product.id_product)} className="btn-delete">
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <div className="empty-state">
            <p>No hay productos registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}
