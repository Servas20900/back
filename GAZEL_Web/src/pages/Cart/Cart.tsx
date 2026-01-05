import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import './Cart.css';

const Cart: React.FC = () => {
  const { items, total, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="cart-empty">
        <div className="empty-cart-icon"><FaShoppingCart size={48} /></div>
        <h2>Tu carrito está vacío</h2>
        <p>Agrega productos para comenzar tu compra</p>
        <Link to="/" className="btn btn-primary">
          Ir a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">Carrito de Compras</h1>

      <div className="cart-container">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.id_cart_item} className="cart-item">
              <Link to={`/product/${item.product?.id_product}`} className="item-image-link">
                <img
                  src={item.product?.image_url || '/placeholder.jpg'}
                  alt={item.product?.name}
                  className="item-image"
                />
              </Link>

              <div className="item-details">
                <Link to={`/product/${item.product?.id_product}`} className="item-name">
                  {item.product?.name}
                </Link>
                <p className="item-price">{formatPrice(item.product?.price || 0)}</p>
              </div>

              <div className="item-quantity">
                <button
                  onClick={() => updateQuantity(item.id_cart_item, item.quantity - 1)}
                  className="quantity-btn"
                  disabled={item.quantity <= 1}
                >
                  −
                </button>
                <span className="quantity-value">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id_cart_item, item.quantity + 1)}
                  className="quantity-btn"
                  disabled={item.quantity >= (item.product?.stock || 0)}
                >
                  +
                </button>
              </div>

              <div className="item-total">
                <p className="subtotal-label">Subtotal:</p>
                <p className="subtotal-price">
                  {formatPrice((item.product?.price || 0) * item.quantity)}
                </p>
              </div>

              <button
                onClick={() => removeFromCart(item.id_cart_item)}
                className="remove-btn"
                aria-label="Eliminar producto"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <polyline points="3 6 5 6 21 6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path
                    d="m19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2 className="summary-title">Resumen del Pedido</h2>

          <div className="summary-row">
            <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} productos)</span>
            <span>{formatPrice(total)}</span>
          </div>

          <div className="summary-row">
            <span>Envío</span>
            <span>{total >= 100000 ? 'GRATIS' : formatPrice(10000)}</span>
          </div>

          <div className="summary-divider" />

          <div className="summary-row summary-total">
            <span>Total</span>
            <span>{formatPrice(total >= 100000 ? total : total + 10000)}</span>
          </div>

          {total < 100000 && (
            <p className="free-shipping-notice">
              Agrega {formatPrice(100000 - total)} más para envío gratis
            </p>
          )}

          <button onClick={handleCheckout} className="btn btn-checkout">
            Proceder al Pago
          </button>

          <Link to="/" className="continue-shopping">
            ← Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;
