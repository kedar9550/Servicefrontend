import { useState, useEffect } from "react";
import API from "../../api/axios";
import Loader from "../../Components/Loader";
import { useNavigate } from "react-router-dom";
import { Edit2, Eye, UserPlus, XCircle, Search, List } from "lucide-react";
import CommonTable from "../../Components/CommonTable";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";

const RejectedTickets = () => {
    const navigate = useNavigate();

    const [tickets, setTickets] = useState([]);
    const [allRejectedTickets, setAllRejectedTickets] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedTicket, setSelectedTicket] = useState(null);

    const [showReassignModal, setShowReassignModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);

    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [reassignDueDate, setReassignDueDate] = useState("");
    const [reassignPriority, setReassignPriority] = useState("MEDIUM");
    const [adminComment, setAdminComment] = useState("");

    useEffect(() => {
        fetchRejectedRequests();
        fetchAllRejectedHistory();
    }, []);

    const fetchRejectedRequests = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/api/complaints/rejected-requests");
            setTickets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllRejectedHistory = async () => {
        try {
            const { data } = await API.get("/api/complaints/dept-all");
            // Filter only tickets that were finally rejected by admin
            const rejected = data.filter(t => t.status === "REJECTED");
            setAllRejectedTickets(rejected);
        } catch (err) {
            console.error("Fetch history error", err);
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

    const fetchServiceEmployees = async () => {
        try {
            const { data } = await API.get("/api/team/dashboard");
            setEmployees(data.members || []);
        } catch (err) {
            console.error(err);
        }
    };

    const handleReassign = async () => {
        try {
            if (!reassignDueDate)
                return alert("Select due date");

            await API.put(`/api/complaints/${selectedTicket._id}/assign`, {
                employees: selectedEmployees,
                dueDate: reassignDueDate,
                priority: reassignPriority
            });

            setShowReassignModal(false);
            setSelectedEmployees([]);
            setReassignDueDate("");
            setReassignPriority("MEDIUM");
            fetchRejectedRequests();
            fetchAllRejectedHistory();

        } catch (err) {
            console.error(err);
        }
    };

    const handleFinalReject = async () => {
        try {
            await API.put(`/api/complaints/${selectedTicket._id}/admin-reject`, {
                comment: adminComment
            });

            setShowRejectModal(false);
            setAdminComment("");
            fetchRejectedRequests();
            fetchAllRejectedHistory();
        } catch (err) {
            console.error(err);
        }
    };

    const columns = [

        { field: "ticketNumber", headerName: "Ticket ID", minWidth: 120 },
        {
            field: "title", headerName: "Title", align: "left", minWidth: 120, flex: 1, renderCell: (params) => (
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
            )
        },
        {
            field: "rejectedByName", minWidth: 150, headerName: "Rejected By", align: "left", flex: 1, renderCell: (params) => (
                <div
                    style={{
                        width: "100%",
                        textAlign: "left",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: "1.4"
                    }}

                >
                    {toProperCase(params.row.rejectedBy?.name) || "N/A"}
                </div>
            )
        },
        {
            field: "employeeNote", minWidth: 160, headerName: "Employee Note", align: "left", flex: 1, renderCell: (params) => (
                <div
                    style={{
                        width: "100%",
                        textAlign: "left",
                        whiteSpace: "normal",
                        wordBreak: "break-word",
                        lineHeight: "1.4"
                    }}

                >
                    {params.row.employeeNote || "---"}
                </div>
            )
        },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 150,
            sortable: false,
            renderCell: (params) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => navigate(`/ticketdetails/${params.row._id}`)}
                        title="View"
                    >
                        <Eye size={16} className="text-primary" />
                    </button>
                    <button
                        className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => {
                            setSelectedTicket(params.row);
                            fetchServiceEmployees();
                            setShowReassignModal(true);
                        }}
                        title="Reassign"
                    >
                        <UserPlus size={16} className="text-warning" />
                    </button>
                    <button
                        className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => {
                            setSelectedTicket(params.row);
                            setShowRejectModal(true);
                        }}
                        title="Reject"
                    >
                        <XCircle size={16} className="text-danger" />
                    </button>
                </div>
            )
        }
    ];

    const rows = tickets.map((t, index) => ({ ...t, id: t._id }));

    if (loading) return <Loader />;

    return (
        <div className="container-fluid py-4" style={{ minHeight: "100vh" }}>
            <h2 className="fw-bold">Rejected Tickets</h2>
            <p className="text-secondary mb-4">
                Review tickets rejected by employees and take action.
            </p>

            <div className="card border-0 shadow-sm rounded-4 p-4">
                <CommonTable rows={rows} columns={columns} Data="Tickets" />
            </div>

            <div className="mt-5">
                <h4 className="fw-bold mb-3">Rejected History</h4>
                <p className="text-secondary small mb-3">Tickets that have been finally rejected by the Service admin.</p>
                <div className="card border-0 shadow-sm rounded-4 p-4">
                    <CommonTable
                        rows={allRejectedTickets.map((t, index) => ({
                            ...t,
                            id: t._id,
                            remarks: t.rejectionReason || "---" // Use admin's rejection reason
                        }))}
                        columns={[
                            { field: "ticketNumber", headerName: "Ticket ID", minWidth: 150 },
                            { field: "title", minWidth: 150, headerName: "Title", flex: 1, renderCell: (params) => <span className="fw-bold">{params.row.title}</span> },
                            {
                                field: "remarks", align: "left", minWidth: 150, headerName: "Remarks", flex: 1, renderCell: (params) => <div style={{
                                    width: "100%",
                                    textAlign: "left",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word",
                                    lineHeight: "1.4"
                                }}>{params.row.remarks}</div>
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
                            {
                                field: "actions",
                                headerName: "Actions",
                                minWidth: 100,
                                sortable: false,
                                renderCell: (params) => (
                                    <button
                                        className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                                        style={{ width: '32px', height: '32px' }}
                                        onClick={() => navigate(`/ticketdetails/${params.row._id}`)}
                                        title="View"
                                    >
                                        <Eye size={16} className="text-primary" />
                                    </button>
                                )
                            }
                        ]}
                        Data="Tickets"
                    />
                </div>
            </div>

            {/* ================= REASSIGN MODAL ================= */}
            {showReassignModal && (
                <>
                    <div className="modal fade show" style={{ display: "block", zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow rounded-4">
                                <div className="modal-header border-bottom-0">
                                    <h5 className="modal-title fw-bold">Reassign Ticket</h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowReassignModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body p-4">
                                    <p className="mb-4"><strong>Ticket:</strong> {selectedTicket?.title}</p>

                                    {/* Developer Selection */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-uppercase text-muted">Assigned Employees</label>
                                        <div className="dropdown">
                                            <button
                                                className="form-select text-start"
                                                type="button"
                                                data-bs-toggle="dropdown"
                                                data-bs-auto-close="outside"
                                            >
                                                {selectedEmployees.length
                                                    ? selectedEmployees
                                                        .map(id => employees.find(e => e._id === id)?.name)
                                                        .filter(Boolean)
                                                        .join(", ")
                                                    : "Select Employees"}
                                            </button>
                                            <ul className="dropdown-menu w-100 p-3 shadow-sm border-0" style={{ maxHeight: "250px", overflowY: "auto" }}>
                                                {employees.map((emp) => (
                                                    <li key={emp._id} className="mb-2">
                                                        <div className="form-check">
                                                            <input
                                                                className="form-check-input"
                                                                type="checkbox"
                                                                id={`reassign-emp-${emp._id}`}
                                                                checked={selectedEmployees.includes(emp._id)}
                                                                onChange={() => {
                                                                    if (selectedEmployees.includes(emp._id)) {
                                                                        setSelectedEmployees(selectedEmployees.filter(id => id !== emp._id));
                                                                    } else {
                                                                        setSelectedEmployees([...selectedEmployees, emp._id]);
                                                                    }
                                                                }}
                                                                style={{ cursor: "pointer" }}
                                                            />
                                                            <label
                                                                className="form-check-label"
                                                                htmlFor={`reassign-emp-${emp._id}`}
                                                                style={{ cursor: "pointer", userSelect: "none" }}
                                                            >
                                                                {emp.name}
                                                            </label>
                                                        </div>
                                                    </li>
                                                ))}
                                                {employees.length === 0 && <li className="text-muted small">No employees found for this service</li>}
                                            </ul>
                                        </div>
                                    </div>

                                    {/* Priority */}
                                    <div className="mb-4">
                                        <label className="form-label fw-semibold small text-uppercase text-muted">Priority</label>
                                        <select
                                            className="form-select"
                                            value={reassignPriority}
                                            onChange={(e) => setReassignPriority(e.target.value)}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                        </select>
                                    </div>

                                    {/* Due Date */}
                                    <div className="mb-3">
                                        <label className="form-label fw-semibold small text-uppercase text-muted">Due Date</label>
                                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                                            <DatePicker
                                                value={reassignDueDate ? dayjs(reassignDueDate) : null}
                                                minDate={dayjs()}
                                                onChange={(newValue) => {
                                                    setReassignDueDate(newValue ? newValue.format("YYYY-MM-DD") : "");
                                                }}
                                                slotProps={{
                                                    textField: {
                                                        className: "w-100",
                                                        size: "small"
                                                    }
                                                }}
                                            />
                                        </LocalizationProvider>
                                    </div>
                                </div>

                                <div className="modal-footer border-top-0 p-4">
                                    <button
                                        className="btn btn-light rounded-pill px-4"
                                        onClick={() => setShowReassignModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-primary rounded-pill px-4"
                                        disabled={selectedEmployees.length === 0 || !reassignDueDate}
                                        onClick={handleReassign}
                                    >
                                        Confirm Reassignment
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-backdrop fade show" style={{ zIndex: 1050 }}></div>
                </>
            )}

            {/* ================= FINAL REJECT MODAL ================= */}
            {showRejectModal && (
                <>
                    <div className="modal fade show" style={{ display: "block", zIndex: 1055 }}>
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content border-0 shadow rounded-4">
                                <div className="modal-header border-bottom-0">
                                    <h5 className="modal-title fw-bold text-danger">Final Reject Ticket</h5>
                                    <button
                                        className="btn-close"
                                        onClick={() => setShowRejectModal(false)}
                                    ></button>
                                </div>

                                <div className="modal-body p-4">
                                    <label className="form-label fw-semibold small text-uppercase text-muted">Rejection Reason / Note</label>
                                    <textarea
                                        className="form-control rounded-3"
                                        rows="4"
                                        placeholder="Explain why this ticket is being fully rejected..."
                                        value={adminComment}
                                        onChange={(e) =>
                                            setAdminComment(e.target.value)
                                        }
                                    />
                                </div>

                                <div className="modal-footer border-top-0 p-4">
                                    <button
                                        className="btn btn-light rounded-pill px-4"
                                        onClick={() => setShowRejectModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="btn btn-danger rounded-pill px-4"
                                        disabled={!adminComment}
                                        onClick={handleFinalReject}
                                    >
                                        Confirm Rejection
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

export default RejectedTickets;