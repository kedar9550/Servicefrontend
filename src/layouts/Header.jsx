import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { BsList } from "react-icons/bs";
import logo from "../assets/logoHome.png";
import NotificationBell from "../Components/NotificationBell";
import ThemeToggle from "../Components/ThemeToggle";

function Header({ sidebarOpen }) {
  const { logout, user } = useAuth();
  const [imgSrc, setImgSrc] = useState(null);
  const [imgKey, setImgKey] = useState(Date.now());

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
  return (
    <nav
      className="navbar px-4 d-flex justify-content-end align-items-center"
      style={{
        height: "60px",
        position: "fixed",
        top: 0,
        left: sidebarOpen ? "250px" : "80px",
        right: 0,
        zIndex: 1000,
        transition: "0.3s",
        backgroundColor: "var(--header-bg)",
        borderBottom: "1px solid var(--border-color)",
        color: "var(--text-color)"
      }}
    >
      {/* Profile Section */}
      <div className="d-flex align-items-center">
        <ThemeToggle />
        <NotificationBell />
        {imgSrc ? (
          <img
            src={imgSrc}
            alt="Profile"
            onError={() => setImgSrc(null)}
            className="rounded-circle shadow"
            style={{
              width: "40px",
              height: "40px",
              objectFit: "cover",
              cursor: "pointer",
            }}
          />
        ) : (
          <div
            className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center shadow"
            style={{
              width: "40px",
              height: "40px",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
              color: '#ffffff'
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </nav>
  );

}

export default Header;
