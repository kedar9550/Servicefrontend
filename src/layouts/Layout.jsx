import Header from "./Header";
import Slider from "./Slider";
import { Outlet } from "react-router-dom";
import { useState } from "react";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <>
      <Header sidebarOpen={sidebarOpen} />

      <Slider
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div
        style={{
          marginLeft: sidebarOpen ? "250px" : "80px",
          marginTop: "60px",
          padding: "0px",
          transition: "0.3s",
        }}
      >
        <Outlet />
      </div>
    </>
  );
};


export default Layout;
