import React from 'react';

export const Badge = ({ children, color = 'var(--primary)' }) => (
    <div className="feature-badge" style={{
        background: `${color}1a`,
        color: color,
        display: 'inline-block'
    }}>
        {children}
    </div>
);

export const SectionHeader = ({ badge, title, subtitle, align = 'center' }) => (
    <div style={{ padding: '2rem 0', textAlign: align }}>
        {badge && <Badge>{badge}</Badge>}
        <h1 className="section-title">{title}</h1>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
);

export const Card = ({ children, padding = '2rem', style = {} }) => (
    <div className="glass-panel" style={{ padding, ...style }}>
        {children}
    </div>
);

export const InputGroup = ({ label, type = 'text', value, onChange, placeholder, required = false, isSelect = false, children, ...props }) => (
    <div className="form-group">
        {label && <label>{label}</label>}
        {isSelect ? (
            <select className="form-input" value={value} onChange={onChange} required={required} {...props}>
                {children}
            </select>
        ) : type === 'textarea' ? (
            <textarea className="form-input" value={value} onChange={onChange} placeholder={placeholder} required={required} style={{ minHeight: '100px' }} {...props} />
        ) : (
            <input className="form-input" type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} {...props} />
        )}
    </div>
);

export const QuantitySelector = ({ quantity, onIncrease, onDecrease }) => (
    <div className="quantity-controls">
        <button className="quantity-btn" onClick={onDecrease}>−</button>
        <span style={{ fontWeight: 700, minWidth: '24px', textAlign: 'center' }}>{quantity}</span>
        <button className="quantity-btn" onClick={onIncrease}>+</button>
    </div>
);
