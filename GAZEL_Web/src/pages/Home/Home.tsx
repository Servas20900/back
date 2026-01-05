import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTags, FaTruck, FaUndoAlt, FaLock, FaCreditCard } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard/ProductCard';
import { productsService, categoriesService } from '../../services/api';
import type { Product, Category } from '../../types';
import './Home.css';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const products = await productsService.getAll() as Product[];
        // Tomar los primeros 8 productos como destacados
        setFeaturedProducts(products.slice(0, 8));
      } catch (error) {
        console.error('Error loading products:', error);
      }
    };

    const loadCategories = async () => {
      try {
        const data = await categoriesService.getAll();
        setCategories(data as Category[]);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };

    loadProducts();
    loadCategories();
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">GAZEL</h1>
          <p className="hero-subtitle">Ropa Deportiva Femenina</p>
          <p className="hero-description">
            Descubre nuestra colección de ropa deportiva diseñada para mujeres activas y dinámicas.
            Comodidad, estilo y rendimiento en cada prenda.
          </p>
          <div className="hero-buttons">
            <Link to="/category/licras" className="btn btn-primary">
              Ver Colección
            </Link>
            <Link to="/category/parte-superior" className="btn btn-secondary">
              Explorar Tops
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="categories-section">
        <h2 className="section-title">Compra por Categoría</h2>
        <div className="categories-grid">
          {categories.map((cat, index) => {
            const colors = ['#ec4899', '#db2777', '#be185d', '#9f1239'];
            return (
              <Link key={cat.id_category} to={`/category/${cat.id_category}`} className="category-card">
                <div className="category-image" style={{ backgroundColor: colors[index % colors.length] }}>
                  <span className="category-icon"><FaTags size={48} /></span>
                </div>
                <h3>{cat.name}</h3>
                <p>{cat.description || 'Explora nuestros productos'}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Products */}
      <section className="featured-section">
        <h2 className="section-title">Productos Destacados</h2>
        <div className="products-grid">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>
        <div className="view-all-container">
          <Link to="/category/licras" className="btn btn-outline">
            Ver Todos los Productos
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon"><FaTruck size={32} /></div>
            <h3>Envío Gratis</h3>
            <p>En compras superiores a $100.000</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaUndoAlt size={32} /></div>
            <h3>Cambios Fáciles</h3>
            <p>30 días para cambios y devoluciones</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaLock size={32} /></div>
            <h3>Pago Seguro</h3>
            <p>Protegemos tus datos personales</p>
          </div>

          <div className="feature-card">
            <div className="feature-icon"><FaCreditCard size={32} /></div>
            <h3>Múltiples Pagos</h3>
            <p>Aceptamos todas las tarjetas</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
