import Header from "./Header";
import Slider from "./Slider";
import MobileBottomNav from "./MobileBottomNav";
import Footer from "../Components/Footer";
import Feedback from "../Components/Feedback";
import { Outlet, useLocation, useSearchParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../api/axios";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [pendingFeedback, setPendingFeedback] = useState(null);
  const { getPrimaryRole, user } = useAuth();
  const role = getPrimaryRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  useEffect(() => {
    const fetchPendingFeedback = async () => {
      if (!user || role !== 'USER') return;
      
      // 1. Check if there's a specific ticket ID in the URL (?feedback=ID)
      const feedbackId = searchParams.get('feedback');
      if (feedbackId) {
        try {
          const { data } = await API.get(`/api/complaints/${feedbackId}`, { withCredentials: true });
          if (data.success && data.data.ticket.status === 'RESOLVED') {
            setPendingFeedback(data.data.ticket);
            return;
          }
        } catch (err) {
          console.error("Fetch specific ticket for feedback error:", err);
        }
      }

      // 2. Otherwise, check for any pending feedback
      try {
        const { data } = await API.get('/api/complaints/feedback/pending', { withCredentials: true });
        if (data.success && data.data.length > 0) {
          setPendingFeedback(data.data[0]);
        }
      } catch (err) {
        console.error("Pending feedback fetch error:", err);
      }
    };

    fetchPendingFeedback();
  }, [user, location.search]); // Re-run when URL search params change

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
          backgroundColor: "var(--bg-color)",
        }}
      >
        <div style={{ 
          width: "100%", 
          minHeight: "100%", 
          display: "flex", 
          flexDirection: "column",
          paddingBottom: useMobileNav ? "20px" : "0px" 
        }}>
          <div style={{ 
            flex: 1, 
            display: "flex", 
            flexDirection: "column", 
            maxWidth: "1600px", 
            margin: "0 auto", 
            width: "100%" 
          }}>
            <Outlet />
          </div>
          <Footer />
        </div>
      </div>

      {useMobileNav && <MobileBottomNav />}
      
      {pendingFeedback && role === 'USER' && (
        <Feedback 
          ticket={pendingFeedback} 
          onClose={() => {
            setPendingFeedback(null);
            if (searchParams.has('feedback')) {
              searchParams.delete('feedback');
              setSearchParams(searchParams);
            }
          }} 
          onSuccess={() => {
            // Success handler if needed
          }}
        />
      )}
    </>
  );
};


export default Layout;
