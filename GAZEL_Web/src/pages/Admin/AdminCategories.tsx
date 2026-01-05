import { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaCamera } from 'react-icons/fa';
import { api } from '../../services/api';
import './AdminCategories.css';

interface Category {
  id_category: number;
  name: string;
  description: string | null;
  image_url: string | null;
  status: 'ACTIVE' | 'INACTIVE';
}

export function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.categories.getAll();
      setCategories(data as Category[]);
    } catch (error) {
      console.error('Error al cargar categorías:', error);
      alert('Error al cargar las categorías');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }

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
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      
      if (editingId) {
        formDataToSend.append('status', formData.status);
      }

      if (imageFile) {
        formDataToSend.append('image', imageFile);
      }

      if (editingId) {
        await api.categories.update(editingId, formDataToSend);
      } else {
        await api.categories.create(formDataToSend);
      }
      await loadCategories();
      resetForm();
    } catch (error) {
      console.error('Error al guardar categoría:', error);
      alert('Error al guardar la categoría');
    }
  };

  const handleEdit = (category: Category) => {
    setFormData({
      name: category.name,
      description: category.description || '',
      status: category.status,
    });
    setEditingId(category.id_category);
    setImagePreview(category.image_url);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;

    try {
      await api.categories.delete(id);
      await loadCategories();
    } catch (error) {
      console.error('Error al eliminar categoría:', error);
      alert('Error al eliminar la categoría. Puede que tenga productos asociados.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', status: 'ACTIVE' });
    setEditingId(null);
    setShowForm(false);
    setImageFile(null);
    setImagePreview(null);
  };

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-categories">
      <div className="admin-header">
        <h1>Gestión de Categorías</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          {showForm ? 'Cancelar' : <><FaPlus /> Nueva Categoría</>}
        </button>
      </div>

      {showForm && (
        <div className="admin-form-card">
          <h2>{editingId ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="Ej: Licras"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Descripción</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Descripción de la categoría"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="image">Imagen</label>
              <div className="image-upload-container">
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
                <label htmlFor="image-input" className="image-upload-label">
                  <FaCamera size={24} />
                  <span>{imagePreview ? 'Cambiar imagen' : 'Subir imagen'}</span>
                </label>
                <input
                  id="image-input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
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
              <th>ID</th>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category) => (
              <tr key={category.id_category}>
                <td>{category.id_category}</td>
                <td>
                  {category.image_url ? (
                    <img src={category.image_url} alt={category.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                  ) : (
                    <div style={{ width: '50px', height: '50px', background: '#eee', borderRadius: '4px' }} />
                  )}
                </td>
                <td><strong>{category.name}</strong></td>
                <td>{category.description || '-'}</td>
                <td>
                  <span className={`status-badge ${category.status.toLowerCase()}`}>
                    {category.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => handleEdit(category)} className="btn-edit">
                      <FaEdit /> Editar
                    </button>
                    <button onClick={() => handleDelete(category.id_category)} className="btn-delete">
                      <FaTrash /> Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {categories.length === 0 && (
          <div className="empty-state">
            <p>No hay categorías registradas</p>
          </div>
        )}
      </div>
    </div>
  );
}
