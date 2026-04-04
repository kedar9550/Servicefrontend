import React, { useState, useEffect } from "react";
import API from '../../api/axios'
import { useNavigate } from "react-router-dom";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";
import { List, Clock, TrendingUp, CheckCircle, XCircle } from "lucide-react";
import Loader from "../../Components/Loader";

import CommonTable from "../../Components/CommonTable";

const Dashboard = () => {
  const navigate = useNavigate();

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await API.get("/api/complaints/my");
        setTickets(res.data);
      } catch (error) {
        console.error("Error fetching tickets", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  const totalTicketsCount = tickets.length;
  const openTicketsCount = tickets.filter(t => ["OPEN", "UNASSIGNED", "New"].includes(t.status)).length;
  const inProgressCount = tickets.filter(t => ["IN_PROGRESS", "ASSIGNED", "In Progress"].includes(t.status)).length;
  const resolvedCount = tickets.filter(t => ["RESOLVED", "CLOSED", "Resolved", "Closed"].includes(t.status)).length;
  const rejectedCount = tickets.filter(t => ["REJECTED", "Rejected"].includes(t.status)).length;

  const getPercentage = (val) => totalTicketsCount > 0 ? `${Math.round((val / totalTicketsCount) * 100)}%` : "0%";

  const columns = [
    { field: "ticketId", headerName: "Ticket ID", width: 120, align: "left", minWidth: 150 },
    {
      field: "title", headerName: "Title", flex: 3, minWidth: 200, renderCell: (params) => (
        <div
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: "1.4",

          }}
          className="fw-bold"
        >
          {params.row.title}
        </div>
      ),
    },
    { field: "serviceName", headerName: "Service Category", flex: 1, minWidth: 200 },
    {
      field: "priority",
      headerName: "Priority",
      minWidth: 120,
      renderCell: (params) => (
        <span className={`badge ${getPriorityColor(params.row.priority)}`}>
          {params.row.priority}
        </span>
      )
    },
    {
      field: "status",
      headerName: "Status",
      minWidth: 120,
      renderCell: (params) => (
        <span className={`badge ${getStatusColor(params.row.status)}`}>
          {params.row.status}
        </span>
      )
    },
    { field: "createdDate", headerName: "Created Date", minWidth: 150 },
    {
      field: "action",
      headerName: "Action",
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <button
          className="btn btn-sm btn-primary text-white"
          onClick={() => navigate(`/ticketdetails/${params.row.id}`)}
        >
          View
        </button>
      )
    }
  ];

  const rows = tickets.slice(0, 10).map((t, index) => ({
    ...t,
    id: t._id,
    ticketId: t.ticketNumber,
    serviceName: t.service?.name || "N/A",
    createdDate: t.createdAt && !isNaN(new Date(t.createdAt))
      ? new Date(t.createdAt).toLocaleDateString('en-GB').replace(/\//g, "-")
      : "--",
  }));

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-3 py-md-4 px-0 px-md-4" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
      <h3 className="fw-bold mb-1">Dashboard</h3>
      <p className="text-secondary mb-4">
        Welcome back! Here's your ticket overview.
      </p>

      <div className="row g-4 mb-5">
        <StatCard
          title="Total Tickets"
          value={totalTicketsCount}
          progress="100%"
          icon={<List size={22} strokeWidth={2.5} />}
          iconBg="#f0f3ff"
          iconColor="#4361ee"
          progressColor="#4361ee"
        />

        <StatCard
          title="Open Tickets"
          value={openTicketsCount}
          progress={getPercentage(openTicketsCount)}
          icon={<Clock size={22} strokeWidth={2.5} />}
          iconBg="#fff0ed"
          iconColor="#e76f51"
          progressColor="#e76f51"
        />

        <StatCard
          title="In Progress"
          value={inProgressCount}
          progress={getPercentage(inProgressCount)}
          icon={<TrendingUp size={22} strokeWidth={2.5} />}
          iconBg="#fff8ec"
          iconColor="#f4a261"
          progressColor="#f4a261"
        />

        <StatCard
          title="Resolved"
          value={resolvedCount}
          progress={getPercentage(resolvedCount)}
          icon={<CheckCircle size={22} strokeWidth={2.5} />}
          iconBg="#e6fcf5"
          iconColor="#2a9d8f"
          progressColor="#2a9d8f"
        />

        <StatCard
          title="Rejected"
          value={rejectedCount}
          progress={getPercentage(rejectedCount)}
          icon={<XCircle size={22} strokeWidth={2.5} />}
          iconBg="#fff5f5"
          iconColor="#e53e3e"
          progressColor="#e53e3e"
        />
      </div>

      <div className="card shadow-sm border-0 rounded-4 p-2 p-md-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">
            Recent Tickets
          </h5>

          <button
            className="btn btn-primary px-4 shadow-sm text-white"
            style={{ transition: "0.2s" }}
            onClick={() => navigate("/mytickets")}
          >
            View All
          </button>
        </div>

        <CommonTable rows={rows} columns={columns} initialPageSize={10} Data="Tickets" />
      </div>
    </div>
  );
};

export default Dashboard;

const StatCard = ({
  title,
  value,
  progress,
  icon,
  iconBg,
  iconColor,
  progressColor,
}) => {
  return (
    <div className="col-12 col-md-6 col-lg-4">
      <div
        className="card border-0 rounded-4 p-3 p-md-4 h-100 stat-card-adaptive"
        style={{
          background: "var(--card-bg)",
          borderLeft: `4px solid ${iconColor}`,
          boxShadow: "var(--card-shadow)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: "default",
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "translateY(-6px)";
          e.currentTarget.style.boxShadow = "var(--card-shadow-hover)";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "var(--card-shadow)";
        }}
      >
        <div className="d-flex align-items-start justify-content-between mb-3">
          <div>
            <p className="text-secondary fw-medium mb-1" style={{ fontSize: "0.78rem", letterSpacing: "0.5px", textTransform: "uppercase" }}>{title}</p>
            <h3 className="fw-bold m-0" style={{ color: "var(--text-color)" }}>{value}</h3>
          </div>
          <div
            className="rounded-3 d-flex justify-content-center align-items-center flex-shrink-0"
            style={{
              backgroundColor: iconBg,
              color: iconColor,
              width: "42px",
              height: "42px",
              boxShadow: `0 6px 12px -3px ${iconColor}35`
            }}
          >
            {icon}
          </div>
        </div>

        <div>
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="text-secondary" style={{ fontSize: "0.75rem" }}>Progress</span>
            <span className="fw-semibold" style={{ fontSize: "0.75rem", color: iconColor }}>{progress}</span>
          </div>
          <div
            style={{
              height: "5px",
              backgroundColor: "rgba(0,0,0,0.06)",
              borderRadius: "10px",
              overflow: "hidden"
            }}
          >
            <div
              style={{
                width: progress || "0%",
                height: "100%",
                backgroundColor: progressColor,
                borderRadius: "10px",
                transition: "width 1.5s cubic-bezier(0.65, 0, 0.35, 1)",
              }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};
