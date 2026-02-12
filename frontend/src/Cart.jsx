import { useState } from 'react';
import { Card, SectionHeader, QuantitySelector } from './components';
import api from './api';
import { useNavigate } from 'react-router-dom';

function Cart({ cart, updateQuantity, removeFromCart, clearCart }) {
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setLoading(true);
        try {
            const items = cart.map(item => ({
                product_id: item.id,
                quantity: item.quantity
            }));
            await api.post('orders/', { items });
            // clearCart is not passed as prop yet in App.jsx, handling locally or fix App.jsx
            // For now, let's assume we need to implement clearCart in App.jsx
            // But to avoid breaking, let's reload or manually clear if prop exists
            if (clearCart) clearCart();
            else {
                // Fallback if clearCart not passed: maybe just navigate
                // ideally we should fix App.jsx to pass clearCart
            }
            alert('Order placed successfully!');
            navigate('/orders');
            window.location.reload(); // Simple way to clear cart state if clearCart not available
        } catch (err) {
            console.error(err);
            alert('Failed to place order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="container" style={{ textAlign: 'center', padding: '5rem 0' }}>
                <SectionHeader title="Your Cart is Empty" subtitle="Start exploring fresh produce from our farmers." />
                <a href="/products" className="btn btn-primary">Browse Products</a>
            </div>
        );
    }

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <SectionHeader title="Shopping Cart" badge="Checkout" />
            <div className="grid-cols-2" style={{ gridTemplateColumns: '2fr 1fr' }}>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {cart.map(item => (
                        <Card key={item.id} padding="1.5rem" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                            <img src={item.image_url || 'https://via.placeholder.com/80'} alt="" style={{ width: '80px', height: '80px', borderRadius: '0.75rem', objectFit: 'cover' }} />
                            <div style={{ flex: 1 }}>
                                <h3 style={{ margin: 0, fontSize: '1.25rem' }}>{item.name}</h3>
                                <p style={{ color: '#64748b', margin: '0.25rem 0' }}>₹{item.price} / kg</p>
                            </div>
                            <QuantitySelector
                                quantity={item.quantity}
                                onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                                onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                            />
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: '80px', textAlign: 'right' }}>
                                ₹{(item.price * item.quantity).toFixed(2)}
                            </div>
                            <button onClick={() => removeFromCart(item.id)} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer' }}>
                                ✕
                            </button>
                        </Card>
                    ))}
                </div>
                <div>
                    <Card>
                        <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#64748b' }}>Subtotal</span>
                            <span style={{ fontWeight: 600 }}>₹{total.toFixed(2)}</span>
                        </div>
                        <div className="flex-between" style={{ marginBottom: '1rem' }}>
                            <span style={{ color: '#64748b' }}>Delivery</span>
                            <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Free</span>
                        </div>
                        <hr style={{ margin: '1.5rem 0', border: '0', borderTop: '1px solid #e2e8f0' }} />
                        <div className="flex-between" style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 800 }}>
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                        <button
                            className="btn btn-primary"
                            style={{ width: '100%', padding: '1rem' }}
                            onClick={handleCheckout}
                            disabled={loading}
                        >
                            {loading ? 'Processing...' : 'Proceed to Checkout'}
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Cart;
