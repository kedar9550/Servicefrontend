import React from "react";
import API from "../api/axios";
import Loader from './Loader';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, AlertCircle, Timer, Activity, ChevronDown, ChevronLeft, ChevronRight, FileText, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';

function Reports() {
    const { user, isSuperAdmin } = useAuth();
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [departments, setDepartments] = React.useState([]);
    const [page, setPage] = React.useState(1);
    const rowsPerPage = 5;

    const [filters, setFilters] = React.useState({
        dateRange: 'last30days',
        startDate: '',
        endDate: '',
        serviceId: 'all',
        priority: 'all'
    });

    React.useEffect(() => {
        fetchStats();
        if (isSuperAdmin()) {
            fetchDepartments();
        }
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await API.get("/api/service");
            setDepartments(res.data);
        } catch (error) {
            console.error("Error fetching departments:", error);
        }
    };

    const fetchStats = async (activeFilters = filters) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (activeFilters.dateRange) params.append('dateRange', activeFilters.dateRange);
            if (activeFilters.startDate) params.append('startDate', activeFilters.startDate);
            if (activeFilters.endDate) params.append('endDate', activeFilters.endDate);
            if (activeFilters.serviceId) params.append('serviceId', activeFilters.serviceId);
            if (activeFilters.priority) params.append('priority', activeFilters.priority);

            const res = await API.get(`/api/complaints/reports?${params.toString()}`);
            setStats(res.data);
            setPage(1); // Reset to first page on new filter
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        fetchStats();
    };

    const exportToExcel = () => {
        console.log("Exporting to Excel...", stats?.recentTickets?.length);
        if (!stats?.recentTickets?.length) {
            toast.info("No data available to export.");
            return;
        }
        try {
            const data = stats.recentTickets.map(t => ({
                'Ticket ID': t.ticketNumber,
                'Subject': t.title,
                'Assigned To': t.assignedTo || '--',
                'Status': t.status,
                'Priority': t.priority,
                'Created Date': new Date(t.createdAt).toLocaleDateString('en-GB'),
                'Closed Date': t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-GB') : '--',
                'Due Date': t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB') : '--'
            }));
            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets Report");
            XLSX.writeFile(workbook, `Tickets_Report_${new Date().toISOString().split('T')[0]}.xlsx`);
            toast.success("Excel export initiated.");
        } catch (error) {
            console.error("Excel Export Error:", error);
            toast.error("Failed to export Excel.");
        }
    };

    const exportToPDF = () => {
        console.log("Exporting to PDF...", stats?.recentTickets?.length);
        if (!stats?.recentTickets?.length) {
            toast.info("No data available to export.");
            return;
        }
        try {
            const doc = new jsPDF();
            doc.text("Tickets Report", 14, 15);
            const tableColumn = ["Ticket ID", "Subject", "Assigned To", "Status", "Priority", "Created Date", "Due Date"];
            const tableRows = stats.recentTickets.map(t => [
                t.ticketNumber,
                t.title,
                t.assignedTo || '--',
                t.status,
                t.priority,
                new Date(t.createdAt).toLocaleDateString('en-GB'),
                t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB') : '--'
            ]);
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 20,
            });
            doc.save(`Tickets_Report_${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success("PDF export initiated.");
        } catch (error) {
            console.error("PDF Export Error:", error);
            toast.error("Failed to export PDF.");
        }
    };

    if (loading && !stats) return <Loader />; // Only show loader on initial load or if no data
    if (!stats && !loading) return <div className="text-center p-5">Failed to load reports.</div>;

    const { summary, trendData, statusData, recentTickets } = stats || {};

    const totalPages = Math.ceil((recentTickets?.length || 0) / rowsPerPage);
    const paginatedTickets = recentTickets?.slice((page - 1) * rowsPerPage, page * rowsPerPage) || [];

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-2 border rounded shadow-sm" style={{ fontSize: "12px" }}>
                    <p className="mb-1 fw-bold">{label}</p>
                    <p className="mb-0 text-success">Created: {payload[0].value}</p>
                    {payload[1] && <p className="mb-0" style={{ color: "#f97316" }}>Closed: {payload[1].value}</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container-fluid py-4" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
            
            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50" style={{ zIndex: 1050 }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="fw-bold mb-0">Reports {stats?.departmentName ? `- ${stats.departmentName}` : ''}</h3>
                <div className="dropdown">
                    <button 
                        className="btn btn-primary d-flex align-items-center gap-2 rounded-pill px-4 dropdown-toggle" 
                        style={{ backgroundColor: "#0b3d91" }}
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                    >
                        <Download size={16} strokeWidth={2}/> Export Report
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                        <li><button className="dropdown-item py-2 px-3 fw-medium" onClick={exportToExcel}>Export as Excel (.xlsx)</button></li>
                        <li><button className="dropdown-item py-2 px-3 fw-medium" onClick={exportToPDF}>Export as PDF (.pdf)</button></li>
                    </ul>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <h6 className="fw-bold mb-3">Filter & Date Range</h6>
                <div className="d-flex gap-3 flex-wrap align-items-end">
                    {/* Date Range Select */}
                    <div>
                        <label className="form-label small text-muted fw-bold">Duration</label>
                        <div className="input-group" style={{ width: "220px" }}>
                            <span className="input-group-text text-muted" style={{ backgroundColor: "var(--input-bg)", borderColor: "var(--border-color)" }}><Calendar size={18} /></span>
                            <select 
                                className="form-select border-start-0 ps-0 fw-medium"
                                style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                                name="dateRange"
                                value={filters.dateRange}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Time</option>
                                <option value="last10days">Last 10 Days</option>
                                <option value="last30days">Last 30 Days</option>
                                <option value="last3months">Last 3 Months</option>
                                <option value="last6months">Last 6 Months</option>
                                <option value="lastyear">Last Year</option>
                                <option value="custom">Custom Date</option>
                            </select>
                        </div>
                    </div>

                    {/* Custom Date Inputs */}
                    {filters.dateRange === 'custom' && (
                        <>
                            <div>
                                <label className="form-label small text-muted fw-bold">Start Date</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                                    name="startDate"
                                    value={filters.startDate}
                                    onChange={handleFilterChange}
                                />
                            </div>
                            <div>
                                <label className="form-label small text-muted fw-bold">End Date</label>
                                <input 
                                    type="date" 
                                    className="form-control" 
                                    style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </>
                    )}

                    {/* Department Select (for Super Admin) */}
                    {isSuperAdmin() && (
                        <div>
                            <label className="form-label small text-muted fw-bold">Department</label>
                            <select 
                                className="form-select fw-medium" 
                                style={{ width: "200px", backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                                name="serviceId"
                                value={filters.serviceId}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id} style={{ color: "var(--text-color)" }}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Priority Select */}
                    <div>
                        <label className="form-label small text-muted fw-bold">Priority</label>
                        <select 
                            className="form-select fw-medium" 
                            style={{ width: "160px", backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                            name="priority"
                            value={filters.priority}
                            onChange={handleFilterChange}
                        >
                            <option value="all" style={{ color: "var(--text-color)" }}>All Priorities</option>
                            <option value="low" style={{ color: "var(--text-color)" }}>Low</option>
                            <option value="medium" style={{ color: "var(--text-color)" }}>Medium</option>
                            <option value="high" style={{ color: "var(--text-color)" }}>High</option>
                        </select>
                    </div>

                    <button 
                        className="btn btn-primary px-4 fw-medium h-100" 
                        style={{ height: "38px" }}
                        onClick={applyFilters}
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Top KPIs */}
            <div className="row g-4 mb-4">
                {/* Resolution Rate */}
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--stat-card-bg)", border: "1px solid var(--border-color)" }}>
                        <div className="d-flex gap-3 mb-2 align-items-center">
                            <div className="rounded d-flex justify-content-center align-items-center" style={{ width: "42px", height: "42px", backgroundColor: "rgba(245, 166, 35, 0.15)", color: "#f5a623" }}>
                                <Activity size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h6 className="text-secondary fw-medium mb-1" style={{ fontSize: "0.9rem" }}>Resolution Rate</h6>
                                <h3 className="fw-bold mb-0">{summary?.resolutionRate || "0%"}</h3>
                            </div>
                        </div>
                        <div className="progress mt-3 rounded-pill" style={{ height: "6px" }}>
                            <div className="progress-bar rounded-pill" role="progressbar" style={{ width: summary?.resolutionRate || "0%", backgroundColor: "#f5a623" }}></div>
                        </div>
                    </div>
                </div>

                {/* Avg Handling Time */}
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--stat-card-bg)", border: "1px solid var(--border-color)" }}>
                        <div className="d-flex gap-3 mb-2 align-items-center">
                            <div className="rounded d-flex justify-content-center align-items-center" style={{ width: "42px", height: "42px", backgroundColor: "rgba(24, 144, 255, 0.15)", color: "#1890ff" }}>
                                <Timer size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h6 className="text-secondary fw-medium mb-1" style={{ fontSize: "0.9rem" }}>Avg. Handling Time</h6>
                                <h3 className="fw-bold mb-0">{summary?.avgHandlingTime || "0 Days"}</h3>
                            </div>
                        </div>
                        <div className="progress mt-3 rounded-pill" style={{ height: "6px" }}>
                            <div className="progress-bar rounded-pill" role="progressbar" style={{ width: "70%", backgroundColor: "#1890ff" }}></div>
                        </div>
                    </div>
                </div>

                {/* Overdue Tickets */}
                <div className="col-12 col-md-4">
                    <div className="card shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--stat-card-bg)", border: "1px solid var(--border-color)" }}>
                        <div className="d-flex gap-3 mb-2 align-items-center">
                            <div className="rounded d-flex justify-content-center align-items-center" style={{ width: "42px", height: "42px", backgroundColor: "rgba(245, 34, 45, 0.15)", color: "#f5222d" }}>
                                <AlertCircle size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h6 className="text-secondary fw-medium mb-1" style={{ fontSize: "0.9rem" }}>Overdue Tickets</h6>
                                <h3 className="fw-bold mb-0">{summary?.overdueTickets || 0}</h3>
                            </div>
                        </div>
                        <div className="progress mt-3 rounded-pill" style={{ height: "6px" }}>
                            <div className="progress-bar rounded-pill" role="progressbar" style={{ width: "100%", backgroundColor: "#cc0000" }}></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="row g-4 mb-4">
                {/* Trend Area Chart */}
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-4">Tickets Trend (Last 30 Days)</h5>
                        <div style={{ height: "250px", width: "100%" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorClosed" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tick={{fontSize: 11, fill: "#888"}} tickLine={false} axisLine={false} minTickGap={20} />
                                    <YAxis tick={{fontSize: 11, fill: "#888"}} tickLine={false} axisLine={false} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="created" stroke="#22c55e" strokeWidth={3} fillOpacity={1} fill="url(#colorCreated)" />
                                    <Area type="monotone" dataKey="closed" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorClosed)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Status Pie Chart */}
                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h5 className="fw-bold mb-4">Tickets by Status</h5>
                        <div style={{ height: "250px", width: "100%" }} className="d-flex justify-content-start align-items-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusData}
                                        innerRadius={65}
                                        outerRadius={95}
                                        paddingAngle={2}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {statusData?.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip wrapperStyle={{ outline: "none", border: "none" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "12px", right: "-10px" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Detailed Report Table</h5>
                    <div className="input-group shadow-sm rounded border" style={{ width: "250px", borderColor: "var(--border-color)" }}>
                        <input type="text" className="form-control border-end-0 border-0" style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)" }} placeholder="Search reports..." />
                        <span className="input-group-text border-0" style={{ backgroundColor: "var(--input-bg)" }}><FileText size={16} className="text-muted"/></span>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table align-middle border-top mb-1" style={{ fontSize: "0.95rem" }}>
                        <thead className="stat-card-adaptive text-muted">
                            <tr>
                                <th className="fw-semibold border-0 py-3">Ticket ID</th>
                                <th className="fw-semibold border-0 py-3">Subject</th>
                                <th className="fw-semibold border-0 py-3">Assigned To</th>
                                <th className="fw-semibold border-0 py-3">Status</th>
                                <th className="fw-semibold border-0 py-3">Priority</th>
                                <th className="fw-semibold border-0 py-3">Created Date</th>
                                <th className="fw-semibold border-0 py-3">Due Date</th>
                                <th className="fw-semibold border-0 py-3">Closed Date</th>
                            </tr>
                        </thead>
                        <tbody className="border-0">
                            {paginatedTickets.map((t, idx) => {
                                const isResolved = t.status === 'RESOLVED';
                                const isOverdue = !isResolved && t.status !== 'CLOSED' && t.dueDate && new Date(t.dueDate) < new Date();
                                const isUnassigned = t.status === 'OPEN';

                                return (
                                    <tr key={idx} style={
                                            isOverdue ? { backgroundColor: "rgba(239, 68, 68, 0.1)", borderLeft: "4px solid #ef4444" } : 
                                            isResolved ? { backgroundColor: "rgba(34, 197, 94, 0.1)" } : 
                                            isUnassigned ? { backgroundColor: "rgba(249, 115, 22, 0.1)" } : 
                                            t.status === 'IN_PROGRESS' ? { backgroundColor: "rgba(234, 179, 8, 0.1)" } : 
                                            t.status === 'ASSIGNED' ? { backgroundColor: "rgba(59, 130, 246, 0.1)" } : {}
                                        }>
                                        <td className="text-muted">{t.ticketNumber}</td>
                                        <td className="fw-medium" style={{ color: "var(--text-color)" }}>{t.title}</td>
                                        <td className="text-muted">{t.assignedTo}</td>
                                        <td>
                                            {(() => {
                                                let badgeColor = '#f97316'; // Orange (Unassigned)
                                                let badgeText = isUnassigned ? 'Unassigned' : 'Assigned';

                                                if (isResolved) {
                                                    badgeColor = '#22c55e'; // Green
                                                    badgeText = 'Resolved';
                                                } else if (t.status === 'IN_PROGRESS') {
                                                    badgeColor = '#eab308'; // Yellow
                                                    badgeText = 'In Progress';
                                                } else if (t.status === 'ASSIGNED') {
                                                    badgeColor = '#3b82f6'; // Blue
                                                    badgeText = 'Assigned';
                                                }

                                                return (
                                                    <span className="badge rounded px-3 py-2 fw-medium" style={{ backgroundColor: badgeColor, color: '#fff' }}>
                                                        {badgeText}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                    <td className="text-secondary">{t.priority}</td>
                                    <td className="text-secondary">{new Date(t.createdAt).toLocaleDateString('en-GB').replace(/\//g, "-")}</td>
                                    <td className={!t.dueDate ? "text-muted" : (new Date(t.dueDate) < new Date() && t.status !== 'RESOLVED' ? "text-danger fw-bold" : "text-primary fw-medium")}>
                                        {t.dueDate ? new Date(t.dueDate).toLocaleDateString('en-GB').replace(/\//g, "-") : "--"}
                                    </td>
                                    <td className="text-muted fw-bold">{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-GB').replace(/\//g, "-") : "--"}</td>
                                </tr>
                            );
                        })}
                            {paginatedTickets.length === 0 && (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No records found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-end align-items-center mt-3 gap-3">
                    <button 
                        className="btn btn-sm btn-light border rounded shadow-sm" 
                        disabled={page === 1} 
                        onClick={() => setPage(page - 1)}
                    >
                        <ChevronLeft size={16} className="text-secondary"/>
                    </button>
                    <span className="text-dark fw-medium" style={{ fontSize: "0.9rem" }}>
                        {page} <span className="text-muted fw-normal mx-1">of</span> {totalPages || 1}
                    </span>
                    <button 
                        className="btn btn-sm btn-light border rounded shadow-sm" 
                        disabled={page >= totalPages || totalPages === 0} 
                        onClick={() => setPage(page + 1)}
                    >
                        <ChevronRight size={16} className="text-secondary"/>
                    </button>
                </div>
            </div>

        </div>
    );
}

export default Reports;