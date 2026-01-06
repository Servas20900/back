import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCreditCard, FaMobileAlt } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ordersService } from '../../services/api';
import './Checkout.css';

const Checkout: React.FC = () => {
  const { items, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'SINPE' | 'CARD'>('SINPE');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Nota: Permitimos checkout como invitado. Si el usuario
  // está autenticado, los campos se autocompletan.

  if (items.length === 0) {
    return (
      <div className="checkout-empty">
        <h2>No hay productos en el carrito</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Ir a la tienda
        </button>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpiar error al escribir
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.exec(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10}$/.exec(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Teléfono debe tener 10 dígitos';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'La dirección es requerida';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Calcular envío y total
      const shippingCost = total >= 100000 ? 0 : 10000;
      const finalTotal = total + shippingCost;

      // Mapear método de pago al formato del backend
      const paymentMethodMap = {
        'SINPE': 'BANK_TRANSFER',
        'CARD': 'CREDIT_CARD',
        'PAYPAL': 'PAYPAL'
      };

      if (isAuthenticated) {
        // Usuario autenticado: crear orden normal (requiere carrito en backend)
        // Por ahora simulamos, en producción deberías implementar esto
        console.log('Usuario autenticado - orden normal');
        
        // Simular procesamiento
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const order = {
          id: Date.now().toString(),
          items,
          total: finalTotal,
          shippingInfo: formData,
          createdAt: new Date(),
          status: 'pending',
        };

        clearCart();
        navigate('/order-success', { state: { order } });
      } else {
        // Usuario invitado: usar endpoint guest
        const guestOrderData = {
          full_name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          items: items.map(item => ({
            id_product: item.id_product,
            quantity: item.quantity,
            unit_price: Number(item.unit_price),
          })),
          total_amount: finalTotal,
          payment_method: paymentMethodMap[paymentMethod],
        };

        const createdOrder = await ordersService.createGuest(guestOrderData);

        // Crear objeto de orden para la página de éxito
        const order = {
          id: (createdOrder as any).id_order || Date.now().toString(),
          items,
          total: finalTotal,
          shippingInfo: formData,
          createdAt: new Date(),
          status: 'pending',
        };

        clearCart();
        navigate('/order-success', { state: { order } });
      }
    } catch (error) {
      console.error('Error al crear orden:', error);
      alert('Hubo un error al procesar tu orden. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shippingCost = total >= 100000 ? 0 : 10000;
  const finalTotal = total + shippingCost;

  return (
    <div className="checkout-page">
      <h1 className="checkout-title">Finalizar Compra</h1>

      <div className="checkout-container">
        <form onSubmit={handleSubmit} className="checkout-form">
          <h2 className="form-title">Información de Entrega</h2>

          <div className="form-group">
            <label htmlFor="name">Nombre Completo *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Correo Electrónico *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">Teléfono *</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="3001234567"
              className={errors.phone ? 'error' : ''}
            />
            {errors.phone && <span className="error-message">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="address">Dirección de Entrega *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              placeholder="Calle 123 #45-67, Apartamento 101, Bogotá"
              className={errors.address ? 'error' : ''}
            />
            {errors.address && <span className="error-message">{errors.address}</span>}
          </div>

          {/* Payment Method Section */}
          <div className="payment-section">
            <h2 className="form-title">Método de Pago</h2>
            
            <div className="payment-methods">
              <div 
                className={`payment-method ${paymentMethod === 'SINPE' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('SINPE')}
              >
                <FaMobileAlt size={24} />
                <div>
                  <h3>SINPE Móvil</h3>
                  <p>Transferencia bancaria inmediata</p>
                </div>
              </div>

              <div 
                className={`payment-method ${paymentMethod === 'CARD' ? 'selected' : ''}`}
                onClick={() => setPaymentMethod('CARD')}
              >
                <FaCreditCard size={24} />
                <div>
                  <h3>Tarjeta de Crédito/Débito</h3>
                  <p>Pago seguro con tarjeta</p>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            {paymentMethod === 'SINPE' && (
              <div className="payment-details">
                <p className="payment-info">
                  <strong>Número de teléfono SINPE:</strong> 8888-8888<br />
                  <strong>Beneficiario:</strong> GAZEL Store<br />
                  <small>Completa el pago y envía el comprobante al correo: pagos@gazel.com</small>
                </p>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="payment-details">
                <p className="payment-info">
                  El pago con tarjeta se procesará al confirmar tu compra.
                </p>
              </div>
            )}
          </div>

          {!isAuthenticated && (
            <div className="auth-notice">
              <p>
                ¿Tienes una cuenta?{' '}
                <a href="/auth" onClick={(e) => { e.preventDefault(); navigate('/auth'); }}>
                  Inicia sesión
                </a>{' '}
                para autocompletar tus datos
              </p>
            </div>
          )}
        </form>

        <div className="order-summary">
          <h2 className="summary-title">Resumen del Pedido</h2>

          <div className="summary-items">
            {items.map((item) => (
              <div key={item.id_cart_item} className="summary-item">
                <img
                  src={item.product?.image_url || '/placeholder.jpg'}
                  alt={item.product?.name}
                  className="summary-item-image"
                />
                <div className="summary-item-info">
                  <p className="summary-item-name">{item.product?.name}</p>
                  <p className="summary-item-quantity">Cantidad: {item.quantity}</p>
                </div>
                <p className="summary-item-price">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </p>
              </div>
            ))}
          </div>

          <div className="summary-totals">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="summary-row">
              <span>Envío</span>
              <span>{shippingCost === 0 ? 'GRATIS' : formatPrice(shippingCost)}</span>
            </div>
            <div className="summary-divider" />
            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>
          </div>

          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn btn-submit"
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Compra'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
