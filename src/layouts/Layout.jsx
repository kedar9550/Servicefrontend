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
          marginLeft: useMobileNav ? "0" : (sidebarOpen ? "250px" : "80px"),
          maxWidth: useMobileNav ? "100%" : `calc(100% - ${sidebarOpen ? "250px" : "80px"})`,
          minHeight: "calc(100vh - 60px)",
          marginTop: "60px",
          paddingBottom: useMobileNav ? "80px" : "0px",
          transition: "margin-left 0.3s, max-width 0.3s",
          overflowX: "hidden",
        }}
      >
        <Outlet />
        <Footer />
      </div>

      {useMobileNav && <MobileBottomNav />}
    </>
  );
};


export default Layout;
