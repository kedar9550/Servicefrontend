import React, { useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

function Loader() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    return (
        <div className="loader-overlay">
            <img
                src={isDark ? "/Circle_Gold.png" : "/Circle_Orange.png"}
                alt="Loading..."
                style={{ width: "90px", height: "90px" }}
                className='load'
            />
            <div>
                <img
                    src={isDark ? "/loader_icon_dark.png" : "/loader_icon.png"}
                    className=''
                    alt='icon'
                    style={{ width: "16px", height: "15px", position: "absolute", top: "49.8%", left: "50%", transform: "translate(-50%, -50%)" }}
                />
            </div>
        </div>
    )
}

export default Loader;