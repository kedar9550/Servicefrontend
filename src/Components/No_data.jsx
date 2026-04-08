import React from 'react'

function No_data({ Data = "Data" }) {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            width: '100%',
            padding: '20px',
            backgroundColor: 'transparent',
            overflow: 'hidden'
        }}>
            <style>
                {`
                @media (max-width: 600px) {
                    .nodata-container {
                        flex-direction: column !important;
                        text-align: center !important;
                        gap: 20px !important;
                    }
                    .nodata-text {
                        text-align: center !important;
                        font-size: 1.8rem !important;
                    }
                    .nodata-img {
                        max-height: 140px !important;
                    }
                }
                `}
            </style>
            <div className="nodata-container" style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '40px',
                maxWidth: '800px',
                width: '100%'
            }}>
                <div className="nodata-text" style={{ textAlign: 'left', minWidth: '200px' }}>
                    <p className='fw-bold mb-0' style={{ textAlign: 'center', color: "var(--primary-color)", fontSize: "3.5rem", lineHeight: 1.2 }}>
                        No {Data} Found
                    </p>
                    <p className='h6 text-secondary text-center mt-2 mb-0'>We couldn't find any data to show</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <img src='/nodata.png' alt={`No ${Data} Found`} className='img-fluid nodata-img' style={{ maxHeight: '180px', objectFit: 'contain' }} />
                </div>
            </div>
        </div>
    )
}

export default No_data