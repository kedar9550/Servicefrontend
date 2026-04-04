import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useState, useEffect, useRef } from "react";
import { BsList } from "react-icons/bs";
import logo from "../assets/logoHome.png";
import NotificationBell from "../Components/NotificationBell";
import ThemeToggle from "../Components/ThemeToggle";
import { useNavigate } from "react-router-dom";

function Header({ sidebarOpen, isMobile }) {
  const { logout, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const [imgSrc, setImgSrc] = useState(null);
  const [imgKey, setImgKey] = useState(Date.now());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (user) {
      if (user.profileImage) {
        setImgSrc(`${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${user.profileImage}?v=${Date.now()}`);
      } else if (user.institutionId) {
        setImgSrc(`https://info.aec.edu.in/aec/employeephotos/${user.institutionId}.jpg`);
      } else {
        setImgSrc(null);
      }
      setImgKey(Date.now());
    }
  }, [user]);

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const profileAvatar = imgSrc ? (
    <img
      src={imgSrc}
      alt="Profile"
      onError={() => setImgSrc(null)}
      className="rounded-circle shadow"
      style={{ width: "40px", height: "40px", objectFit: "cover", cursor: "pointer" }}
    />
  ) : (
    <div
      className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow"
      style={{ width: "40px", height: "40px", fontSize: "18px", fontWeight: "bold", cursor: "pointer", color: "#ffffff" }}
    >
      {user?.name?.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <nav
      className={`navbar px-4 d-flex ${isMobile ? "justify-content-between" : "justify-content-end"} align-items-center`}
      style={{
        height: "60px",
        position: "fixed",
        top: 0,
        left: isMobile ? "0px" : (sidebarOpen ? "250px" : "80px"),
        right: 0,
        zIndex: 1000,
        transition: "0.3s",
        backgroundColor: "var(--header-bg)",
        borderBottom: "1px solid var(--border-color)",
        color: "var(--text-color)"
      }}
    >
      {/* Mobile Logo */}
      {isMobile && (
        <div className="d-flex align-items-center" style={{ marginLeft: "-16px" }}>
          <img
            src={isDark ? "/Gold_logo.png" : "/Orange_logo.png"}
            alt="Logo"
            style={{ width: "150px", cursor: "pointer" }}
          />
        </div>
      )}

      {/* Right Section */}
      <div className="d-flex align-items-center">
        {!isMobile && <ThemeToggle />}

        {/* NotificationBell: always rendered; bell icon hidden on mobile via hideBell prop */}
        <NotificationBell
          externalOpen={notifOpen}
          onExternalClose={() => setNotifOpen(false)}
          hideBell={isMobile}
        />

        {/* Profile Avatar + Dropdown */}
        <div ref={profileRef} style={{ position: "relative" }}>
          <div onClick={() => isMobile && setShowProfileMenu(prev => !prev)}>
            {profileAvatar}
          </div>

          {/* Profile Dropdown — mobile only */}
          {isMobile && showProfileMenu && (
            <div
              style={{
                position: "fixed",
                top: "65px",
                right: "12px",
                width: "200px",
                backgroundColor: "var(--card-bg)",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                zIndex: 2100,
                overflow: "hidden",
                padding: "6px 0",
              }}
            >
              {/* User info */}
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border-color)" }}>
                <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "var(--text-color)" }}>
                  {user?.name}
                </p>
                <p style={{ margin: 0, fontSize: "0.75rem", color: "var(--secondary-color)" }}>
                  {user?.email}
                </p>
              </div>

              {/* Notifications */}
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  setNotifOpen(true);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px",
                  width: "100%", padding: "10px 16px",
                  background: "none", border: "none", cursor: "pointer",
                  color: "var(--text-color)", fontSize: "0.88rem",
                  textAlign: "left",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--sidebar-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "none"}
              >
                <i className="bi bi-bell" style={{ fontSize: "1rem" }}></i>
                Notifications
              </button>

              {/* Divider + Logout */}
              <div style={{ borderTop: "1px solid var(--border-color)", marginTop: "4px", paddingTop: "4px" }}>
                <button
                  onClick={() => { logout(); setShowProfileMenu(false); }}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    width: "100%", padding: "10px 16px",
                    background: "none", border: "none", cursor: "pointer",
                    color: "var(--danger-color)", fontSize: "0.88rem",
                    textAlign: "left",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(220,53,69,0.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                >
                  <i className="bi bi-box-arrow-right" style={{ fontSize: "1rem" }}></i>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Header;
