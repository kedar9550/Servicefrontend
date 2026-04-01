import React, { useState, useEffect } from "react";
import StatCard from "../../Components/StatCard";
import { Server, Shield, Users, FolderOpen, Clock, CheckCircle } from "lucide-react";
import API from "../../api/axios";

const SuperDashboard = () => {
  const [stats, setStats] = useState({
    services: 0,
    admins: 0,
    employees: 0,
    activeUsers: 0,
    openTickets: 0,
    inProgress: 0,
    completed: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const appName = import.meta.env.VITE_APP_NAME || "TICKET_SYSTEM";

        const [statsRes, usersRes, empRes] = await Promise.all([
          API.get("/api/service/stats"),
          API.get(`/api/auth/active-users-count?appName=${appName}`),
          API.get(`/api/auth/active-users-count?appName=${appName}&roleName=EMPLOYEE`)
        ]);
        
        const data = statsRes.data;
        const activeUsersCount = usersRes.data.activeUsers || 0;
        const employeeCount = empRes.data.activeUsers || 0;

        // Aggregate the data from the services specific endpoints
        let totalServices = data.length || 0;
        let totalAdmins = data.reduce((sum, s) => sum + (s.admins?.length || 0), 0);
        let totalTickets = data.reduce((sum, s) => sum + (s.totalTickets || 0), 0);

        // Dummy mock logic for ticket status distributions until true endpoint is created 
        setStats({
          services: totalServices,
          admins: totalAdmins,
          employees: employeeCount,
          activeUsers: activeUsersCount,
          openTickets: Math.floor(totalTickets * 0.4),
          inProgress: Math.floor(totalTickets * 0.3),
          completed: Math.ceil(totalTickets * 0.3)
        });

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="p-3 p-md-4">
      <div className="mb-4">
        <h2 className="fw-bold m-0">Dashboard Overview</h2>
        <p className="text-muted mb-0">
          Welcome back, Super Admin. Here's what's happening today.
        </p>
      </div>

      <div className="row g-4 mt-3">

        <div className="col-md-6 col-lg-4">
          <StatCard
            title="Total Services"
            value={loading ? "..." : stats.services}
            icon={<Server size={24} />}
            colorHex="var(--primary-color)"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <StatCard
            title="Total Service Admins"
            value={loading ? "..." : stats.admins}
            icon={<Shield size={24} />}
            colorHex="#9b5de5"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <StatCard
            title="Total Service Employees"
            value={loading ? "..." : stats.employees}
            icon={<Users size={24} />}
            colorHex="var(--info-color)"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <StatCard
            title="Total Active Users"
            value={loading ? "..." : stats.activeUsers}
            icon={<Users size={24} />}
            colorHex="#2fb8ff"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <StatCard
            title="Open Tickets"
            value={loading ? "..." : stats.openTickets}
            icon={<FolderOpen size={24} />}
            colorHex="var(--danger-color)"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <StatCard
            title="In Progress"
            value={loading ? "..." : stats.inProgress}
            icon={<Clock size={24} />}
            colorHex="var(--warning-color)"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <StatCard
            title="Completed"
            value={loading ? "..." : stats.completed}
            icon={<CheckCircle size={24} />}
            colorHex="var(--success-color)"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>

      </div>
    </div>
  );
};

export default SuperDashboard;