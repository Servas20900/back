import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaKey, FaSave, FaEdit } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import './Profile.css';

// Avatares disponibles (usando DiceBear API)
const AVATAR_STYLES = [
  'adventurer',
  'adventurer-neutral',
  'avataaars',
  'big-ears',
  'big-smile',
  'bottts',
  'croodles',
  'fun-emoji',
  'micah',
  'personas',
];

const Profile: React.FC = () => {
  const { user, logout, updateProfile } = useAuth();
  const [editMode, setEditMode] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        full_name: user.full_name,
        phone: user.phone || '',
      });
      // Usar el email del usuario para generar un avatar consistente
      const avatarIndex = user.email.charCodeAt(0) % AVATAR_STYLES.length;
      setSelectedAvatar(avatarIndex);
    }
  }, [user]);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const getAvatarUrl = (index: number) => {
    return `https://api.dicebear.com/7.x/${AVATAR_STYLES[index]}/svg?seed=${user.email}`;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updated = await api.auth.updateProfile(formData);
      updateProfile(updated);
      setSuccess('Perfil actualizado correctamente');
      setEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      await api.auth.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess('Contraseña actualizada correctamente');
      setShowPasswordForm(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cambiar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="profile-title">Mi Perfil</h1>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {/* Avatar Section */}
        <div className="profile-card">
          <h2 className="card-title">Avatar</h2>
          <div className="avatar-section">
            <div className="avatar-display">
              <img src={getAvatarUrl(selectedAvatar)} alt="Avatar" />
            </div>
            <div className="avatar-grid">
              {AVATAR_STYLES.map((style, index) => (
                <div
                  key={style}
                  className={`avatar-option ${selectedAvatar === index ? 'selected' : ''}`}
                  onClick={() => setSelectedAvatar(index)}
                >
                  <img src={getAvatarUrl(index)} alt={style} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div className="profile-card">
          <div className="card-header">
            <h2 className="card-title">Información Personal</h2>
            {!editMode && (
              <button className="btn-icon" onClick={() => setEditMode(true)}>
                <FaEdit /> Editar
              </button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="profile-form">
              <div className="form-group">
                <label htmlFor="full_name">
                  <FaUser /> Nombre Completo
                </label>
                <input
                  id="full_name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <FaPhone /> Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Opcional"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setEditMode(false);
                    setFormData({
                      full_name: user.full_name,
                      phone: user.phone || '',
                    });
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-info">
              <div className="info-item">
                <label><FaUser /> Nombre:</label>
                <span>{user.full_name}</span>
              </div>
              <div className="info-item">
                <label><FaEnvelope /> Email:</label>
                <span>{user.email}</span>
              </div>
              <div className="info-item">
                <label><FaPhone /> Teléfono:</label>
                <span>{user.phone || 'No especificado'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Change Password */}
        <div className="profile-card">
          <h2 className="card-title">Seguridad</h2>
          
          {!showPasswordForm ? (
            <button
              className="btn-secondary"
              onClick={() => setShowPasswordForm(true)}
            >
              <FaKey /> Cambiar Contraseña
            </button>
          ) : (
            <form onSubmit={handleChangePassword} className="profile-form">
              <div className="form-group">
                <label htmlFor="currentPassword">
                  <FaKey /> Contraseña Actual
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, currentPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="newPassword">
                  <FaKey /> Nueva Contraseña
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, newPassword: e.target.value })
                  }
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <FaKey /> Confirmar Nueva Contraseña
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowPasswordForm(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: '',
                    });
                  }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  <FaSave /> {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Logout */}
        <div className="profile-card">
          <button className="btn-logout" onClick={logout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
