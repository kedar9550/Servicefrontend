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

import CommonTable from './CommonTable';
import { getStatusColor, getPriorityColor } from "./StatusColors";

function Reports() {
    const { user, isSuperAdmin } = useAuth();
    const [stats, setStats] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [departments, setDepartments] = React.useState([]);
    const [isMounted, setIsMounted] = React.useState(false);
    const [containerReady, setContainerReady] = React.useState(false);
    const containerRef = React.useRef(null);

    const [filters, setFilters] = React.useState({
        dateRange: 'last30days',
        startDate: '',
        endDate: '',
        serviceId: 'all',
        priority: 'all'
    });

    React.useEffect(() => {
        setIsMounted(true);
        fetchStats();
        if (isSuperAdmin()) {
            fetchDepartments();
        }

        // Wait for layout to stabilize (header transitions, sidebar shifts)
        const timer = setTimeout(() => {
            setContainerReady(true);
            // Force a small window resize event to trigger Recharts measurement if it already attempted it
            window.dispatchEvent(new Event('resize'));
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // ... (rest of fetch logic remains same)

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

    if (loading && !stats) return <Loader />;
    if (!stats && !loading) return <div className="text-center p-5">Failed to load reports.</div>;

    const { summary, trendData, statusData, recentTickets } = stats || {};

    const columns = [
        { field: "ticketNumber", headerName: "Ticket ID", minWidth: 130 },
        { field: "title", headerName: "Subject", flex: 1.5, minWidth: 200, renderCell: (params) => <span className="fw-medium">{params.value}</span> },
        { field: "assignedTo", headerName: "Assigned To", flex: 1, minWidth: 150 },
        { 
            field: "status", 
            headerName: "Status", 
            minWidth: 130,
            renderCell: (params) => (
                <span className={`badge rounded px-3 py-2 fw-medium ${getStatusColor(params.value)}`}>
                    {params.value === 'OPEN' ? 'Unassigned' : params.value === 'ASSIGNED' ? 'Assigned' : params.value.replace('_', ' ')}
                </span>
            )
        },
        { 
            field: "priority", 
            headerName: "Priority", 
            minWidth: 110,
            renderCell: (params) => (
                <span className={`badge ${getPriorityColor(params.value)}`}>
                    {params.value}
                </span>
            )
        },
        { field: "createdAt", headerName: "Created Date", minWidth: 120, renderCell: (params) => new Date(params.value).toLocaleDateString('en-GB').replace(/\//g, "-") },
        { 
            field: "dueDate", 
            headerName: "Due Date", 
            minWidth: 120, 
            renderCell: (params) => {
                if (!params.value) return "--";
                const isOverdue = new Date(params.value) < new Date() && params.row.status !== 'RESOLVED' && params.row.status !== 'CLOSED';
                return <span className={isOverdue ? "text-danger fw-bold" : "text-primary fw-medium"}>
                    {new Date(params.value).toLocaleDateString('en-GB').replace(/\//g, "-")}
                </span>;
            }
        },
        { field: "updatedAt", headerName: "Closed Date", minWidth: 120, renderCell: (params) => params.row.status === 'RESOLVED' || params.row.status === 'CLOSED' ? new Date(params.value).toLocaleDateString('en-GB').replace(/\//g, "-") : "--" }
    ];

    const rows = recentTickets?.map((t, idx) => ({ ...t, id: t._id || idx })) || [];

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
        <div className="px-2 py-3 px-md-4 py-md-4" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
            
            {loading && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center bg-white bg-opacity-50" style={{ zIndex: 1050 }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
                <h3 className="fw-bold mb-0 flex-grow-1" style={{ fontSize: "1.5rem" }}>
                    Reports {stats?.departmentName ? `- ${stats.departmentName}` : ''}
                </h3>
                <div className="dropdown">
                    <button 
                        className="btn btn-primary-custom d-flex align-items-center justify-content-center dropdown-toggle text-white border-0" 
                        style={{ 
                            backgroundColor: "var(--primary-color)", 
                            width: "48px", 
                            height: "48px", 
                            borderRadius: "50%",
                            padding: "0",
                            transition: "0.3s",
                            flexShrink: 0
                        }}
                        type="button" 
                        data-bs-toggle="dropdown" 
                        aria-expanded="false"
                        onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                        onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                    >
                        {/* Desktop Text */}
                        <span className="d-none d-md-inline me-md-2 ps-md-4 pe-md-1">Export Report</span>
                        {/* Icon */}
                        <span className="d-flex align-items-center justify-content-center pe-md-4">
                            <Download size={20} strokeWidth={2.5}/>
                        </span>

                        {/* Responsive Style Override */}
                        <style dangerouslySetInnerHTML={{ __html: `
                            .btn-primary-custom::after {
                                display: none !important; /* Hide chevron for round look on mobile */
                            }
                            @media (min-width: 768px) {
                                .btn-primary-custom { 
                                    width: auto !important; 
                                    height: auto !important; 
                                    border-radius: 50px !important; 
                                    padding: 0.6rem 1.5rem !important;
                                    flex-shrink: 0 !important;
                                }
                                .btn-primary-custom::after {
                                    display: inline-block !important; /* Restore chevron on desktop if needed */
                                    vertical-align: 0.255em;
                                    content: "";
                                    border-top: 0.3em solid;
                                    border-right: 0.3em solid transparent;
                                    border-bottom: 0;
                                    border-left: 0.3em solid transparent;
                                    margin-left: 0.5em;
                                }
                            }
                        `}} />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                        <li><button className="dropdown-item py-2 px-3 fw-medium" onClick={exportToExcel}>Export as Excel (.xlsx)</button></li>
                        <li><button className="dropdown-item py-2 px-3 fw-medium" onClick={exportToPDF}>Export as PDF (.pdf)</button></li>
                    </ul>
                </div>
            </div>

            {/* Filters */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: "var(--card-bg)" }}>
                <h6 className="fw-bold mb-3">Filter & Date Range</h6>
                <div className="d-flex gap-3 flex-wrap align-items-end">
                    <div className="w-100-mobile" style={{ flex: "1 1 220px", minWidth: "220px" }}>
                        <label className="form-label small text-muted fw-bold">Duration</label>
                        <div className="input-group w-100">
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

                    <style dangerouslySetInnerHTML={{ __html: `
                        @media (max-width: 767px) {
                            .w-100-mobile { width: 100% !important; flex: 1 1 100% !important; }
                        }
                    `}} />

                    {filters.dateRange === 'custom' && (
                        <>
                            <div>
                                <label className="form-label small text-muted fw-bold">Start Date</label>
                                <input 
                                    type="date" 
                                    className="form-control w-100" 
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
                                    className="form-control w-100" 
                                    style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                                    name="endDate"
                                    value={filters.endDate}
                                    onChange={handleFilterChange}
                                />
                            </div>
                        </>
                    )}

                    {isSuperAdmin() && (
                        <div className="w-100-mobile" style={{ flex: "1 1 200px", minWidth: "200px" }}>
                            <label className="form-label small text-muted fw-bold">Department</label>
                            <select 
                                className="form-select fw-medium w-100" 
                                style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                                name="serviceId"
                                value={filters.serviceId}
                                onChange={handleFilterChange}
                            >
                                <option value="all">All Departments</option>
                                {departments.map(dept => (
                                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="w-100-mobile" style={{ flex: "1 1 160px", minWidth: "160px" }}>
                        <label className="form-label small text-muted fw-bold">Priority</label>
                        <select 
                            className="form-select fw-medium w-100" 
                            style={{ backgroundColor: "var(--input-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}
                            name="priority"
                            value={filters.priority}
                            onChange={handleFilterChange}
                        >
                            <option value="all">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                        </select>
                    </div>

                    <div className="w-100-mobile text-end ms-auto">
                        <button 
                            className="btn btn-primary px-4 fw-medium" 
                            style={{ height: "38px" }}
                            onClick={applyFilters}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 mb-4">
                <div className="col">
                    <div className="card shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--stat-card-bg)", border: "1px solid var(--border-color)" }}>
                        <div className="d-flex gap-3 mb-2 align-items-center">
                            <div className="rounded d-flex justify-content-center align-items-center" style={{ width: "42px", height: "42px", backgroundColor: "rgba(245, 166, 35, 0.15)", color: "#f5a623" }}>
                                <Activity size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h6 className="text-secondary fw-medium mb-1" style={{ fontSize: "0.9rem" }}>Resolution Rate</h6>
                                <h3 className="fw-bold mb-0 text-color-adaptive">{summary?.resolutionRate || "0%"}</h3>
                            </div>
                        </div>
                        <div className="progress mt-3 rounded-pill" style={{ height: "6px" }}>
                            <div className="progress-bar rounded-pill" role="progressbar" style={{ width: summary?.resolutionRate || "0%", backgroundColor: "#f5a623" }}></div>
                        </div>
                    </div>
                </div>

                <div className="col">
                    <div className="card shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--stat-card-bg)", border: "1px solid var(--border-color)" }}>
                        <div className="d-flex gap-3 mb-2 align-items-center">
                            <div className="rounded d-flex justify-content-center align-items-center" style={{ width: "42px", height: "42px", backgroundColor: "rgba(24, 144, 255, 0.15)", color: "#1890ff" }}>
                                <Timer size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h6 className="text-secondary fw-medium mb-1" style={{ fontSize: "0.9rem" }}>Avg. Handling Time</h6>
                                <h3 className="fw-bold mb-0 text-color-adaptive">{summary?.avgHandlingTime || "0 Days"}</h3>
                            </div>
                        </div>
                        <div className="progress mt-3 rounded-pill" style={{ height: "6px" }}>
                            <div className="progress-bar rounded-pill" role="progressbar" style={{ width: "70%", backgroundColor: "#1890ff" }}></div>
                        </div>
                    </div>
                </div>

                <div className="col">
                    <div className="card shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--stat-card-bg)", border: "1px solid var(--border-color)" }}>
                        <div className="d-flex gap-3 mb-2 align-items-center">
                            <div className="rounded d-flex justify-content-center align-items-center" style={{ width: "42px", height: "42px", backgroundColor: "rgba(245, 34, 45, 0.15)", color: "#f5222d" }}>
                                <AlertCircle size={22} strokeWidth={2.5}/>
                            </div>
                            <div>
                                <h6 className="text-secondary fw-medium mb-1" style={{ fontSize: "0.9rem" }}>Overdue Tickets</h6>
                                <h3 className="fw-bold mb-0 text-color-adaptive">{summary?.overdueTickets || 0}</h3>
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
                <div className="col-12 col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h5 className="fw-bold mb-4">Tickets Trend (Last 30 Days)</h5>
                        <div style={{ height: "250px", width: "100%", position: "relative", minHeight: "250px", minWidth: "1px" }}>
                            {containerReady ? (
                                <ResponsiveContainer 
                                    key="trend-container"
                                    id="trend-chart" 
                                    width="100%" 
                                    height={250} 
                                    minWidth={1} 
                                    minHeight={1}
                                    debounce={50}
                                >
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
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h5 className="fw-bold mb-4">Tickets by Status</h5>
                        <div style={{ height: "250px", width: "100%", position: "relative", minHeight: "250px", minWidth: "1px" }}>
                            {containerReady ? (
                                <ResponsiveContainer 
                                    key="status-container"
                                    id="status-chart" 
                                    width="100%" 
                                    height={250} 
                                    minWidth={1} 
                                    minHeight={1}
                                    debounce={50}
                                >
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
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100 w-100">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Table using CommonTable */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" style={{ backgroundColor: "var(--card-bg)" }}>
                <h5 className="fw-bold mb-4">Detailed Report Table</h5>
                <CommonTable 
                    columns={columns} 
                    rows={rows} 
                    Data="Tickets Report" 
                    initialPageSize={10}
                />
            </div>

        </div>
    );
}

export default Reports;