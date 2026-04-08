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
    <div className="px-2 py-3 px-md-4 py-md-4" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
      <h2 className="fw-bold mb-1" style={{ fontSize: "1.75rem" }}>Employee Dashboard</h2>
      <p className="text-secondary mb-4" style={{ fontSize: "0.95rem" }}>Welcome back! Here's your ticket overview</p>

      {/* STAT CARDS */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4 mt-1 mb-5">
        <div className="col">
          <StatCard
            title="Total Assigned"
            value={stats.total}
            icon={<List size={24} />}
            colorHex="#4361ee"
            bgColorHex="var(--stat-card-bg)"
          />
        </div>
        <div className="col">
          <StatCard
            title="Open"
            value={stats.open}
            icon={<Clock size={24} />}
            colorHex="#e76f51"
            bgColorHex="var(--stat-card-bg)"
            baseValue={stats.total}
          />
        </div>
        <div className="col">
          <StatCard
            title="In Progress"
            value={stats.progress}
            icon={<TrendingUp size={24} />}
            colorHex="#f4a261"
            bgColorHex="var(--stat-card-bg)"
            baseValue={stats.total}
          />
        </div>
        <div className="col">
          <StatCard
            title="Closed"
            value={stats.closed}
            icon={<CheckCircle size={24} />}
            colorHex="#2a9d8f"
            bgColorHex="var(--stat-card-bg)"
            baseValue={stats.total}
          />
        </div>
      </div>

      {/* RECENT TICKETS */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
          <h5 className="fw-bold mb-0 flex-grow-1">Recent Tickets</h5>
          <button
            className="btn btn-primary-custom shadow-sm fw-medium d-flex align-items-center justify-content-center text-white"
            style={{ 
              transition: "0.3s",
              width: "48px", 
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "var(--primary-color)",
              padding: "0"
            }}
            onClick={() => navigate("/dev/assigned")}
            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {/* Desktop Text */}
            <span className="d-none d-md-inline me-md-2 ps-md-4 pe-md-1">View All</span>
            {/* Icon */}
            <span className="d-flex align-items-center justify-content-center pe-md-4">
              <List size={20} />
            </span>

            {/* Desktop Style Override */}
            <style dangerouslySetInnerHTML={{ __html: `
              @media (min-width: 768px) {
                .btn-primary-custom { 
                  width: auto !important; 
                  height: auto !important; 
                  border-radius: 50px !important; 
                  padding: 0.6rem 1.5rem !important;
                }
              }
            `}} />
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
