import React, { useState, useEffect } from "react";
import { UserPlus, Edit2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../api/axios"
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import TextField from "@mui/material/TextField";
import CommonTable from "../../Components/CommonTable";
import { getPriorityColor, getStatusColor } from "../../Components/StatusColors";
import { toast } from "react-toastify";

function AssignTickets() {
    const navigate = useNavigate();



    const [assigning, setAssigning] = useState({});
    const [priorities, setPriorities] = useState({});
    const [loading, setLoading] = useState(false);
    const [developerData, setDeveloperData] = useState([]);
    const [tickets, setTickets] = useState([]);
    const [assignedTickets, setAssignedTickets] = useState([]);
    const [selectedDevelopers, setSelectedDevelopers] = useState({});
    const [dueDates, setDueDates] = useState({});
    const [activeTicket, setActiveTicket] = useState(null);





    useEffect(() => {

        fetchTeammembers();
        fetchUnassignedTickets();
        fetchAssignedTickets();

    }, []);

    const fetchTeammembers = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/api/team/dashboard");
            //console.log("Dashboard Data:", data);
            setDeveloperData(data.members);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUnassignedTickets = async () => {
        try {
            const { data } = await API.get("/api/complaints/unassigned");
            setTickets(data);
        } catch (err) {
            console.error("Unassigned fetch error", err);
        }
    };

    const fetchAssignedTickets = async () => {
        try {
            const { data } = await API.get("/api/complaints/dept-assigned");
            setAssignedTickets(data);
        } catch (err) {
            console.error("Assigned fetch error", err);
        }
    };


    const handleAddDeveloper = (ticketId, empId) => {
        setSelectedDevelopers(prev => {
            const current = prev[ticketId] || [];

            let updated;

            if (current.includes(empId)) {
                updated = current.filter(id => id !== empId);
            } else {
                updated = [...current, empId];
            }

            // if empty, remove ticket key completely
            if (updated.length === 0) {
                const newState = { ...prev };
                delete newState[ticketId];
                return newState;
            }

            return {
                ...prev,
                [ticketId]: updated
            };
        });
    };

    const handleEditClick = (ticket) => {
        setActiveTicket(ticket);
        if (ticket.rawAssignments) {
            const emps = ticket.rawAssignments.map(a => a.user?._id || a.user);
            setSelectedDevelopers(prev => ({ ...prev, [ticket._id]: emps }));
            setPriorities(prev => ({ ...prev, [ticket._id]: ticket.assignedPriority }));
            setDueDates(prev => ({
                ...prev, [ticket._id]: ticket.assignedDueDate
                    ? dayjs(ticket.assignedDueDate).format("YYYY-MM-DD")
                    : ""
            }));
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

    const handleAssign = async (ticketId) => {
        const employees = selectedDevelopers[ticketId] || [];
        const ticketPriority = priorities[ticketId] || "MEDIUM";
        const ticketDueDate = dueDates[ticketId];

        if (employees.length === 0) return;
        setAssigning(prev => ({ ...prev, [ticketId]: true }));

        try {
            await API.put(`/api/complaints/${ticketId}/assign`, {
                employees,
                priority: ticketPriority,
                dueDate: ticketDueDate
            });

            toast.success("Ticket assigned successfully!");

            // clear selection
            setSelectedDevelopers(prev => {
                const updated = { ...prev };
                delete updated[ticketId];
                return updated;
            });

            // clear priority
            setPriorities(prev => {
                const updated = { ...prev };
                delete updated[ticketId];
                return updated;
            });

            // clear due date
            setDueDates(prev => {
                const updated = { ...prev };
                delete updated[ticketId];
                return updated;
            });

            fetchUnassignedTickets();
            fetchAssignedTickets();
            fetchTeammembers();
            setActiveTicket(null); // Close the modal

        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || "Failed to assign ticket.");
        } finally {
            setAssigning(prev => ({ ...prev, [ticketId]: false }))
        }
    };

    const pendingColumns = [
        { field: "ticketNumber", headerName: "Ticket ID", minWidth: 120 },
        { field: "title", minWidth: 150, headerName: "Ticket Title", flex: 1.5, headerAlign: "left", renderCell: (params) => <span className="fw-bold text-wrap" style={{ display: 'block', width: '100%', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2', textAlign: 'left' }}>{params.row.title}</span> },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
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
            minWidth: 120,
            sortable: false,
            renderCell: (params) => (
                <div className="d-flex gap-2">
                    <button className="btn btn-sm btn-primary rounded-pill px-3 shadow-sm fw-medium" onClick={() => setActiveTicket(params.row)}>Assign</button>
                    <button className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center" style={{ width: '32px', height: '32px' }} onClick={() => navigate(`/ticketdetails/${params.row._id}`)} title="View">
                        <Eye size={16} className="text-secondary" />
                    </button>
                </div>
            )
        }
    ];

    const completedColumns = [
        { field: "ticketNumber", headerName: "Ticket ID", minWidth: 150 },
        { field: "title", minWidth: 120, headerName: "Ticket Title", flex: 1.5, headerAlign: "left", renderCell: (params) => <span className="fw-bold text-wrap" style={{ display: 'block', width: '100%', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2', textAlign: 'left' }}>{params.row.title}</span> },
        { field: "developer", minWidth: 120, headerName: "Assigned Employee", flex: 1.5, headerAlign: "left", renderCell: (params) => <span className="text-success fw-bold text-wrap" style={{ display: 'block', width: '100%', wordBreak: 'break-word', whiteSpace: 'normal', lineHeight: '1.2', textAlign: 'left' }}>{toProperCase(params.row.assignedDevs) || "Assigned"}</span> },
        {
            field: "priority",
            headerName: "Priority",
            minWidth: 120,
            flex: 1,
            renderCell: (params) => (
                <span className={`badge ${getPriorityColor(params.row.assignedPriority)}`}>
                    {params.row.assignedPriority}
                </span>
            )
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            flex: 1,
            renderCell: (params) => (
                <span className={`badge rounded px-3 py-2 fw-medium ${getStatusColor(params.row.status)}`}>
                    {params.row.status}
                </span>
            )
        },
        { field: "dueDate", minWidth: 120, headerName: "Due Date", flex: 1, renderCell: (params) => <span>{params.row.assignedDueDate ? dayjs(params.row.assignedDueDate).format("MMM DD, YYYY") : "-"}</span> },
        {
            field: "actions",
            headerName: "Actions",
            minWidth: 120,
            sortable: false,
            renderCell: (params) => (
                <div className="d-flex gap-2">
                    {params.row.status !== "RESOLVED" && params.row.status !== "REJECTED" && (
                        <button
                            className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                            style={{ width: '32px', height: '32px' }}
                            onClick={() => handleEditClick(params.row)}
                            title="Edit"
                        >
                            <Edit2 size={16} className="text-warning" />
                        </button>
                    )}
                    <button
                        className="btn btn-sm btn-light border shadow-sm rounded-circle d-flex justify-content-center align-items-center"
                        style={{ width: '32px', height: '32px' }}
                        onClick={() => navigate(`/ticketdetails/${params.row._id}`)}
                        title="View"
                    >
                        <Eye size={16} className="text-primary" />
                    </button>
                </div>
            )
        }
    ];

    const pendingRows = tickets.map((t, index) => ({ ...t, id: t._id }));
    const completedRows = assignedTickets
        .filter(t => t.status !== "REJECTED")
        .map((t, index) => ({ ...t, id: t._id }));

    return (
        <div className="container-fluid">
            <div className="row">

                <div className="col-12">

                    <p className="h2 fw-bold">Assign Tickets</p>
                    <p className="text-secondary">
                        Manage unassigned tickets and assign them to team members
                    </p>

                    <div className="mt-4">
                        <CommonTable columns={pendingColumns} rows={pendingRows} Data="New Tickets" />
                    </div>

                    <div className="mt-5">
                        <h4 className="fw-bold mb-3">Recently Assigned Tickets</h4>
                        <CommonTable columns={completedColumns} rows={completedRows} Data="Recent Tickets" />
                    </div>
                </div>

            </div>

            {/* MODAL SECTION */}
            {activeTicket && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title fw-bold">Assign Ticket</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setActiveTicket(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-4"><strong>Ticket:</strong> {activeTicket.title}</p>

                                {/* Developer Dropdown */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Assigned Employee</label>
                                    <div className="dropdown">
                                        <button
                                            className="form-select text-start"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside"
                                        >
                                            {selectedDevelopers[activeTicket._id]?.length
                                                ? selectedDevelopers[activeTicket._id]
                                                    .map(id => developerData.find(d => d._id === id)?.name)
                                                    .join(", ")
                                                : "Select Developer"}
                                        </button>
                                        <ul className="dropdown-menu w-100 p-3 shadow-sm border-0">
                                            {developerData.map((dev) => (
                                                <li key={dev._id} className="mb-2">
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="checkbox"
                                                            id={`dev-${dev._id}`}
                                                            checked={selectedDevelopers[activeTicket._id]?.includes(dev._id) || false}
                                                            onChange={() => handleAddDeveloper(activeTicket._id, dev._id)}
                                                            style={{ cursor: "pointer" }}
                                                        />
                                                        <label
                                                            className="form-check-label"
                                                            htmlFor={`dev-${dev._id}`}
                                                            style={{ cursor: "pointer", userSelect: "none" }}
                                                        >
                                                            {dev.name}
                                                        </label>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Priority */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Priority</label>
                                    <select
                                        className="form-select"
                                        value={priorities[activeTicket._id] ?? "MEDIUM"}
                                        onChange={(e) =>
                                            setPriorities(prev => ({
                                                ...prev,
                                                [activeTicket._id]: e.target.value
                                            }))
                                        }
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>

                                {/* Due Date */}
                                <div className="mb-3">
                                    <label className="form-label fw-semibold">Due Date</label>
                                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                                        <DatePicker
                                            value={dueDates[activeTicket._id] ? dayjs(dueDates[activeTicket._id]) : null}
                                            minDate={dayjs()}
                                            onChange={(newValue) => {
                                                setDueDates(prev => ({
                                                    ...prev,
                                                    [activeTicket._id]: newValue ? newValue.format("YYYY-MM-DD") : ""
                                                }));
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
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setActiveTicket(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={
                                        assigning[activeTicket._id] ||
                                        !(selectedDevelopers[activeTicket._id]?.length > 0) ||
                                        !dueDates[activeTicket._id]
                                    }
                                    className={`btn px-4 ${!(selectedDevelopers[activeTicket._id]?.length > 0) || !dueDates[activeTicket._id]
                                        ? "btn-secondary"
                                        : "btn-primary"
                                        }`}
                                    onClick={() => handleAssign(activeTicket._id)}
                                >
                                    {assigning[activeTicket._id] ? "Assigning..." : "Confirm Assignment"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AssignTickets;

