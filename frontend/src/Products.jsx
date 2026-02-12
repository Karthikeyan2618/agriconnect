import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api';
import { SectionHeader, Card, QuantitySelector } from './components';

function Products({ addToCart, cart, updateQuantity }) {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await api.get('products/');
                setProducts(response.data);
            } catch (err) {
                setError(err.message || 'Could not connect to the server.');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const getItemQuantity = (productId) => {
        const item = cart.find(i => i.id === productId);
        return item ? item.quantity : 0;
    };

    if (loading) return <div className="container" style={{ paddingTop: '100px', textAlign: 'center' }}>Loading products...</div>;

    if (error) return (
        <div className="container" style={{ paddingTop: '100px' }}>
            <Card style={{ color: '#ef4444', textAlign: 'center' }}>
                <h3 style={{ marginBottom: '1rem' }}>Connection Error</h3>
                <p>{error}</p>
            </Card>
        </div>
    );

    return (
        <div className="container">
            <SectionHeader
                badge="           "
                title="Fresh from the fields"
                subtitle="Support local farmers and get the highest quality organic produce."
                align="center"
            />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2rem' }}>
                {products.map((product) => {
                    const quantity = getItemQuantity(product.id);
                    return (
                        <Card key={product.id} padding="0" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                            {product.image_url && (
                                <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />
                            )}
                            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>{product.name}</h3>
                                <p style={{ color: '#4b5563', marginBottom: '1rem', height: '3rem', overflow: 'hidden' }}>{product.description}</p>
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
                                        <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }} onClick={() => { addToCart(product); navigate('/cart'); }}>
                                            Add to Cart
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
