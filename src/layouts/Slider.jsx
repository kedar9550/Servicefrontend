import { NavLink } from "react-router-dom";
import logo from "../assets/AUS_LOGO.png";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import "./Sidebar.css";

const Slider = ({ open, toggleSidebar }) => {
  const { theme } = useTheme();
  const { logout, user, hasRole, isSuperAdmin } = useAuth();
  
  const isDark = theme === "dark";
  const openLogo = isDark ? "/Gold_logo.png" : logo;
  const closedLogo = isDark ? "/AUS_Gold.png" : "/AUS.svg";

  return (
    <div
      className="d-flex flex-column p-2 shadow-sm"
      style={{
        width: open ? "250px" : "80px",
        height: "100vh",
        position: "fixed",
        left: 0,
        top: 0,
        transition: "0.3s",
        overflow: "hidden",
        backgroundColor: "var(--card-bg)",
        borderRight: "1px solid var(--border-color)",
        color: "var(--text-color)",
        zIndex: 1001
      }}
    >
      {/* Logo + Toggle */}
      <div
        className="d-flex align-items-center mb-4"
      >
        {open && (
          <div className="d-flex align-items-center justify-content-between px-0 mb-3"
          >
            <img
              src={openLogo}
              alt="Logo"
              style={{ marginTop: "10px", width: "200px" }}
            />
          </div>
        )}

        <div className="">
          {open ? (
            <button className="btn btn-light btn-sm ms-auto" onClick={toggleSidebar}>
              <i className="bi bi-chevron-left"></i>
            </button>
          ) : (
            <img
              src={closedLogo}
              alt="Logo"
              style={{ width: "55px", cursor: "pointer" }}
              onClick={toggleSidebar}
              className="px-1"
            />
          )}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        overflowX: "hidden",
      }}>
        <ul
          className="nav flex-column">

          <MenuItem to="/" icon="bi-speedometer2" label="Dashboard" open={open} />


          {/* ================= DEPT HEAD ================= */}
          {hasRole("ADMIN") && (
            <>
              <MenuItem to="/dept/assign" icon="bi-person-check" label="Assign Tickets" open={open} />
              <MenuItem to="/dept/tickets" icon="bi-ticket-perforated" label="Service Requests" open={open} />
              <MenuItem to="/dept/team" icon="bi-people" label="Team Members" open={open} />
              <MenuItem to="/rejected" icon="bi bi-x-circle-fill" label="Rejected" open={open} />
            </>
          )}

          {/* ================= DEVELOPER ================= */}
          {hasRole("EMPLOYEE") && (
            <>
              {/* <MenuItem to="/dev/dashboard" icon="bi-speedometer2" label="Dashboard" open={open} /> */}
              <MenuItem to="/dev/assigned" icon="bi-ticket-perforated" label="Assigned Tickets" open={open} />
              <MenuItem to="/dev/completed" icon="bi-check-circle" label="Completed Tickets" open={open} />
              <MenuItem to="/dev/InProgress" icon="bi bi-hourglass-split" label=" InProgress" open={open} />
            </>
          )}

          {/* ================= SUPER ADMIN ================= */}
          {isSuperAdmin() && (
            <>
              <MenuItem to="/super/services" icon="bi bi-tools" label="Manage Services" open={open} />
            </>
          )}


          {(isSuperAdmin() || hasRole("ADMIN")) && (
            <>

              <MenuItem to="/super/add-user" icon="bi-person-plus" label="Add User" open={open} />
              <MenuItem to="/dept/reports" icon="bi bi-file-earmark-bar-graph" label="Reports" open={open} />
            </>


          )

          }

          {/* ===== COMMON ===== */}

          <MenuItem to="/generateticket" icon="bi-patch-plus" label="GenerateTicket" open={open} />
          <MenuItem to="/mytickets" icon="bi-person-lines-fill" label="My Tickets" open={open} />

          <MenuItem to="/profile" icon="bi-person-circle" label="Profile" open={open} />
          <MenuItem to="/change-password" icon="bi-shield-lock" label="Change Password" open={open} />
        </ul>
      </div>

      <div className="p-3 px-3 mb-2 border-top">
        <button
          onClick={logout}
          className="signout d-flex align-items-center text-danger border-0 bg-transparent fw-bold"
          type="button"
        >
          <i className="bi bi-box-arrow-right fs-5 me-2"></i>
          {open && "Log out"}
        </button>
      </div>
    </div>
  );
};

/* Reusable Menu Item */
const MenuItem = ({ to, icon, label, open }) => (
  <li className="nav-item mb-2">
    <NavLink
      to={to}
      className={({ isActive }) =>
        `nav-link d-flex align-items-center ${isActive ? "active-link" : "theme-nav-link"
        }`
      }
    >
      <i className={`bi ${icon} fs-5 me-2`}></i>
      {open && label}
    </NavLink>
  </li>
);

export default Slider;