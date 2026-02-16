import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { SectionHeader, Card, QuantitySelector } from './components';

function Products({ addToCart, cart, updateQuantity }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [role, setRole] = useState(null);

    // Filter States
    const [filters, setFilters] = useState({
        max_distance: '',
        crop_type: '',
        harvest_date: ''
    });

    useEffect(() => {
        setRole(localStorage.getItem('role'));
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.max_distance) params.append('max_distance', filters.max_distance);
            if (filters.crop_type) params.append('crop_type', filters.crop_type);
            if (filters.harvest_date) params.append('harvest_date', filters.harvest_date);

            const response = await api.get(`products/?${params.toString()}`);
            setProducts(response.data);
        } catch (err) {
            setError(err.message || 'Could not connect to the server.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [filters]);

    const getItemQuantity = (productId) => {
        const item = cart.find(i => String(i.id) === String(productId));
        return item ? item.quantity : 0;
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const clearFilters = () => {
        setFilters({
            max_distance: '',
            crop_type: '',
            harvest_date: ''
        });
    };

    if (loading && products.length === 0) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading products...</div>;

    return (
        <div className="container">
            <SectionHeader
                badge="                                           "
                badgeStyle={{ background: 'var(--primary-light)', color: 'var(--primary-dark)' }}
                title="Fresh from the fields"
                subtitle="Support local farmers and get the highest quality organic produce."
                align="center"
            />

            {/* Filter Bar - Only for Buyers */}
            {role === 'BUYER' && (
                <Card style={{ marginBottom: '2rem', padding: '1.5rem', background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)' }}>
                    <div className="grid-cols-3" style={{ alignItems: 'end' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>Distance</label>
                            <select
                                name="max_distance"
                                value={filters.max_distance}
                                onChange={handleFilterChange}
                                className="form-input"
                                style={{ margin: 0 }}
                            >
                                <option value="">Any distance</option>
                                <option value="10">Within 10 km</option>
                                <option value="25">Within 25 km</option>
                                <option value="50">Within 50 km</option>
                                <option value="100">Within 100 km</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>Crop Type</label>
                            <input
                                type="text"
                                name="crop_type"
                                value={filters.crop_type}
                                onChange={handleFilterChange}
                                placeholder="e.g. Tomato"
                                className="form-input"
                                style={{ margin: 0 }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.85rem' }}>Harvest Date</label>
                            <input
                                type="date"
                                name="harvest_date"
                                value={filters.harvest_date}
                                onChange={handleFilterChange}
                                className="form-input"
                                style={{ margin: 0 }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-primary" onClick={fetchProducts} style={{ flex: 1 }}>Filter</button>
                            <button className="btn" onClick={clearFilters} style={{ background: '#f3f4f6', border: '1px solid #d1d5db' }}>Clear</button>
                        </div>
                    </div>

                    {/* Location Helper for Buyers */}
                    <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px dotted #e2e8f0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            Distance filtering requires your location.
                        </span>
                        <button
                            className="btn"
                            style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: '#ecfdf5', color: '#059669', border: '1px solid #10b981' }}
                            onClick={async () => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(async (pos) => {
                                        try {
                                            await api.patch('profile/', {
                                                latitude: pos.coords.latitude.toFixed(6),
                                                longitude: pos.coords.longitude.toFixed(6)
                                            });
                                            alert('Location updated! You can now filter by distance.');
                                            fetchProducts();
                                        } catch (err) {
                                            alert('Failed to update location.');
                                        }
                                    });
                                }
                            }}
                        >
                            📍 Update My Location
                        </button>
                    </div>
                </Card>
            )}

            {error && (
                <Card style={{ color: '#ef4444', textAlign: 'center', marginBottom: '2rem' }}>
                    <p>{error}</p>
                </Card>
            )}

            {loading && products.length > 0 && (
                <div style={{ textAlign: 'center', marginBottom: '1rem', color: 'var(--primary)', fontWeight: 600 }}>Updating results...</div>
            )}

            {!loading && products.length === 0 && (
                <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚜</div>
                    <h3>No products found</h3>
                    <p style={{ color: '#64748b' }}>Try adjusting your filters to find what you're looking for.</p>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {products.map((product) => {
                    const quantity = getItemQuantity(product.id);
                    return (
                        <Card key={product.id} padding="0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {product.image && (
                                <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            )}
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                                    <h3 style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>{product.name}</h3>
                                    {product.crop_type && (
                                        <span style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', background: '#ecfdf5', color: '#059669', borderRadius: '1rem', fontWeight: 600 }}>{product.crop_type}</span>
                                    )}
                                </div>
                                <p style={{ color: '#4b5563', marginBottom: '1rem', height: '3rem', overflow: 'hidden', fontSize: '0.9rem' }}>{product.description}</p>


                                <div className="flex-between" style={{ marginBottom: '1.5rem' }}>
                                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>₹{product.price}</span>
                                    <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{product.stock} kg available</span>
                                </div>
                                <div className="flex-between" style={{ marginTop: 'auto' }}>
                                    <div /> {/* Spacer */}
                                    {quantity > 0 ? (
                                        <QuantitySelector
                                            quantity={quantity}
                                            onIncrease={() => updateQuantity(product.id, 1)}
                                            onDecrease={() => updateQuantity(product.id, -1)}
                                        />
                                    ) : (
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                            onClick={() => { addToCart(product); navigate('/cart'); }}
                                            disabled={product.stock <= 0}
                                        >
                                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}

export default Products;
