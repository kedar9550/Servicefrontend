import {
  Clock,
  UserCheck,
  TrendingUp,
  CheckCircle,
  Users,
  UserPlus,
  AlertTriangle,
  Eye,
  Activity,
  XCircle,
} from "lucide-react";

import Loader from "../../Components/Loader";
import CommonTable from "../../Components/CommonTable";
import { useState, useEffect } from "react";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";

const DeptDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState(null);
  const [teamStats, setTeamStats] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [reportsRes, teamRes] = await Promise.all([
        API.get("/api/complaints/reports"),
        API.get("/api/team/dashboard")
      ]);
      setReports(reportsRes.data);
      setTeamStats(teamRes.data);
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const assignClicked = () => {
    navigate("/dept/assign");
  };

  const getStatusCount = (name) => reports?.statusData?.find(s => s.name.toLowerCase() === name.toLowerCase())?.value || 0;

  const pendingCount = getStatusCount("Unassigned") || getStatusCount("Pending");
  const assignedCount = getStatusCount("Assigned");
  const inProgressCount = getStatusCount("In Progress");
  const completedCount = getStatusCount("Resolved") || getStatusCount("Completed");
  const rejectedCount = getStatusCount("Rejected");

  const totalTickets = pendingCount + assignedCount + inProgressCount + completedCount + rejectedCount;

  const getPercentage = (val) => totalTickets > 0 ? `${Math.round((val / totalTickets) * 100)}%` : "0%";

  /* ================= TABLE DATA ================= */
  const rows = reports?.recentTickets?.slice(0, 10).map((t, index) => ({
    ...t,
    id: t._id || index, // DataGrid needs unique id
    ticketId: t.ticketNumber,
    department: reports?.departmentName || "Department",
    createdDate: t.createdAt && !isNaN(new Date(t.createdAt))
      ? new Date(t.createdAt).toLocaleDateString('en-GB').replace(/\//g, "-")
      : "--",
  })) || [];

  /* ================= COLUMNS ================= */
  const columns = [
    { field: "ticketId", headerName: "Ticket ID", width: 120, align: 'left', minWidth: 120 },
    { field: "title", headerName: "Title", flex: 1.5, headerAlign: "left", minWidth: 120, renderCell: (params) => <span className="fw-bold text-wrap" style={{ display: 'block', width: '100%', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2', textAlign: 'left' }}>{params.row.title}</span> },
    { field: "department", headerName: "Department", flex: 1, minWidth: 120 },
    {
      field: "priority",
      headerName: "Priority",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span
          className={`badge ${params.value === "HIGH" || params.value === "High"
            ? "bg-danger text-white"
            : params.value === "LOW" || params.value === "Low"
              ? "bg-success text-white"
              : "bg-warning text-dark"
            }`}
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <span className={`badge rounded px-3 py-2 fw-medium ${getStatusColor(params.value)}`}>
          {params.value}
        </span>
      ),
    },
    { field: "createdDate", headerName: "Created Date", flex: 1, minWidth: 120 },
    {
      field: "action",
      headerName: "Action",
      minWidth: 120,
      sortable: false,
      renderCell: (params) => (
        <button
          className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: '32px', height: '32px' }}
          onClick={() => navigate(`/ticketdetails/${params.row.id}`)}
          title="View"
        >
          <Eye size={16} className="text-primary" />
        </button>
      )
    }
  ];

  if (loading) return <Loader />;

  return (
    <div className="p-4" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="fw-bold mb-0 text-wrap">
          {reports?.departmentName && reports.departmentName !== "Department" ? `${reports.departmentName} Service Dashboard` : "Department Dashboard"}
        </h3>

        <button
          className="btn btn-primary px-4 rounded-pill shadow-sm fw-medium d-flex align-items-center gap-2 text-white"
          style={{ transition: "0.2s" }}
          onClick={assignClicked}
          onMouseOver={(e) => e.target.style.transform = "translateY(-2px)"}
          onMouseOut={(e) => e.target.style.transform = "translateY(0)"}
        >
          Assign Tickets <UserPlus size={18} />
        </button>
      </div>

      {/* ================= MAIN CARDS ================= */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4 mb-5 justify-content-center">
        <StatCard
          title="Total Tickets"
          value={totalTickets}
          progress="100%"
          icon={<Activity size={24} strokeWidth={2.5} />}
          iconBg="#f0f3ff"
          iconColor="#4361ee"
          progressColor="#4361ee"
        />

        {pendingCount > 0 && (
          <StatCard
            title="Unassigned Tickets"
            value={pendingCount}
            progress={getPercentage(pendingCount)}
            icon={<Clock size={24} strokeWidth={2.5} />}
            iconBg="#fff0ed"
            iconColor="#e76f51"
            progressColor="#e76f51"
          />
        )}

        {assignedCount > 0 && (
          <StatCard
            title="Assigned Tickets"
            value={assignedCount}
            progress={getPercentage(assignedCount)}
            icon={<UserCheck size={24} strokeWidth={2.5} />}
            iconBg="#f0f3ff"
            iconColor="#4361ee"
            progressColor="#4361ee"
          />
        )}

        {inProgressCount > 0 && (
          <StatCard
            title="In Progress"
            value={inProgressCount}
            progress={getPercentage(inProgressCount)}
            icon={<TrendingUp size={24} strokeWidth={2.5} />}
            iconBg="#fff8ec"
            iconColor="#f4a261"
            progressColor="#f4a261"
          />
        )}

        {completedCount > 0 && (
          <StatCard
            title="Resolved Tickets"
            value={completedCount}
            progress={getPercentage(completedCount)}
            icon={<CheckCircle size={24} strokeWidth={2.5} />}
            iconBg="#e6fcf5"
            iconColor="#2a9d8f"
            progressColor="#2a9d8f"
          />
        )}
      </div>

      {/* ================= SMALL CARDS ================= */}
      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-4">
          <SmallCard
            title="Total Team Members"
            value={teamStats?.summary?.totalMembers || 0}
            icon={<Users size={22} strokeWidth={2.5} />}
            iconBg="#f0f3ff"
            iconColor="#4361ee"
          />
        </div>
      </div>

      {/* ================= RECENT TICKETS TABLE ================= */}

      <div className="card shadow-sm rounded-4 border-0 p-4">
        <div className="mb-4">
          <h5 className="fw-bold mb-0">Recent Tickets</h5>
        </div>

        <CommonTable rows={rows} columns={columns} initialPageSize={10} Data="Tickets" />
      </div>

    </div>
  );
};

export default DeptDashboard;

/* ================= CARD COMPONENT ================= */

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
    <div className="col-md-6 col-lg-3">
      <div
        className="card shadow-sm rounded-4 p-4 h-100 border-0"
        style={{
          backgroundColor: "var(--stat-card-bg)",
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          cursor: "default",
          transformOrigin: "center"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05) translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1) !important";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0,0,0,0.075) !important";
        }}
      >
        <div className="d-flex align-items-center gap-3 mb-4">
          <div
            className="rounded-circle shadow-sm d-flex justify-content-center align-items-center flex-shrink-0"
            style={{ backgroundColor: iconColor, color: "#fff", width: "42px", height: "42px" }}
          >
            {icon}
          </div>
          <p className="text-secondary fw-medium mb-0" style={{ fontSize: "0.95rem" }}>{title}</p>
        </div>

        <h2 className="fw-bold m-0" style={{ color: iconColor }}>{value}</h2>

        <div
          style={{
            height: "5px",
            backgroundColor: "rgba(128,128,128,0.15)",
            borderRadius: "10px",
            marginTop: "25px",
          }}
        >
          <div
            style={{
              width: progress || "0%",
              height: "100%",
              backgroundColor: progressColor,
              borderRadius: "10px",
              transition: "width 1.2s ease-in-out"
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

/* ================= SMALL CARD ================= */

const SmallCard = ({ title, value, icon, iconBg, iconColor }) => {
  return (
    <div className="col-md-6 col-lg-4">
      <div
        className="card shadow-sm rounded-4 p-4 border-0 d-flex flex-row align-items-center h-100"
        style={{
          backgroundColor: "var(--stat-card-bg)",
          transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
          transformOrigin: "center"
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = "scale(1.05) translateY(-4px)";
          e.currentTarget.style.boxShadow = "0 10px 20px rgba(0,0,0,0.1) !important";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = "scale(1) translateY(0)";
          e.currentTarget.style.boxShadow = "0 0.125rem 0.25rem rgba(0,0,0,0.075) !important";
        }}
      >
        <div
          className="rounded-circle shadow-sm me-3 d-flex justify-content-center align-items-center flex-shrink-0"
          style={{ backgroundColor: iconColor, color: "#fff", width: "45px", height: "45px" }}
        >
          {icon}
        </div>

        <div className="d-flex flex-column justify-content-center">
          <span className="text-secondary fw-medium mb-1" style={{ fontSize: "0.95rem", lineHeight: "1.2" }}>{title}</span>
          <h3 className="fw-bold mb-0" style={{ color: iconColor }}>{value}</h3>
        </div>
      </div>
    </div>
  );
};