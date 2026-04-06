import React from "react";
import { NavLink } from "react-router-dom";
import ThemeToggle from "../Components/ThemeToggle";
import { useAuth } from "../context/AuthContext";
import "./MobileBottomNav.css";

const MobileBottomNav = () => {
    const { hasRole, isSuperAdmin, logout } = useAuth();

    const navItems = [
        { to: "/", icon: "bi-speedometer2", label: "Dashboard" },
    ];

    // ================= DEPT HEAD =================
    if (hasRole("ADMIN")) {
        navItems.push(
            { to: "/dept/assign", icon: "bi-person-check", label: "Assign" },
            { to: "/dept/tickets", icon: "bi-ticket-perforated", label: "Requests" },
            { to: "/dept/team", icon: "bi-people", label: "Team" },
            { to: "/rejected", icon: "bi-x-circle-fill", label: "Rejected" }
        );
    }

    // ================= DEVELOPER =================
    if (hasRole("EMPLOYEE")) {
        navItems.push(
            { to: "/dev/assigned", icon: "bi-ticket-perforated", label: "Assigned" },
            { to: "/dev/InProgress", icon: "bi-hourglass-split", label: "In Progress" },
            { to: "/dev/completed", icon: "bi-check-circle", label: "Completed" }
        );
    }

    // ================= SUPER ADMIN =================
    if (isSuperAdmin()) {
        navItems.push(
            { to: "/super/services", icon: "bi-tools", label: "Services" }
        );
    }

    // ================= ADMIN or SUPER ADMIN =================
    if (isSuperAdmin() || hasRole("ADMIN")) {
        navItems.push(
            { to: "/super/add-user", icon: "bi-person-plus", label: "Add User" },
            { to: "/dept/reports", icon: "bi-file-earmark-bar-graph", label: "Reports" }
        );
    }

    // ================= COMMON =================
    navItems.push(
        { to: "/generateticket", icon: "bi-patch-plus", label: "Generate" },
        { to: "/mytickets", icon: "bi-person-lines-fill", label: "Tickets" },
        { to: "/profile", icon: "bi-person-circle", label: "Profile" },
        { to: "/change-password", icon: "bi-shield-lock", label: "Password" }
    );

    const handleLogout = (e) => {
        e.preventDefault();
        const confirmLogout = window.confirm("Are you sure you want to logout?");
        if (confirmLogout) {
            logout();
        }
    };

    return (
        <div className="mobile-bottom-nav-wrapper">
            {/* The white background bar stays static */}
            <div className="mobile-bottom-nav-bg"></div>
            
            {/* The scrollable area */}
            <div className="mobile-bottom-nav-scroll">
                {navItems.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.to === "/"}
                        className={({ isActive }) =>
                            `mobile-nav-item ${isActive ? "active" : ""}`
                        }
                    >
                        <div className="mobile-nav-icon-wrapper">
                            <i className={`bi ${item.icon}`}></i>
                        </div>
                        <span className="mobile-nav-label">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </div>
    );
};

export default MobileBottomNav;
