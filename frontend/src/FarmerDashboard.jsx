import { useState, useEffect } from 'react';
import api from './api';
import { SectionHeader, Card, InputGroup, Badge } from './components';

const InventoryManagement = ({
    products, loading, onEdit, onDelete, onAdd,
    editingProduct, resetForm, productState, setProductState
}) => (
    <div id="products-section" style={{ marginBottom: '5rem' }}>
        <h2 className="section-header-accent">Inventory Management</h2>
        <div className="grid-cols-2" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
            <Card padding="2rem">
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--primary-dark)' }}>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <form onSubmit={onAdd}>
                    <InputGroup label="Product Name" value={productState.name} onChange={(e) => setProductState({ ...productState, name: e.target.value })} required />
                    <InputGroup label="Description" type="textarea" value={productState.description} onChange={(e) => setProductState({ ...productState, description: e.target.value })} required />

                    <div className="grid-cols-2" style={{ gap: '1rem' }}>
                        <InputGroup label="Price (₹)" type="number" step="0.01" value={productState.price} onChange={(e) => setProductState({ ...productState, price: e.target.value })} required />
                        <InputGroup label="Stock (kg)" type="number" value={productState.stock} onChange={(e) => setProductState({ ...productState, stock: e.target.value })} required />
                    </div>


                    <InputGroup label="Image URL" value={productState.imageUrl} onChange={(e) => setProductState({ ...productState, imageUrl: e.target.value })} placeholder="/images/tomatoes.png" />

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>{editingProduct ? 'Update' : 'Add Product'}</button>
                        {editingProduct && <button type="button" onClick={resetForm} className="btn" style={{ flex: 1, background: 'white', border: '1px solid #d1d5db' }}>Cancel</button>}
                    </div>
                </form>
            </Card>

            <div>
                <h3 style={{ marginBottom: '1.5rem', color: 'var(--dark)' }}>Your Listed Products</h3>
                {loading ? <p>Loading...</p> : products.length === 0 ? <p>No products yet.</p> : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {products.map(p => (
                            <Card key={p.id} padding="1rem" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <img src={p.image_url || 'https://via.placeholder.com/60'} alt="" style={{ width: '60px', height: '60px', borderRadius: '0.5rem', objectFit: 'cover' }} />
                                <div style={{ flex: 1 }}>
                                    <h4 style={{ margin: 0 }}>{p.name}</h4>
                                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>₹{p.price} | {p.stock}kg</p>
                                </div>
                                <button onClick={() => onEdit(p)} style={{ border: 'none', background: 'none', color: 'var(--primary)', fontWeight: 600 }}>Edit</button>
                                <button onClick={() => onDelete(p.id)} style={{ border: 'none', background: 'none', color: '#ef4444', fontWeight: 600 }}>Delete</button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </div>
);

const FarmProfileSection = ({ landSize, setLandSize, location, setLocation, soilType, setSoilType, onUpdate }) => (
    <div id="profile-section" style={{ marginBottom: '5rem' }}>
        <h2 className="section-header-accent">Farm Profile</h2>
        <Card style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Farm Details</h3>
            <form onSubmit={onUpdate}>
                <InputGroup label="Land Size (Acres)" type="number" step="0.1" value={landSize} onChange={(e) => setLandSize(e.target.value)} required />
                <InputGroup label="Location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Enter your farm location" />
                <InputGroup label="Soil Type" isSelect value={soilType} onChange={(e) => setSoilType(e.target.value)}>
                    <option value="">Select Soil Type</option>
                    <option value="SILT">Silt</option>
                    <option value="CLAY">Clay</option>
                    <option value="LOAM">Loam</option>
                    <option value="SANDY">Sandy</option>
                    <option value="PEAT">Peat</option>
                    <option value="CHALK">Chalk</option>
                </InputGroup>
                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '1rem' }}>Update Profile</button>
            </form>
        </Card>
    </div>
);

const CropCalendarSection = ({ cropPlans, onAdd, state, setState }) => (
    <div id="calendar-section" style={{ marginBottom: '2rem' }}>
        <h2 className="section-header-accent">Crop Calendar</h2>
        <div className="grid-cols-2" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
            <Card padding="2.5rem">
                <h3 style={{ marginBottom: '1.5rem' }}>New Crop Plan</h3>
                <form onSubmit={onAdd}>
                    <InputGroup label="Crop Variety" value={state.cropVariety} onChange={(e) => setState({ ...state, cropVariety: e.target.value })} required />
                    <InputGroup label="Planting Date" type="date" value={state.plantingDate} onChange={(e) => setState({ ...state, plantingDate: e.target.value })} required />
                    <InputGroup label="Expected Harvest Date" type="date" value={state.harvestDate} onChange={(e) => setState({ ...state, harvestDate: e.target.value })} required />
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Create Plan</button>
                </form>
            </Card>
            <div>
                <h3 style={{ marginBottom: '1.5rem' }}>Active Crop Plans</h3>
                <div style={{ display: 'grid', gap: '1.5rem' }}>
                    {cropPlans.length === 0 ? <p style={{ color: '#64748b' }}>No active plans.</p> : cropPlans.map(plan => (
                        <Card key={plan.id} padding="1.5rem">
                            <div className="flex-between" style={{ marginBottom: '1rem' }}>
                                <h4 style={{ margin: 0, fontSize: '1.25rem' }}>{plan.crop_variety}</h4>
                                <Badge color="var(--primary)">
                                    {Math.ceil((new Date(plan.expected_harvest_date) - new Date()) / (1000 * 60 * 60 * 24))} days left
                                </Badge>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Planting Date</p>
                                    <p style={{ margin: 0, fontWeight: 600, fontSize: '0.9rem' }}>{plan.planting_date}</p>
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Harvest Date</p>
                                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--accent)', fontSize: '0.9rem' }}>{plan.expected_harvest_date}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>Est. Volume</p>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: '0.9rem' }}>{plan.estimated_volume} kg</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    </div>
);

function FarmerDashboard() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);

    const [productState, setProductState] = useState({
        name: '', description: '', price: '', stock: '', imageUrl: ''
    });

    const [profileState, setProfileState] = useState({ landSize: '', location: '', soilType: '' });
    const [cropPlans, setCropPlans] = useState([]);
    const [calendarState, setCalendarState] = useState({ cropVariety: '', plantingDate: '', harvestDate: '' });
    // Add missing orders state
    const [orders, setOrders] = useState([]);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [prodRes, profRes, planRes, ordRes] = await Promise.all([
                api.get('products/?role=FARMER'),
                api.get('profile/'),
                api.get('crop-plans/'),
                api.get('orders/')
            ]);
            setProducts(prodRes.data);
            setProfileState({
                landSize: profRes.data.land_size || '',
                location: profRes.data.location || '',
                soilType: profRes.data.soil_type || ''
            });
            setCropPlans(planRes.data);
            setOrders(ordRes.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            await api.put('profile/', {
                land_size: profileState.landSize,
                location: profileState.location,
                soil_type: profileState.soilType
            });
            setMessage('Profile updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update profile.');
        }
    };

    const handleProductSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: productState.name,
                description: productState.description,
                price: productState.price,
                stock: productState.stock,
                image_url: productState.imageUrl || null
            };

            if (editingProduct) {
                await api.put(`products/${editingProduct.id}/`, payload);
                setMessage('Product updated successfully!');
            } else {
                await api.post('products/', payload);
                setMessage('Product added successfully!');
            }

            resetProductForm();
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to save product.');
        }
    };

    const handleAddCropPlan = async (e) => {
        e.preventDefault();
        try {
            await api.post('crop-plans/', {
                crop_variety: calendarState.cropVariety,
                planting_date: calendarState.plantingDate,
                expected_harvest_date: calendarState.harvestDate
            });
            setMessage('Crop plan added!');
            fetchData();
            setCalendarState({ cropVariety: '', plantingDate: '', harvestDate: '' });
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to add crop plan.');
        }
    };

    const handleEdit = (product) => {
        setEditingProduct(product);
        setProductState({
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            imageUrl: product.image_url || ''
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetProductForm = () => {
        setEditingProduct(null);
        setProductState({ name: '', description: '', price: '', stock: '', imageUrl: '' });
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        try {
            await api.delete(`products/${id}/`);
            fetchData();
        } catch (err) {
            console.error('Error deleting product:', err);
        }
    };
    const handleStatusUpdate = async (orderId, newStatus) => {
        try {
            await api.patch(`orders/${orderId}/update_status/`, { status: newStatus });
            setMessage(`Order #${orderId} marked as ${newStatus}`);
            fetchData();
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage('Failed to update status.');
        }
    };

    return (
        <div className="container" style={{ paddingBottom: '60px' }}>
            <SectionHeader
                badge="Farmer Dashboard"
                title="Operational Excellence"
                subtitle="Manage your inventory, optimize your farm, and track your harvest."
            />

            {message && (
                <div className="fade-in" style={{
                    position: 'fixed', top: '100px', right: '2rem', zIndex: 100,
                    background: 'var(--primary)', color: 'white', padding: '1rem 2rem',
                    borderRadius: '0.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontWeight: 600
                }}>
                    {message}
                </div>
            )}

            <InventoryManagement
                products={products}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteProduct}
                onAdd={handleProductSubmit}
                editingProduct={editingProduct}
                resetForm={resetProductForm}
                productState={productState}
                setProductState={setProductState}
            />

            <hr style={{ margin: '4rem 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

            <FarmProfileSection
                landSize={profileState.landSize}
                setLandSize={(v) => setProfileState({ ...profileState, landSize: v })}
                location={profileState.location}
                setLocation={(v) => setProfileState({ ...profileState, location: v })}
                soilType={profileState.soilType}
                setSoilType={(v) => setProfileState({ ...profileState, soilType: v })}
                onUpdate={handleUpdateProfile}
            />

            <hr style={{ margin: '4rem 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

            <CropCalendarSection
                cropPlans={cropPlans}
                onAdd={handleAddCropPlan}
                state={calendarState}
                setState={setCalendarState}
            />

            <hr style={{ margin: '4rem 0', border: '0', borderTop: '1px solid #e2e8f0' }} />

            <div id="orders-section" style={{ marginBottom: '2rem' }}>
                <h2 className="section-header-accent">Incoming Orders</h2>
                {orders.length === 0 ? <p>No orders yet.</p> : (
                    <div style={{ display: 'grid', gap: '1.5rem' }}>
                        {orders.map(order => (
                            <Card key={order.id} padding="1.5rem">
                                <div className="flex-between">
                                    <h3>Order #{order.id} <span style={{ fontSize: '0.9rem', color: '#64748b' }}>by {order.buyer_name}</span></h3>
                                    <Badge color="var(--accent)">{order.status.replace('_', ' ')}</Badge>
                                </div>
                                <div style={{ margin: '1rem 0' }}>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid #f1f5f9' }}>
                                            <span>{item.quantity}x {item.product_name}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-between" style={{ alignItems: 'center' }}>
                                    <span style={{ fontWeight: 700 }}>Total: ₹{order.total_amount}</span>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {['PENDING', 'CONFIRMED', 'PACKED', 'OUT_FOR_DELIVERY', 'COMPLETED'].map(status => (
                                            <button
                                                key={status}
                                                onClick={() => handleStatusUpdate(order.id, status)}
                                                disabled={order.status === status}
                                                style={{
                                                    padding: '0.25rem 0.5rem',
                                                    fontSize: '0.75rem',
                                                    borderRadius: '0.25rem',
                                                    border: '1px solid var(--primary)',
                                                    background: order.status === status ? 'var(--primary)' : 'white',
                                                    color: order.status === status ? 'white' : 'var(--primary)',
                                                    cursor: order.status === status ? 'default' : 'pointer'
                                                }}
                                            >
                                                {status.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default FarmerDashboard;
