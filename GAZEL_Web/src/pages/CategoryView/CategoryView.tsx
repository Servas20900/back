import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaBoxOpen } from 'react-icons/fa';
import ProductCard from '../../components/ProductCard/ProductCard';
import { productsService } from '../../services/api';
import type { Product } from '../../types';
import './CategoryView.css';

const CategoryView: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState('Productos');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        if (category) {
          // Convertir el parámetro a número
          const categoryId = parseInt(category, 10);
          const filtered = await productsService.getByCategory(categoryId) as Product[];
          setProducts(filtered);
          setCategoryName(filtered[0]?.category.name || 'Productos');
        } else {
          const allProducts = await productsService.getAll() as Product[];
          setProducts(allProducts);
        }
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="category-view">
        <p>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div className="category-view">
      <div className="category-header">
        <h1 className="category-title">{categoryName}</h1>
        <p className="category-count">{products.length} productos encontrados</p>
      </div>

      {products.length > 0 ? (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon"><FaBoxOpen size={48} /></div>
          <h2>No hay productos en esta categoría</h2>
          <p>Vuelve pronto para ver nuevos productos</p>
        </div>
      )}
    </div>
  );
};

export default CategoryView;
