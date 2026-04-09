import React, { useState, useEffect } from "react";
import Loader from "../../Components/Loader";
import API from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import CommonTable from "../../Components/CommonTable";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";
import { Eye, List } from "lucide-react";

const MyAssignedTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [comment, setComment] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?._id) {
      fetchAssignedTickets();
    }
  }, [user]);

  const fetchAssignedTickets = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/complaints/assigned");

      const formatted = data.map(ticket => ({
        _id: ticket._id,
        id: ticket.ticketNumber,
        title: ticket.title,
        priority: ticket.priority,
        due: ticket.dueDate && !isNaN(new Date(ticket.dueDate))
          ? new Date(ticket.dueDate).toLocaleDateString("en-GB").replace(/\//g, "-")
          : "-",
        status: ticket.status
      }));

      setTickets(formatted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatStatus = (status) => {
    return status.replace("_", " ");
  };

  const handleStatusUpdate = async () => {
    try {
      if (!selectedStatus) return alert("Please select a status");

      await API.put(
        `/api/complaints/${selectedTicket._id}/update-status`,
        {
          status: selectedStatus,
          note: comment // Synchronized with backend field name
        }
      );

      setShowModal(false);
      setComment("");
      setSelectedStatus("");
      fetchAssignedTickets();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    return (
      ticket.title.toLowerCase().includes(search.toLowerCase()) &&
      (statusFilter === "All" || ticket.status === statusFilter)
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 120, align: "left" },
    { field: "title", headerName: "Title", flex: 1.5, headerAlign: "left", renderCell: (params) => <span className="fw-bold text-wrap" style={{ display: 'block', width: '100%', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2', textAlign: 'left' }}>{params.row.title}</span> },
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
    { field: "due", headerName: "Due Date", width: 150 },
    {
      field: "status",
      headerName: "Status",
      width: 160,
      renderCell: (params) => {
        const isLocked = params.row.status === "RESOLVED" || params.row.status === "REJECTED";
        return (
          <button
            className={`btn btn-sm w-100 rounded-3 shadow-sm d-flex justify-content-between align-items-center px-3 ${getStatusColor(params.row.status)}`}
            style={{ minWidth: "120px", border: "none", cursor: isLocked ? "default" : "pointer" }}
            onClick={() => {
              if (isLocked) return;
              setSelectedTicket(params.row);
              setSelectedStatus(params.row.status);
              setShowModal(true);
            }}
            disabled={isLocked}
          >
            {formatStatus(params.row.status)}
            {!isLocked && <List size={14} className="ms-2 opacity-75" />}
          </button>
        );
      }
    },
    {
      field: "action",
      headerName: "Action",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <button
          className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
          style={{ width: "32px", height: "32px" }}
          onClick={() => navigate(`/ticketdetails/${params.row._id}`)}
          title="View Details"
        >
          <Eye size={16} style={{ color: "var(--primary-color)" }} />
        </button>
      )
    }
  ];

  const rows = filteredTickets.map(t => ({ ...t }));

  if (loading) return <Loader />;

  return (
    <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
      <h2 className="fw-bold">My Assigned Tickets</h2>
      <p className="text-secondary mb-4">Manage and track your assigned tickets</p>

      {/* Filters */}
      <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div className="input-group" style={{ width: "300px" }}>
            <span className="input-group-text border-end-0 text-muted" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}><List size={18} /></span>
            <input
              type="text"
              placeholder="Search tickets..."
              className="form-control border-start-0 ps-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
            />
          </div>

          <select
            className="form-select fw-medium"
            style={{ width: "200px", backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Status</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-4 p-4">
        <CommonTable rows={rows} columns={columns} Data="Assigned Tickets" />
      </div>

      {showModal && (
        <>
          <div className="modal fade show" style={{ display: "block", zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow rounded-4">
                <div className="modal-header border-bottom-0 p-4 pb-0">
                  <h5 className="fw-bold modal-title">Update Ticket Status</h5>
                  <button
                    className="btn-close"
                    onClick={() => setShowModal(false)}
                  ></button>
                </div>
                <div className="modal-body p-4">
                  <p className="mb-4 text-secondary small"><strong>Ticket:</strong> {selectedTicket?.title}</p>

                  <div className="mb-4">
                    <label className="form-label small text-muted fw-bold text-uppercase">Select New Status</label>
                    <select
                      className={`form-select fw-bold ${getStatusColor(selectedStatus)} text-white`}
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      style={{ border: "none" }}
                    >
                      <option value="ASSIGNED" className="text-muted" disabled>Assigned (Current)</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>

                  {selectedStatus === "REJECTED" && (
                    <div className="mb-1">
                      <label className="form-label small text-muted fw-bold text-uppercase">Status Update Note</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="4"
                        placeholder="Explain the reason for this status change or provide a progress update..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                    </div>
                  )}
                </div>
                <div className="modal-footer border-top-0 p-4 pt-0">
                  <button
                    className="btn btn-light rounded-pill px-4 fw-medium"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-primary rounded-pill px-4 fw-bold"
                    disabled={!selectedStatus || (selectedStatus === "REJECTED" && !comment)}
                    onClick={handleStatusUpdate}
                  >
                    Confirm Update
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
        </>
      )}
    </div>
  );
};

export default MyAssignedTickets;
