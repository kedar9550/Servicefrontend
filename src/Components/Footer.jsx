import React from "react";

const Footer = () => {
    return (
        <div className="auth-footer py-2 mt-auto" style={{ 
            backgroundColor: 'var(--stat-card-bg)',
            position: 'sticky',
            bottom: 0,
            zIndex: 1000,
            width: '100%',
            borderTop: '1px solid var(--border-color)'
        }}>
            <p className="text-center mb-0">
                Designed & Developed by{" "}
                <span className="brand">IT Applications</span>
            </p>
        </div>
    );
};

export default Footer;
