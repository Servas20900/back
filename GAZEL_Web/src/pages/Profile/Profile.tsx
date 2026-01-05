import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <h1>Mi Perfil</h1>
        <div className="profile-item"><strong>Nombre:</strong> {user.full_name}</div>
        <div className="profile-item"><strong>Email:</strong> {user.email}</div>
        <div className="profile-item"><strong>Rol:</strong> {user.role}</div>
        <button className="btn-logout" onClick={logout}>Cerrar sesión</button>
      </div>
    </div>
  );
};

export default Profile;
