import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Layout from './components/Layout/Layout';
import { AdminLayout } from './components/AdminLayout/AdminLayout';
import Home from './pages/Home/Home';
import CategoryView from './pages/CategoryView/CategoryView';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';
import Auth from './pages/Auth/Auth';
import SearchResults from './pages/SearchResults/SearchResults';
import OrderSuccess from './pages/OrderSuccess/OrderSuccess';
import { AdminCategories } from './pages/Admin/AdminCategories';
import { AdminProducts } from './pages/Admin/AdminProducts';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="category/:category" element={<CategoryView />} />
              <Route path="product/:id" element={<ProductDetail />} />
              <Route path="cart" element={<Cart />} />
              <Route path="checkout" element={<Checkout />} />
              <Route path="auth" element={<Auth />} />
              <Route path="search" element={<SearchResults />} />
              <Route path="order-success" element={<OrderSuccess />} />
            </Route>
            
            {/* Rutas de Administración */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="categories" element={<AdminCategories />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
