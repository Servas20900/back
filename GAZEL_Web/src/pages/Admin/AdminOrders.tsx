import { useState, useEffect } from 'react';
import { FaEye, FaCheck, FaTruck, FaTimes } from 'react-icons/fa';
import { api } from '../../services/api';
import './AdminCategories.css';

interface OrderItem {
  id_order_item: number;
  id_product: number;
  quantity: number;
  unit_price: number;
  product: {
    name: string;
    image_url?: string;
  };
}

interface ShippingInfo {
  full_name: string;
  phone: string;
  email: string;
  province: string;
  canton: string;
  district: string;
  address_details: string;
  shipping_method: string;
}

interface Payment {
  payment_method: string;
  amount: number;
  payment_status: string;
}

interface Order {
  id_order: number;
  id_user: number | null;
  order_date: string;
  total_amount: number;
  status: string;
  user?: {
    full_name: string;
    email: string;
    phone: string;
  };
  items: OrderItem[];
  shipping?: ShippingInfo;
  payments: Payment[];
}

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await api.orders.getAllOrders();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error al cargar órdenes:', error);
      alert('Error al cargar las órdenes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    try {
      await api.orders.updateStatus(orderId, newStatus);
      await loadOrders();
      alert('Estado actualizado correctamente');
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      alert('Error al actualizar el estado');
    }
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PENDING: { label: 'Pendiente', className: 'status-pending' },
      PAID: { label: 'Pagado', className: 'status-paid' },
      SHIPPED: { label: 'Enviado', className: 'status-shipped' },
      COMPLETED: { label: 'Completado', className: 'status-completed' },
      CANCELLED: { label: 'Cancelado', className: 'status-cancelled' },
    };
    const statusInfo = statusMap[status] || { label: status, className: '' };
    return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return <div className="admin-loading">Cargando...</div>;
  }

  return (
    <div className="admin-orders">
      <div className="admin-header">
        <h1>Gestión de Pedidos</h1>
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-value">{orders.length}</span>
            <span className="stat-label">Total Pedidos</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{orders.filter(o => o.status === 'PENDING').length}</span>
            <span className="stat-label">Pendientes</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">{orders.filter(o => o.status === 'COMPLETED').length}</span>
            <span className="stat-label">Completados</span>
          </div>
        </div>
      </div>

      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Estado</th>
              <th>Items</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id_order}>
                <td>#{order.id_order}</td>
                <td>{formatDate(order.order_date)}</td>
                <td>
                  {order.user ? (
                    <div>
                      <strong>{order.user.full_name}</strong>
                      <br />
                      <small>{order.user.email}</small>
                    </div>
                  ) : order.shipping ? (
                    <div>
                      <strong>{order.shipping.full_name}</strong>
                      <br />
                      <small>{order.shipping.email}</small>
                      <br />
                      <span className="guest-badge">Invitado</span>
                    </div>
                  ) : (
                    <span className="guest-badge">Invitado</span>
                  )}
                </td>
                <td><strong>{formatCurrency(order.total_amount)}</strong></td>
                <td>{getStatusBadge(order.status)}</td>
                <td>{order.items.length} producto(s)</td>
                <td>
                  <div className="action-buttons">
                    <button onClick={() => viewOrderDetails(order)} className="btn-view">
                      <FaEye /> Ver
                    </button>
                    {order.status === 'PENDING' && (
                      <button
                        onClick={() => handleStatusChange(order.id_order, 'PAID')}
                        className="btn-approve"
                      >
                        <FaCheck /> Aprobar
                      </button>
                    )}
                    {order.status === 'PAID' && (
                      <button
                        onClick={() => handleStatusChange(order.id_order, 'SHIPPED')}
                        className="btn-ship"
                      >
                        <FaTruck /> Enviar
                      </button>
                    )}
                    {order.status === 'SHIPPED' && (
                      <button
                        onClick={() => handleStatusChange(order.id_order, 'COMPLETED')}
                        className="btn-complete"
                      >
                        <FaCheck /> Completar
                      </button>
                    )}
                    {(order.status === 'PENDING' || order.status === 'PAID') && (
                      <button
                        onClick={() => handleStatusChange(order.id_order, 'CANCELLED')}
                        className="btn-cancel"
                      >
                        <FaTimes /> Cancelar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <div className="empty-state">
            <p>No hay pedidos registrados</p>
          </div>
        )}
      </div>

      {/* Modal de detalles */}
      {showDetails && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalles del Pedido #{selectedOrder.id_order}</h2>
              <button className="modal-close" onClick={() => setShowDetails(false)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="order-details-grid">
                <div className="detail-section">
                  <h3>Información del Cliente</h3>
                  {selectedOrder.user ? (
                    <>
                      <p><strong>Nombre:</strong> {selectedOrder.user.full_name}</p>
                      <p><strong>Email:</strong> {selectedOrder.user.email}</p>
                      <p><strong>Teléfono:</strong> {selectedOrder.user.phone}</p>
                    </>
                  ) : selectedOrder.shipping && (
                    <>
                      <p><strong>Nombre:</strong> {selectedOrder.shipping.full_name}</p>
                      <p><strong>Email:</strong> {selectedOrder.shipping.email}</p>
                      <p><strong>Teléfono:</strong> {selectedOrder.shipping.phone}</p>
                      <p className="guest-badge">Cliente Invitado</p>
                    </>
                  )}
                </div>

                {selectedOrder.shipping && (
                  <div className="detail-section">
                    <h3>Información de Envío</h3>
                    <p><strong>Provincia:</strong> {selectedOrder.shipping.province}</p>
                    <p><strong>Cantón:</strong> {selectedOrder.shipping.canton}</p>
                    <p><strong>Distrito:</strong> {selectedOrder.shipping.district}</p>
                    <p><strong>Dirección:</strong> {selectedOrder.shipping.address_details}</p>
                    <p><strong>Método:</strong> {selectedOrder.shipping.shipping_method}</p>
                  </div>
                )}

                <div className="detail-section">
                  <h3>Estado del Pedido</h3>
                  <p><strong>Estado:</strong> {getStatusBadge(selectedOrder.status)}</p>
                  <p><strong>Fecha:</strong> {formatDate(selectedOrder.order_date)}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.total_amount)}</p>
                </div>

                {selectedOrder.payments && selectedOrder.payments.length > 0 && (
                  <div className="detail-section">
                    <h3>Información de Pago</h3>
                    <p><strong>Método:</strong> {selectedOrder.payments[0].payment_method}</p>
                    <p><strong>Monto:</strong> {formatCurrency(selectedOrder.payments[0].amount)}</p>
                    <p><strong>Estado:</strong> {selectedOrder.payments[0].payment_status}</p>
                  </div>
                )}
              </div>

              <div className="detail-section">
                <h3>Productos</h3>
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedOrder.items.map((item) => (
                      <tr key={item.id_order_item}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {item.product.image_url && (
                              <img
                                src={item.product.image_url}
                                alt={item.product.name}
                                style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}
                              />
                            )}
                            <span>{item.product.name}</span>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.unit_price)}</td>
                        <td><strong>{formatCurrency(item.unit_price * item.quantity)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={3}><strong>Total</strong></td>
                      <td><strong>{formatCurrency(selectedOrder.total_amount)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;
