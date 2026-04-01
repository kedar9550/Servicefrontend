import React from 'react'

function Bad_gateway() {
    return (
        <div className='bg_container'>
            <div className='container-fluid'>
                <div className='row d-flex justify-content-center align-items-center vh-100 bg_404'>
                    <div className='col-12 col-md-6 col-lg-7'>
                        <div className='d-flex flex-column justify-content-center align-items-center'>
                            <p className=" fw-bold mb-0 lh-1 number">404</p>
                            <p className="mb-0 lh-1 text">BAD GATEWAY</p>
                        </div>
                    </div>
                    <div className='col-12 col-md-6 col-lg-5'>
                        <img src='403-image.png' className='img-fluid' alt='404-image' />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Bad_gateway