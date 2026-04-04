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
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "4px 8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "8px",
        transition: "background 0.2s ease",
        marginRight: "8px",
        outline: "none",
      }}
      onMouseEnter={e => e.currentTarget.style.background = "var(--sidebar-hover)"}
      onMouseLeave={e => e.currentTarget.style.background = "none"}
    >
      {isLight ? (
        /* Filled Moon — click to go dark */
        <svg
          width="24" height="24" viewBox="0 0 24 24"
          fill="#6366f1" stroke="#6366f1" strokeWidth="0.5"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          <circle cx="18.5" cy="4.2" r="1.3" fill="white" stroke="none" />
          <circle cx="21.2" cy="7.8" r="0.9" fill="white" stroke="none" />
        </svg>
      ) : (
        /* Filled Sun — click to go light */
        <svg
          width="24" height="24" viewBox="0 0 24 24"
          fill="#f59e0b" stroke="#f59e0b" strokeWidth="1"
          strokeLinecap="round" strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4.5" />
          <path
            d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
};

export default ThemeToggle;
