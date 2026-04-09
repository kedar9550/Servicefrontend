import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import circleGold from '../assets/Circle_Gold.png';
import circleOrange from '../assets/Circle_Orange.png';
import loaderIconDark from '../assets/loader_icon_dark.png';
import loaderIcon from '../assets/loader_icon.png';

function Loader() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    // Explicitly select images for the current theme
    const circleSrc = isDark ? circleGold : circleOrange;
    const iconSrc = isDark ? loaderIconDark : loaderIcon;

    // Background color based on theme with opacity for the overlay only
    // This prevents the images themselves from being semi-transparent
    const overlayBg = isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(248, 250, 252, 0.85)';

    return (
        <div className="loader-overlay" style={{ backgroundColor: overlayBg, opacity: 1, backdropFilter: 'blur(8px)' }}>
            <div style={{ position: 'relative', width: '90px', height: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <img
                    src={circleSrc}
                    alt="Loading..."
                    style={{ width: "90px", height: "90px" }}
                    className='load'
                />
                <img
                    src={iconSrc}
                    alt='icon'
                    style={{
                        width: "16px",
                        height: "16px",
                        position: "absolute",
                        top: "49.8%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        objectFit: 'contain'
                    }}
                />
            </div>
        </div>
    )
}

export default Loader;