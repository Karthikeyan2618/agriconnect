import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Products from './Products';
import Cart from './Cart';
import FarmerDashboard from './FarmerDashboard';
import OrderHistory from './OrderHistory';
import './index.css';

function Navbar({ cartCount }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [username, setUsername] = useState(null);
  const [role, setRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setUsername(null);
    setRole(null);
    hideMenu();
    navigate('/login');
  };

  const menuToggle = () => setMobileMenuOpen(!mobileMenuOpen);
  const hideMenu = () => setMobileMenuOpen(false);

  return (
    <nav className={scrolled ? 'scrolled glass-panel' : ''}>
      <div className="container nav-content">
        <Link to="/" className="logo" onClick={hideMenu}>
          🌱 Agriconnect
        </Link>
        <button className="mobile-toggle" onClick={menuToggle}>
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <Link to="/" className="nav-link" onClick={hideMenu}>Home</Link>
          {role === 'FARMER' ? (
            <Link to="/dashboard" className="nav-link" onClick={hideMenu}>Dashboard</Link>
          ) : (
            <Link to="/products" className="nav-link" onClick={hideMenu}>Marketplace</Link>
          )}
          {role === 'BUYER' && (
            <Link to="/orders" className="nav-link" onClick={hideMenu}>Orders</Link>
          )}
          {role !== 'FARMER' && (
            <Link to="/cart" className="nav-link" onClick={hideMenu}>
              Cart
              {cartCount > 0 && (
                <span className="cart-badge">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          {username ? (
            <div className="user-section">
              <span className="user-greeting">Hi, {username}</span>
              <button onClick={handleLogout} className="btn logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary" onClick={hideMenu}>Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function Features() {
  const features = [
    { title: 'Direct Market', desc: 'Connect directly with wholesale buyers and consumers.', icon: '🏪' },
    { title: 'Smart Insights', desc: 'Get real-time data on crop prices and weather trends.', icon: '📊' },
    { title: 'Safe Payments', desc: 'Secure blockchain-powered transactions for your harvest.', icon: '🛡️' },
    { title: 'Local Quality', desc: 'Supporting organic and sustainable local farming.', icon: '🚜' }
  ];

  return (
    <section style={{ padding: '8rem 0', background: 'transparent' }}>
      <div className="container">
        <div className="feature-badge" style={{ display: 'block', margin: '0 auto 1rem', width: 'fit-content' }}>Why Choose Us</div>
        <h2 className="section-title">Everything you need to grow</h2>
        <p className="section-subtitle">Empowering farmers with modern tools and a global connectivity platform.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2.5rem' }}>
          {features.map((f, i) => (
            <div key={i} className="glass-panel" style={{ padding: '2.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{f.icon}</div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--dark)' }}>{f.title}</h3>
              <p style={{ color: '#64748b' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer style={{ padding: '4rem 0', background: 'var(--dark)', color: 'white' }}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-light)', marginBottom: '0.5rem' }}>🌱 Agriconnect</h2>
          <p style={{ color: '#94a3b8' }}>Modernizing the roots of our world.</p>
        </div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Privacy</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>Terms</a>
          <a href="#" style={{ color: 'white', textDecoration: 'none' }}>About</a>
        </div>
      </div>
    </footer>
  );
}

function Home() {
  return (
    <div className="fade-in">
      <div className="hero">
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="feature-badge">Next-Gen Agriculture</div>
          <h1 style={{ fontSize: '4rem', maxWidth: '900px', margin: '0 auto 1.5rem' }}>Revolutionizing the way you grow & sell.</h1>
          <p style={{ margin: '0 auto 3rem', maxWidth: '700px' }}>Agriconnect bridges the gap between traditional farming and modern marketplaces, providing you with the tools to manage, sell, and thrive.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
            <Link to="/signup?role=FARMER" className="role-card farmer-card">
              <div className="role-icon">🚜</div>
              <h3>I am a Farmer</h3>
              <p>Manage your crops, track harvests, and reach buyers directly.</p>
              <span className="role-btn">Join as Farmer →</span>
            </Link>

            <Link to="/signup?role=BUYER" className="role-card buyer-card">
              <div className="role-icon">🛍️</div>
              <h3>I am a Buyer</h3>
              <p>Discover fresh produce directly from local farms at best prices.</p>
              <span className="role-btn">Browse Market →</span>
            </Link>
          </div>
        </div>
      </div>
      <Features />
      <Footer />
    </div>
  );
}

function App() {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => String(item.id) === String(product.id));
      if (existingItem) {
        return prevCart.map(item =>
          String(item.id) === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => String(item.id) !== String(productId)));
  };

  const updateQuantity = (productId, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (String(item.id) === String(productId)) {
          const newQuantity = item.quantity + delta;
          return { ...item, quantity: newQuantity };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <Router>
      <Navbar cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products addToCart={addToCart} cart={cart} updateQuantity={updateQuantity} />} />
        <Route path="/cart" element={<Cart cart={cart} removeFromCart={removeFromCart} updateQuantity={updateQuantity} clearCart={clearCart} />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/dashboard" element={<FarmerDashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
