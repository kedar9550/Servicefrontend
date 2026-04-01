import { useState } from "react";
import {
  Clock,
  User,
  MessageCircle,
  CheckCircle
} from "lucide-react";

const AdminTicketDetails = () => {

  const [status, setStatus] = useState("In Progress");
  const [developer, setDeveloper] = useState("Rahul");

  return (
    <div className="container-fluid p-4">

      <div className="row g-4">

        {/* ================= LEFT SECTION ================= */}
        <div className="col-lg-8">

          {/* Ticket Header */}
          <div className="card shadow-sm rounded-4 border-0 p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h4 className="fw-bold mb-1">Ticket #TKT-2145</h4>
                <span className="badge bg-warning text-dark me-2">
                  In Progress
                </span>
                <span className="badge bg-danger">
                  High Priority
                </span>
              </div>
            </div>
          </div>

          {/* User Details */}
          <div className="card shadow-sm rounded-4 border-0 p-4 mb-4">
            <h5 className="fw-bold mb-3">User Details</h5>
            <p><strong>Name:</strong> Ramesh Kumar</p>
            <p><strong>Email:</strong> ramesh@email.com</p>
            <p><strong>Department:</strong> Network</p>
          </div>

          {/* Description */}
          <div className="card shadow-sm rounded-4 border-0 p-4 mb-4">
            <h5 className="fw-bold mb-3">Issue Description</h5>
            <p>
              VPN is not connecting from remote location. Error code 720 appears.
            </p>
          </div>

          {/* Internal Comments */}
          <div className="card shadow-sm rounded-4 border-0 p-4 mb-4">
            <h5 className="fw-bold mb-3">Internal Comments</h5>

            <div className="mb-3 p-3 rounded-3 border" 
                style={{ 
                  backgroundColor: 'var(--stat-card-bg)', 
                  borderColor: 'var(--border-color) !important',
                  color: 'var(--text-color)' 
                }}>
              <div className="d-flex justify-content-between mb-1">
                <strong style={{ color: 'var(--text-color)' }}>Rahul</strong>
                <small className="text-secondary" style={{ fontSize: '0.8em' }}>Just now</small>
              </div>
              <p className="mb-0" style={{ color: 'var(--text-color)', opacity: 0.9 }}>Investigating the issue.</p>
            </div>


            <textarea
              className="form-control rounded-3"
              rows="3"
              placeholder="Add internal comment..."
            ></textarea>
          </div>

          {/* Assign + Status Update */}
          <div className="card shadow-sm rounded-4 border-0 p-4">
            <div className="row g-3">

              <div className="col-md-6">
                <label className="form-label">Assign Developer</label>
                <select
                  className="form-select rounded-pill"
                  value={developer}
                  onChange={(e) => setDeveloper(e.target.value)}
                >
                  <option>Rahul</option>
                  <option>Anjali</option>
                  <option>Vikram</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Update Status</label>
                <select
                  className="form-select rounded-pill"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option>Pending</option>
                  <option>Assigned</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                  <option>Rejected</option>
                </select>
              </div>

            </div>

            <div className="text-end mt-4">
              <button className="btn btn-primary rounded-pill px-4">
                Save Changes
              </button>
            </div>
          </div>

        </div>

        {/* ================= RIGHT TIMELINE ================= */}
        <div className="col-lg-4">

          <div className="card shadow-sm rounded-4 border-0 p-4">
            <h5 className="fw-bold mb-4">Ticket History</h5>

            <div className="d-flex mb-4">
              <Clock className="me-3 text-primary" />
              <div>
                <strong>Ticket Created</strong>
                <p className="text-muted mb-0">Feb 16, 2026 - 09:30 AM</p>
              </div>
            </div>

            <div className="d-flex mb-4">
              <User className="me-3 text-success" />
              <div>
                <strong>Assigned to Rahul</strong>
                <p className="text-muted mb-0">Feb 16, 2026 - 10:15 AM</p>
              </div>
            </div>

            <div className="d-flex mb-4">
              <MessageCircle className="me-3 text-warning" />
              <div>
                <strong>Comment Added</strong>
                <p className="text-muted mb-0">Feb 16, 2026 - 11:00 AM</p>
              </div>
            </div>

            <div className="d-flex">
              <CheckCircle className="me-3 text-success" />
              <div>
                <strong>Status Changed to In Progress</strong>
                <p className="text-muted mb-0">Feb 16, 2026 - 11:30 AM</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AdminTicketDetails;