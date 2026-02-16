import { useState, useEffect } from 'react';
import api from './api';
import { SectionHeader, Card, Badge } from './components';

function OrderHistory() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('orders/')
            .then(res => {
                setOrders(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#f59e0b';
            case 'CONFIRMED': return '#3b82f6';
            case 'PACKED': return '#8b5cf6';
            case 'OUT_FOR_DELIVERY': return '#ec4899';
            case 'COMPLETED': return '#10b981';
            default: return '#64748b';
        }
    };

    const handleDownloadInvoice = async (orderId) => {
        try {
            const response = await api.get(`orders/${orderId}/download_invoice/`, {
                responseType: 'blob'
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `invoice_${orderId}.pdf`);
            document.body.appendChild(link);
            link.click();
        } catch (err) {
            console.error('Failed to download invoice', err);
            alert('Failed to download invoice.');
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <SectionHeader title="Order History" badge="Track & Manage" />

            {loading ? <p>Loading orders...</p> : orders.length === 0 ? <p className="section-subtitle">No orders found.</p> : (
                <div style={{ display: 'grid', gap: '2rem' }}>
                    {orders.map(order => (
                        <Card key={order.id} padding="2rem">
                            <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Order #{order.id}</h3>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    <Badge color={getStatusColor(order.status)}>{(order.status || 'PENDING').replace(/_/g, ' ')}</Badge>
                                    <button
                                        className="btn"
                                        style={{ border: '1px solid #e2e8f0', background: 'white', padding: '0.5rem 1rem' }}
                                        onClick={() => handleDownloadInvoice(order.id)}
                                    >
                                        Download Invoice
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.5rem' }}>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex-between" style={{
                                        padding: '0.75rem 0',
                                        borderBottom: idx === order.items.length - 1 ? 'none' : '1px solid #e2e8f0'
                                    }}>
                                        <span>{item.quantity}x {item.product_name}</span>
                                        <span style={{ fontWeight: 600 }}>₹{(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="flex-between" style={{ marginTop: '1.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                                <span>Total Amount</span>
                                <span>₹{order.total_amount}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

export default OrderHistory;
