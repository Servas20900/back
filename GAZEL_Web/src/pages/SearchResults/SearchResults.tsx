import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';import { FaSearch } from 'react-icons/fa';import ProductCard from '../../components/ProductCard/ProductCard';
import { productsService } from '../../services/api';
import type { Product } from '../../types';
import './SearchResults.css';

const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      try {
        setLoading(true);
        const products = await productsService.getAll() as Product[];
        // Filtrar localmente por nombre o descripción
        const filtered = products.filter(p => 
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
        );
        setResults(filtered);
      } catch (error) {
        console.error('Error searching products:', error);
      } finally {
        setLoading(false);
      }
    };

    if (query) {
      search();
    }
  }, [query]);

  if (loading) {
    return (
      <div className="search-results">
        <p>Buscando...</p>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-header">
        <h1 className="search-title">
          Resultados para: <span className="search-query">"{query}"</span>
        </h1>
        <p className="search-count">
          {results.length} {results.length === 1 ? 'producto encontrado' : 'productos encontrados'}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="products-grid">
          {results.map((product) => (
            <ProductCard key={product.id_product} product={product} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <div className="no-results-icon"><FaSearch size={48} /></div>
          <h2>No se encontraron productos</h2>
          <p>Intenta con otros términos de búsqueda</p>
          <Link to="/" className="btn btn-primary">
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
