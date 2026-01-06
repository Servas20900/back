import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsService } from '../../services/api';
import { useCart } from '../../context/CartContext';
import type { Product } from '../../types';
import './ProductDetail.css';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        if (id) {
          const data = await productsService.getById(parseInt(id)) as Product;
          setProduct(data);
        }
      } catch (error) {
        console.error('Error loading product:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);

  const stockAvailable = Math.max(0, Number(product?.stock ?? 0));

  if (loading) {
    return (
      <div className="product-detail">
        <p>Cargando producto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-not-found">
        <h2>Producto no encontrado</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">
          Volver al inicio
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

  const handleAddToCart = async () => {
    if (product) {
      try {
        await addToCart(product, quantity);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const handleBuyNow = async () => {
    if (product) {
      try {
        await addToCart(product, quantity);
        navigate('/cart');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const handleQuantityChange = (delta: number) => {
    const newQuantity = quantity + delta;
    if (newQuantity >= 1 && newQuantity <= stockAvailable) {
      setQuantity(newQuantity);
    }
  };

  return (
    <div className="product-detail">
      <div className="product-image-section">
        <div className="main-image-container">
          <img 
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
            className="main-image"
          />
        </div>
      </div>

      <div className="product-info-detail">
        <h1 className="product-title">{product.name}</h1>
        <p className="product-price-detail">{formatPrice(product.price)}</p>

        <div className="product-stock">
          {stockAvailable > 0 ? (
            <span className="in-stock">✓ En stock ({stockAvailable} disponibles)</span>
          ) : (
            <span className="out-of-stock">✗ Agotado</span>
          )}
        </div>

        <div className="product-description">
          <h3>Descripción</h3>
          <p>{product.description}</p>
        </div>

        {stockAvailable > 0 && (
          <>
            <div className="quantity-selector">
              <label>Cantidad:</label>
              <div className="quantity-controls">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  disabled={quantity <= 1}
                  className="quantity-btn"
                >
                  −
                </button>
                <span className="quantity-display">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  disabled={quantity >= stockAvailable}
                  className="quantity-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="product-actions">
              <button type="button" onClick={handleAddToCart} className="btn btn-add-to-cart">
                Agregar al Carrito
              </button>
              <button type="button" onClick={handleBuyNow} className="btn btn-buy-now">
                Comprar Ahora
              </button>
            </div>

            {showSuccess && (
              <div className="success-message">
                ✓ Producto agregado al carrito
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
