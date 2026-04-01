import { useState, useEffect } from "react";
import AdminTicketDetails from "./AdminTicketDetails";
import CommonTable from "../../Components/CommonTable";
import API from "../../api/axios";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";

const DeptTickets = () => {

  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartmentTickets();
  }, []);

  const fetchDepartmentTickets = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/api/complaints/dept-all');
      setTickets(data);
    } catch (err) {
      console.error("Dept Fetch Error", err);
    } finally {
      setLoading(false);
    }
  };

  const toProperCase = (str) => {
    if (!str) return "";
    return str
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="p-4">

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold">Service Requests</h2>
          <p className="text-muted mb-0">
            Manage and track serice related tickets
          </p>
        </div>

        <button
          className="btn px-4"
          style={{ backgroundColor: "#00306e", color: "#fff" }}
          onClick={() => navigate('/dept/assign')}
        >
          Assign Ticket
        </button>
      </div>

      {/* Table */}
      <div className="card shadow-sm rounded-4 border-0">
        <CommonTable
          columns={[
            { field: "ticketId", headerName: "Ticket ID", align: "left", minWidth: 150 },
            { field: "title", minWidth: 150, headerName: "Title", flex: 1.5, headerAlign: "left", renderCell: (params) => <span className="fw-bold text-wrap" style={{ display: 'block', width: '100%', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2', textAlign: 'left' }}>{params.row.title}</span> },
            { field: "department", minWidth: 150, headerName: "Service", flex: 1 },
            {
              field: "assignedTo", minWidth: 150, headerName: "Assigned To", flex: 1.5, headerAlign: "left", renderCell: (params) => (
                <span className={params.row.assignedTo === 'Unassigned' ? 'text-muted fst-italic' : 'fw-medium text-wrap'} style={{ display: 'block', width: '100%', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2', textAlign: 'left' }}>
                  {toProperCase(params.row.assignedTo)}
                </span>
              )
            },
            {
              field: "priority",
              headerName: "Priority",
              minWidth: 150,
              flex: 1,
              renderCell: (params) => (
                <span className={`badge ${getPriorityColor(params.row.priority.toUpperCase())}`}>
                  {params.row.priority}
                </span>
              )
            },
            {
              field: "status",
              headerName: "Status",
              minWidth: 150,
              flex: 1,
              renderCell: (params) => (
                <span className={`badge rounded px-3 py-2 fw-medium ${getStatusColor(params.row.status)}`}>
                  {params.row.status}
                </span>
              )
            },
            { field: "date", headerName: "Created Date", flex: 1, minWidth: 150 },
            {
              field: "action",
              headerName: "Action",

              minWidth: 120,
              sortable: false,
              renderCell: (params) => (
                <button className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                  style={{ width: '32px', height: '32px' }}
                  onClick={() => navigate(`/ticketdetails/${params.row._id}`)}>
                  <Eye size={16} className="text-primary" />
                </button>
              )
            }
          ]}
          rows={tickets
            .filter(t => t.status !== "REJECTED")
            .map((t, index) => ({
              ...t,
              id: t._id,
              ticketId: t.ticketNumber || t._id,
              department: t.service?.name || t.service,
              assignedTo: t.assignedDevs || "Unassigned",
              date: t.createdAt && !isNaN(new Date(t.createdAt))
                ? new Date(t.createdAt).toLocaleDateString("en-GB").replace(/\//g, "-")
                : "--",
              priority: t.priority,
              status: t.status
            }))}
          Data="Tickets"
        />
        {showDetails && <AdminTicketDetails />}
      </div>

    </div>
  );
};

export default DeptTickets;

