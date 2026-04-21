import React from "react";
import API from "../api/axios";
import Loader from './Loader';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Calendar, AlertCircle, Timer, Activity, ChevronDown, ChevronLeft, ChevronRight, FileText, Download, Star, Smile, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
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

    const { summary, feedbackSummary, trendData, feedbackTrendData, statusData, recentTickets } = stats || {};

    const satisfactionColors = {
        "Very Satisfied": "#22c55e",
        "Satisfied": "#84cc16",
        "Neutral": "#eab308",
        "Dissatisfied": "#f97316",
        "Very Dissatisfied": "#ef4444"
    };

    const satisfactionData = feedbackSummary?.satisfactionDistribution ? 
        Object.entries(feedbackSummary.satisfactionDistribution).map(([name, value]) => ({
            name,
            value,
            color: satisfactionColors[name] || "#CBD5E1"
        })).filter(d => d.value > 0) : [];

    const renderStars = (rating) => {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="d-flex gap-1" style={{ fontSize: '14px' }}>
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} size={14} fill="#f5a623" color="#f5a623" />)}
                {hasHalfStar && <Star size={14} fill="url(#halfGrad)" color="#f5a623" />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} size={14} color="#bdc3c7" />)}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                        <linearGradient id="halfGrad">
                            <stop offset="50%" stopColor="#f5a623" />
                            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    };

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

            {/* Feedback KPIs */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-5 g-4 mb-4">
                {/* Avg Rating */}
                <div className="col">
                    <div className="card shadow-sm rounded-4 p-3 h-100 border-0" style={{ backgroundColor: "var(--card-bg)" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 d-flex justify-content-center align-items-center" style={{ width: "45px", height: "45px", backgroundColor: "rgba(245, 166, 35, 0.1)", color: "#f5a623" }}>
                                <Star size={20} strokeWidth={2.5} />
                            </div>
                            <div className="overflow-hidden">
                                <label className="text-muted small fw-medium mb-1 d-block">Average Rating</label>
                                <div className="d-flex align-items-baseline gap-2">
                                    <h4 className="fw-bold mb-0">{feedbackSummary?.averageRating || "0.0"}</h4>
                                    <span className="text-muted small">/ 5</span>
                                </div>
                                <div className="mt-1">
                                    {renderStars(Number(feedbackSummary?.averageRating || 0))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Feedback */}
                <div className="col">
                    <div className="card shadow-sm rounded-4 p-3 h-100 border-0" style={{ backgroundColor: "var(--card-bg)" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 d-flex justify-content-center align-items-center" style={{ width: "45px", height: "45px", backgroundColor: "rgba(34, 197, 94, 0.1)", color: "#22c55e" }}>
                                <Smile size={20} strokeWidth={2.5} />
                            </div>
                            <div className="overflow-hidden">
                                <label className="text-muted small fw-medium mb-1 d-block">Total Feedback</label>
                                <h4 className="fw-bold mb-0">{feedbackSummary?.totalFeedback || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Positive Feedback */}
                <div className="col">
                    <div className="card shadow-sm rounded-4 p-3 h-100 border-0" style={{ backgroundColor: "var(--card-bg)" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 d-flex justify-content-center align-items-center" style={{ width: "45px", height: "45px", backgroundColor: "rgba(59, 130, 246, 0.1)", color: "#3b82f6" }}>
                                <ThumbsUp size={20} strokeWidth={2.5} />
                            </div>
                            <div className="overflow-hidden w-100">
                                <label className="text-muted small fw-medium mb-1 d-block">Positive Feedback</label>
                                <div className="d-flex align-items-baseline gap-1">
                                    <h4 className="fw-bold mb-0">{feedbackSummary?.positiveFeedback?.count || 0}</h4>
                                    <span className="text-success small fw-bold">({feedbackSummary?.positiveFeedback?.percentage || 0}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Negative Feedback */}
                <div className="col">
                    <div className="card shadow-sm rounded-4 p-3 h-100 border-0" style={{ backgroundColor: "var(--card-bg)" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 d-flex justify-content-center align-items-center" style={{ width: "45px", height: "45px", backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>
                                <ThumbsDown size={20} strokeWidth={2.5} />
                            </div>
                            <div className="overflow-hidden w-100">
                                <label className="text-muted small fw-medium mb-1 d-block">Negative Feedback</label>
                                <div className="d-flex align-items-baseline gap-1">
                                    <h4 className="fw-bold mb-0">{feedbackSummary?.negativeFeedback?.count || 0}</h4>
                                    <span className="text-danger small fw-bold">({feedbackSummary?.negativeFeedback?.percentage || 0}%)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments */}
                <div className="col">
                    <div className="card shadow-sm rounded-4 p-3 h-100 border-0" style={{ backgroundColor: "var(--card-bg)" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 d-flex justify-content-center align-items-center" style={{ width: "45px", height: "45px", backgroundColor: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
                                <MessageSquare size={20} strokeWidth={2.5} />
                            </div>
                            <div className="overflow-hidden">
                                <label className="text-muted small fw-medium mb-1 d-block">Comments</label>
                                <h4 className="fw-bold mb-0">{feedbackSummary?.commentsCount || 0}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ticket Charts Row */}
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

            {/* Feedback Charts Row */}
            <div className="row g-4 mb-4">
                {/* Rating Distribution */}
                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h5 className="fw-bold mb-4">Rating Distribution</h5>
                        <div className="d-flex flex-column gap-3 justify-content-center" style={{ minHeight: "250px" }}>
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = feedbackSummary?.ratingDistribution?.[rating] || 0;
                                const percentage = feedbackSummary?.totalFeedback > 0 ? ((count / feedbackSummary.totalFeedback) * 100).toFixed(1) : 0;
                                return (
                                    <div key={rating} className="d-flex align-items-center gap-3">
                                        <div className="text-muted small fw-bold" style={{ minWidth: "45px" }}>{rating} Star</div>
                                        <div className="flex-grow-1 bg-light rounded-pill overflow-hidden" style={{ height: "8px" }}>
                                            <div 
                                                className="h-100 rounded-pill transition-all" 
                                                style={{ 
                                                    width: `${percentage}%`, 
                                                    backgroundColor: rating >= 4 ? "#22c55e" : rating === 3 ? "#eab308" : "#ef4444",
                                                    transition: "width 1s ease-in-out"
                                                }}
                                            />
                                        </div>
                                        <div className="text-muted small" style={{ minWidth: "65px" }}>{count} ({percentage}%)</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Satisfaction Level */}
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h5 className="fw-bold mb-4">Satisfaction Level</h5>
                        <div style={{ height: "250px", width: "100%", position: "relative" }}>
                            {containerReady ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={satisfactionData}
                                            innerRadius={60}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {satisfactionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip wrapperStyle={{ outline: "none", border: "none" }} />
                                        <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "12px" }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="d-flex align-items-center justify-content-center h-100">
                                    <div className="spinner-border spinner-border-sm text-primary" role="status"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Feedback Over Time */}
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h5 className="fw-bold mb-4">Feedback Over Time</h5>
                        <div style={{ height: "250px", width: "100%", position: "relative" }}>
                            {containerReady ? (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={feedbackTrendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorFeedback" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" tick={{fontSize: 10, fill: "#888"}} tickLine={false} axisLine={false} minTickGap={20} />
                                        <YAxis tick={{fontSize: 10, fill: "#888"}} tickLine={false} axisLine={false} />
                                        <Tooltip 
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-white p-2 border rounded shadow-sm" style={{ fontSize: "11px" }}>
                                                            <p className="mb-1 fw-bold">{label}</p>
                                                            <p className="mb-0 text-primary">Feedback: {payload[0].value}</p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFeedback)" />
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