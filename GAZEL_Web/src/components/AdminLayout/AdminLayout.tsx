import { Link, Outlet, Navigate } from 'react-router-dom';
import { FaFolderOpen, FaShoppingBag, FaBoxOpen, FaHome } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

export function AdminLayout() {
  const { user, logout } = useAuth();

  // Redirigir si no es admin
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <h2>Panel de Admin</h2>
          <p>{user.full_name}</p>
        </div>
        <nav className="admin-nav">
          <Link to="/admin/categories" className="admin-nav-link">
            <span className="icon"><FaFolderOpen /></span>
            Categorías
          </Link>
          <Link to="/admin/products" className="admin-nav-link">
            <span className="icon"><FaShoppingBag /></span>
            Productos
          </Link>
          <Link to="/admin/orders" className="admin-nav-link">
            <span className="icon"><FaBoxOpen /></span>
            Pedidos
          </Link>
          <Link to="/" className="admin-nav-link">
            <span className="icon"><FaHome /></span>
            Ir a la tienda
          </Link>
        </nav>
        <button onClick={logout} className="admin-logout-btn">
          Cerrar Sesión
        </button>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
