import React, { useState, useEffect } from "react";
import Loader from "../../Components/Loader";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import CommonTable from "../../Components/CommonTable";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";
import { Eye, Search } from "lucide-react";

const InProgress = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchInProgressTickets();
  }, []);

  const fetchInProgressTickets = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/complaints/assigned");
      // Filter for IN_PROGRESS status
      const inProgress = data.filter(t => t.status === "IN_PROGRESS" || t.status === "In Progress");

      const formatted = inProgress.map((t, index) => ({
        id: t._id,
        ticketId: t.ticketNumber,
        title: t.title,
        priority: t.priority,
        status: t.status,
        date: t.createdAt && !isNaN(new Date(t.createdAt))
          ? new Date(t.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "--",
      }));

      setTickets(formatted);
    } catch (err) {
      console.error("Error fetching in-progress tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTickets = tickets.filter((ticket) =>
    ticket.title.toLowerCase().includes(search.toLowerCase()) ||
    ticket.ticketId.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: "ticketId", headerName: "Ticket ID", width: 120, align: 'left' },
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
      width: 150,
      renderCell: (params) => (
        <span className={`badge ${getStatusColor(params.row.status)}`}>
          {params.row.status}
        </span>
      )
    },
    { field: "date", headerName: "Created Date", width: 150 },
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
          <Eye size={16} style={{ color: "var(--primary-color)" }} />
        </button>
      )
    }
  ];

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      <h2 className="fw-bold">In Progress Tickets</h2>
      <p className="text-secondary mb-4">Tickets currently being worked on</p>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <h5 className="fw-bold mb-0">Active Work ({filteredTickets.length})</h5>

          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text border-end-0 text-muted" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}><Search size={18} /></span>
            <input
              type="text"
              placeholder="Search by ID or Title..."
              className="form-control border-start-0 ps-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
            />
          </div>
        </div>

        <CommonTable rows={filteredTickets} columns={columns} Data="In Progress Tickets" />
      </div>
    </div>
  );
};

export default InProgress;

