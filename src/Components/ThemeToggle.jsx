import React from "react";
import { useTheme } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  const isLight = theme === "light";

  return (
    <button
      onClick={toggleTheme}
      title={`Switch to ${isLight ? "dark" : "light"} mode`}
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
        width: "72px",
        height: "36px",
        backgroundColor: isLight ? "#ffffff" : "#2d3748",
        border: isLight ? "1.5px solid #e2e8f0" : "1.5px solid #4a5568",
        borderRadius: "50px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
        cursor: "pointer",
        marginRight: "15px",
        outline: "none",
        padding: "0",
        transition: "all 0.3s ease"
      }}
    >
      {/* Icon Slots */}
      <div style={{
        position: "absolute",
        left: "0",
        right: "0",
        top: "0",
        bottom: "0",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 10px",
        pointerEvents: "none"
      }}>
        {/* Left Side: Sun in Light mode, Nothing in Dark mode (thumb covers it) */}
        <div style={{ width: "20px", display: "flex", justifyContent: "center" }}>
          {isLight ? (
            <svg 
              width="18" height="18" viewBox="0 0 24 24" 
              fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
            </svg>
          ) : null}
        </div>

        {/* Right Side: Moon in Dark mode, Nothing in Light mode (thumb covers it) */}
        <div style={{ width: "20px", display: "flex", justifyContent: "center" }}>
          {!isLight ? (
            <svg 
              width="18" height="18" viewBox="0 0 24 24" 
              fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
            </svg>
          ) : null}
        </div>
      </div>

      {/* The Sliding Circle Highlight (Thumb) */}
      <div
        style={{
          position: "absolute",
          width: "30px",
          height: "30px",
          borderRadius: "50%",
          backgroundColor: isLight ? "#fef3c7" : "transparent", 
          border: isLight ? "4px solid #fbbf24" : "3.5px solid #ffffff", 
          transition: "transform 0.3s ease-in-out",
          transform: isLight ? "translateX(36px)" : "translateX(3px)",
          boxSizing: "border-box",
          top: "2px"
        }}
      />
    </button>
  );
};

export default ThemeToggle;
