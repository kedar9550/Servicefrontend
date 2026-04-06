import Header from "./Header";
import Slider from "./Slider";
import MobileBottomNav from "./MobileBottomNav";
import Footer from "../Components/Footer";
import { Outlet } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { getPrimaryRole } = useAuth();
  const role = getPrimaryRole();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isSmallMobile = windowWidth <= 992; // Tablet landscape cutoff
  const useMobileNav = isSmallMobile;

  // Lock body scroll so fixed sidebar/header never jitter during page scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, []);

  return (
    <>
      <Header
        sidebarOpen={useMobileNav ? false : sidebarOpen}
        isMobile={useMobileNav}
      />

      {!useMobileNav && (
        <Slider
          open={sidebarOpen}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <div
        style={{
          position: "fixed",
          top: "60px",
          left: useMobileNav ? "0" : (sidebarOpen ? "250px" : "80px"),
          right: 0,
          bottom: 0,
          overflowY: "auto",
          overflowX: "hidden",
          transition: "left 0.3s",
          paddingBottom: useMobileNav ? "80px" : "0px",
          backgroundColor: "var(--bg-color)",
        }}
      >
        <div style={{ maxWidth: "1600px", margin: "0 auto", width: "100%", minHeight: "100%" }}>
          <Outlet />
          <Footer />
        </div>
      </div>

      {useMobileNav && <MobileBottomNav />}
    </>
  );
};


export default Layout;
