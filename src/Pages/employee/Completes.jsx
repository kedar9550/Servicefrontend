import React, { useState, useEffect } from "react";
import Loader from "../../Components/Loader";
import API from "../../api/axios";
import { useNavigate } from "react-router-dom";
import CommonTable from "../../Components/CommonTable";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";
import { Eye, Search, XCircle, CheckCircle, List } from "lucide-react";

const Completed = () => {
  const [completedTickets, setCompletedTickets] = useState([]);
  const [rejectedTickets, setRejectedTickets] = useState([]);
  const [searchCompleted, setSearchCompleted] = useState("");
  const [searchRejected, setSearchRejected] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/complaints/assigned");

      // Filter for COMPLETED (RESOLVED/CLOSED)
      const completed = data.filter(t =>
        t.status === "RESOLVED" ||
        t.status === "CLOSED" ||
        t.status === "Resolved" ||
        t.status === "Closed"
      );

      // Filter for REJECTED
      const rejected = data.filter(t =>
        t.status === "REJECTED" ||
        t.status === "Rejected"
      );

      const formatTicket = (t, index) => ({
        id: t._id,
        ticketId: t.ticketNumber,
        title: t.title,
        priority: t.priority,
        status: t.status,
        date: (t.updatedAt || t.createdAt) && !isNaN(new Date(t.updatedAt || t.createdAt))
          ? new Date(t.updatedAt || t.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "--",
      });

      setCompletedTickets(completed.map((t, i) => formatTicket(t, i)));
      setRejectedTickets(rejected.map((t, i) => formatTicket(t, i)));
    } catch (err) {
      console.error("Error fetching tickets:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterData = (data, search) => data.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.ticketId.toLowerCase().includes(search.toLowerCase())
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

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      <h2 className="fw-bold">Tickets Summary</h2>
      <p className="text-secondary mb-4">Overview of your resolved and rejected tickets</p>

      {/* COMPLETED TICKETS TABLE */}
      <div className="card border-0 shadow-sm rounded-4 p-4 mb-5">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-success-subtle p-2 rounded text-success">
              <List size={20} />
            </div>
            <h5 className="fw-bold mb-0">Completed Tickets ({completedTickets.length})</h5>
          </div>

          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text border-end-0 text-muted" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}><Search size={18} /></span>
            <input
              type="text"
              placeholder="Search by ID or Title..."
              className="form-control border-start-0 ps-0"
              value={searchCompleted}
              onChange={(e) => setSearchCompleted(e.target.value)}
              style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
            />
          </div>
        </div>

        <CommonTable rows={filterData(completedTickets, searchCompleted)} columns={columns} Data="Completed Tickets" />
      </div>

      {/* REJECTED TICKETS TABLE */}
      <div className="card border-0 shadow-sm rounded-4 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
          <div className="d-flex align-items-center gap-2">
            <div className="bg-danger-subtle p-2 rounded text-danger">
              <XCircle size={20} />
            </div>
            <h5 className="fw-bold mb-0">Rejected Tickets ({rejectedTickets.length})</h5>
          </div>

          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text border-end-0 text-muted" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}><Search size={18} /></span>
            <input
              type="text"
              placeholder="Search by ID or Title..."
              className="form-control border-start-0 ps-0"
              value={searchRejected}
              onChange={(e) => setSearchRejected(e.target.value)}
              style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
            />
          </div>
        </div>

        <CommonTable rows={filterData(rejectedTickets, searchRejected)} columns={columns} Data="Rejected Tickets" />
      </div>

    </div>
  );
};

export default Completed;
