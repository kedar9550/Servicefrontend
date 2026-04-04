import React, { useState, useEffect } from "react";
import { List, Clock, TrendingUp, CheckCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import StatCard from "../../Components/StatCard";
import CommonTable from "../../Components/CommonTable";
import { getStatusColor, getPriorityColor } from "../../Components/StatusColors";
import API from "../../api/axios";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      try {
        const { data } = await API.get("/api/complaints/assigned", { withCredentials: true });
        setComplaints(data);
      } catch (err) {
        console.error("Failed to fetch assigned tickets", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignedTickets();
  }, []);

  const stats = {
    total: complaints.length,
    open: complaints.filter(c => ["OPEN", "New", "ASSIGNED", "Assigned"].includes(c.status)).length,
    progress: complaints.filter(c => ["IN_PROGRESS", "In Progress"].includes(c.status)).length,
    closed: complaints.filter(c => ["RESOLVED", "RESOLVED", "CLOSED", "Closed"].includes(c.status)).length,
  };

  const columns = [
    { field: "ticketId", headerName: "Ticket ID", width: 120, align: "left" },
    {
      field: "title", headerName: "Title", flex: 1, renderCell: (params) => (
        <div
          style={{
            width: "100%",
            textAlign: "left",
            whiteSpace: "normal",
            wordBreak: "break-word",
            lineHeight: "1.4"
          }}
          className="fw-bold"
        >
          {params.row.title}
        </div>
      ), align: "left"
    },
    {
      field: "priority",
      headerName: "Priority",
      width: 120,
      renderCell: (params) => (
        <span className={`badge ${getPriorityColor(params.row.priority)}`}>
          {params.row.priority}
        </span>
      )
    },
    {
      field: "status",
      headerName: "Status",
      width: 120,
      renderCell: (params) => (
        <span className={`badge ${getStatusColor(params.row.status)}`}>
          {params.row.status}
        </span>
      )
    },
    { field: "date", headerName: "Date", width: 150 },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <button
          className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "32px", height: "32px" }}
          onClick={() => navigate(`/ticketdetails/${params.row.id}`)}
        >
          <Eye size={16} className="text-primary" />
        </button>
      )
    }
  ];

  const rows = complaints.slice(0, 5).map((c, index) => ({
    id: c._id,
    ticketId: c.ticketNumber || c.complaintId,
    title: c.title || (c.issueType === "Other" ? c.customIssue : c.issueType),
    priority: c.priority,
    status: c.status,
    date: c.createdAt && !isNaN(new Date(c.createdAt))
      ? new Date(c.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
      : "--",
  }));

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
      <h2 className="fw-bold">Employee Dashboard</h2>
      <p className="text-secondary mb-4">Welcome back! Here's your ticket overview</p>

      {/* STAT CARDS */}
      <div className="row g-4 mt-1 mb-5">
        <div className="col-6 col-lg-3">
          <StatCard
            title="Total Assigned"
            value={stats.total}
            icon={<List size={24} />}
            colorHex="var(--primary-color)"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Open"
            value={stats.open}
            icon={<Clock size={24} />}
            colorHex="var(--danger-color)"
            bgColorHex="var(--stat-card-bg)"
            baseValue={stats.total}
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="In Progress"
            value={stats.progress}
            icon={<TrendingUp size={24} />}
            colorHex="var(--warning-color)"
            bgColorHex="var(--stat-card-bg)"
            baseValue={stats.total}
          />
        </div>
        <div className="col-6 col-lg-3">
          <StatCard
            title="Closed"
            value={stats.closed}
            icon={<CheckCircle size={24} />}
            colorHex="var(--success-color)"
            bgColorHex="var(--stat-card-bg)"
            baseValue={stats.total}
          />
        </div>
      </div>

      {/* RECENT TICKETS */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0">Recent Tickets</h5>
          <button
            className="btn btn-primary px-4 shadow-sm text-white"
            onClick={() => navigate("/dev/assigned")}
          >
            View All
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4 text-muted">Loading assigned tickets...</div>
        ) : (
          <CommonTable rows={rows} columns={columns} Data="Tickets" />
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
