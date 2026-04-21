import React, { useState, useEffect, useMemo } from 'react';
import { Avatar, Box, Typography, TextField, MenuItem, Select, FormControl, InputAdornment, IconButton, LinearProgress, Collapse, Divider } from '@mui/material';
import { Star, Smile, ThumbsUp, ThumbsDown, MessageSquare, Search, Download, ChevronDown, Filter, ShieldCheck, TrendingUp, Reply, User, CheckCircle, Calendar } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import API from '../api/axios';
import CommonTable from '../Components/CommonTable';
import { getSatisfactionColor } from '../Components/StatusColors';
import { Link } from 'react-router-dom';
import Loader from '../Components/Loader';
import NoData from '../Components/No_data';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ title, value, icon: Icon, trend, subtitle, color, progress, bgIcon: BgIcon }) => (
    <div className="card shadow-sm border-0 rounded-4 p-4 h-100 position-relative overflow-hidden" 
         style={{ backgroundColor: "var(--card-bg)" }}>
        <div className="position-absolute" style={{ right: '-15px', bottom: '-15px', opacity: 0.05, color: color }}>
            {BgIcon && <BgIcon size={120} strokeWidth={1} />}
        </div>
        <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
                <Typography variant="caption" sx={{ color: 'var(--secondary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {title}
                </Typography>
                <div className="d-flex align-items-center gap-2 mt-1">
                    <h2 className="fw-bold mb-0" style={{ color: 'var(--text-color)' }}>{value}</h2>
                    {title === "Average Rating" && <Star size={24} fill="#f5a623" color="#f5a623" />}
                </div>
            </div>
            <div className="rounded-circle d-flex justify-content-center align-items-center" 
                 style={{ width: "48px", height: "48px", backgroundColor: `${color}15`, color: color }}>
                <Icon size={24} strokeWidth={2.5} />
            </div>
        </div>

        {progress !== undefined && (
            <div className="mb-3">
                <LinearProgress 
                    variant="determinate" 
                    value={progress} 
                    sx={{ 
                        height: 8, 
                        borderRadius: 4, 
                        backgroundColor: 'var(--border-color)',
                        '& .MuiLinearProgress-bar': { backgroundColor: color } 
                    }} 
                />
            </div>
        )}

        {subtitle && (
            <Typography variant="body2" sx={{ color: 'var(--secondary-color)', mb: 2 }}>
                {subtitle}
            </Typography>
        )}

        {trend && (
            <div className="d-flex align-items-center gap-1">
                <TrendingUp size={14} className="text-success" />
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 700 }}>
                    {trend}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--secondary-color)', ml: 0.5 }}>
                    this month
                </Typography>
            </div>
        )}
    </div>
);

const DetailBox = ({ title, content, icon: Icon }) => (
    <Box sx={{ flex: 1, minWidth: '300px' }}>
        <Box display="flex" alignItems="center" gap={1} mb={1.5}>
            <Icon size={18} color="var(--secondary-color)" />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--text-color)' }}>
                {title}
            </Typography>
        </Box>
        <Box 
            sx={{ 
                p: 2.5, 
                borderRadius: '16px', 
                bgcolor: 'var(--bg-color)', 
                border: '1px solid var(--border-color)',
                minHeight: '70px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
        >
            <Typography variant="body2" sx={{ color: 'var(--text-color)', fontStyle: 'italic', opacity: 0.9, lineHeight: 1.6 }}>
                {content ? `"${content}"` : "No message provided."}
            </Typography>
        </Box>
    </Box>
);

const MetaItem = ({ label, value, icon: Icon, badge }) => (
    <Box>
        <Typography variant="caption" sx={{ color: 'var(--secondary-color)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.8, display: 'block', mb: 0.5, fontSize: '10px' }}>
            {label}
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
            {Icon && <Icon size={14} color={label === "Status" ? "var(--success-color)" : "var(--secondary-color)"} />}
            {badge ? (
                <span className="badge" style={{ backgroundColor: 'var(--sidebar-hover)', color: 'var(--text-color)', fontSize: '10px', textTransform: 'uppercase', border: '1px solid var(--border-color)', padding: '4px 8px' }}>
                    {value}
                </span>
            ) : (
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'var(--text-color)', fontSize: '0.9rem' }}>
                    {value}
                </Typography>
            )}
        </Box>
    </Box>
);

const FeedbackOverview = () => {
    const { user, isSuperAdmin: checkSuperAdmin } = useAuth();
    const isSA = checkSuperAdmin();

    const [feedbackData, setFeedbackData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [trendData, setTrendData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter & Pagination States
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("All Services");
    const [ratingFilter, setRatingFilter] = useState("All Ratings");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [expandedId, setExpandedId] = useState(null);
    const [allServicesList, setAllServicesList] = useState([]);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const [feedbackRes, servicesRes] = await Promise.all([
                API.get('/api/complaints/feedback/all', { withCredentials: true }),
                API.get('/api/service', { withCredentials: true })
            ]);

            if (feedbackRes.data.success) {
                setFeedbackData(feedbackRes.data.data);
                setSummary(feedbackRes.data.summary);
                setTrendData(feedbackRes.data.trendData);
            }

            if (Array.isArray(servicesRes.data)) {
                setAllServicesList(servicesRes.data);
            }
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeedback();
    }, []);

    // Reset to first page when filters change
    useEffect(() => {
        setPage(0);
    }, [search, serviceFilter, ratingFilter, statusFilter]);

    // Extract Unique Services for Filter
    const uniqueServices = useMemo(() => {
        if (!allServicesList.length) return ["All Services"];

        let services = allServicesList;
        
        // Filter for regular Admins
        if (!isSA && user?.roles) {
            const adminServiceIds = user.roles
                .filter(r => r.role === "ADMIN" && r.service)
                .map(r => r.service._id || r.service); // In case it's populated or just ID
            
            services = services.filter(s => adminServiceIds.includes(s._id));
        }

        const serviceNames = services.map(s => s.name).filter(Boolean);
        return ["All Services", ...new Set(serviceNames)];
    }, [allServicesList, isSA, user]);

    const filteredRows = useMemo(() => {
        return feedbackData.filter(f => {
            const matchesSearch = !search || 
                f.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
                f.ticket?.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
                f.ticket?.title?.toLowerCase().includes(search.toLowerCase());
            
            const matchesService = serviceFilter === "All Services" || f.ticket?.service?.name === serviceFilter;
            const matchesRating = ratingFilter === "All Ratings" || Number(f.rating) === Number(ratingFilter);
            const matchesStatus = statusFilter === "All Status" || f.satisfaction === statusFilter;

            return matchesSearch && matchesService && matchesRating && matchesStatus;
        });
    }, [feedbackData, search, serviceFilter, ratingFilter, statusFilter]);

    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "User,Service,Ticket,Rating,Satisfaction,Comments,Date\n"
            + filteredRows.map(r => `"${r.user?.name}","${r.ticket?.service?.name}","${r.ticket?.ticketNumber}","${r.rating}","${r.satisfaction}","${r.comments.replace(/"/g, '""')}","${new Date(r.createdAt).toLocaleDateString()}"`).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "feedback_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const satisfactionRate = useMemo(() => {
        if (!feedbackData.length) return 0;
        const positive = feedbackData.filter(f => ["Satisfied", "Very Satisfied"].includes(f.satisfaction)).length;
        return Math.round((positive / feedbackData.length) * 100);
    }, [feedbackData]);

    const responseQuality = useMemo(() => {
        const avg = Number(summary?.averageRating || 0);
        if (avg >= 4.5) return { label: "Excellent", color: "#22c55e" };
        if (avg >= 4) return { label: "Good", color: "#34d399" };
        if (avg >= 3) return { label: "Average", color: "#fbbf24" };
        return { label: "Poor", color: "#ef4444" };
    }, [summary]);

    const satisfactionColors = {
        "Very Satisfied": "#22c55e",
        "Satisfied": "#84cc16",
        "Neutral": "#eab308",
        "Dissatisfied": "#f97316",
        "Very Dissatisfied": "#ef4444"
    };

    const satisfactionData = summary?.satisfactionDistribution ? 
        Object.entries(summary.satisfactionDistribution).map(([name, value]) => ({
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
                {hasHalfStar && <Star size={14} fill="url(#halfGradOverview)" color="#f5a623" />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} size={14} color="#bdc3c7" />)}
                <svg width="0" height="0" style={{ position: 'absolute' }}>
                    <defs>
                        <linearGradient id="halfGradOverview">
                            <stop offset="50%" stopColor="#f5a623" />
                            <stop offset="50%" stopColor="transparent" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                </svg>
            </div>
        );
    };

    const columns = [
        {
            field: 'user',
            headerName: 'User',
            flex: 1.5,
            minWidth: 200,
            renderCell: (params) => {
                const user = params.row.user;
                if (!user) return "Unknown";
                return (
                    <Box display="flex" alignItems="center" gap={1.5} width="100%" textAlign="left">
                        <Avatar 
                            src={user.profileImage ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${user.profileImage}` : ""}
                            sx={{ width: 32, height: 32, bgcolor: 'var(--primary-color)', fontSize: '14px' }}
                        >
                            {user.name?.[0]}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500, color: 'var(--text-color)' }}>
                            {user.name}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: 'service_ticket',
            headerName: 'Service / Ticket',
            flex: 2,
            minWidth: 250,
            renderCell: (params) => {
                const ticket = params.row.ticket;
                if (!ticket) return "N/A";
                return (
                    <Box width="100%" textAlign="left">
                        <Typography variant="body2" sx={{ color: 'var(--primary-color)', fontWeight: 600 }}>
                            {ticket.service?.name} - 
                            <Link to={`/ticketdetails/${ticket._id}`} style={{ textDecoration: 'none', color: 'inherit', marginLeft: '4px' }}>
                                #{ticket.ticketNumber}
                            </Link>
                        </Typography>
                        <Typography variant="caption" sx={{ display: 'block', mt: -0.5, color: 'var(--secondary-color)' }}>
                            {ticket.title}
                        </Typography>
                    </Box>
                );
            }
        },
        {
            field: 'rating',
            headerName: 'Rating',
            width: 120,
            renderCell: (params) => (
                <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                    <Typography sx={{ fontWeight: 800, color: '#f5a623', fontSize: '0.95rem' }}>
                        {Number(params.row.rating).toFixed(1)}
                    </Typography>
                    <Star size={12} fill="#f5a623" color="#f5a623" />
                </Box>
            )
        },
        {
            field: 'satisfaction',
            headerName: 'Satisfaction',
            width: 160,
            renderCell: (params) => (
                <span className={`badge rounded-pill ${getSatisfactionColor(params.row.satisfaction)}`} style={{ fontSize: '11px', padding: '6px 12px' }}>
                    {params.row.satisfaction}
                </span>
            )
        },
        {
            field: 'comments',
            headerName: 'Comments',
            flex: 3,
            minWidth: 300,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ whiteSpace: 'normal', wordBreak: 'break-word', color: 'var(--text-color)', opacity: 0.8, textAlign: 'left', width: '100%', py: 1 }}>
                    {params.row.comments || "No comments provided."}
                </Typography>
            )
        },
        {
            field: 'createdAt',
            headerName: 'Submitted On',
            width: 180,
            renderCell: (params) => (
                <Typography variant="caption" sx={{ color: 'var(--secondary-color)' }}>
                    {new Date(params.row.createdAt).toLocaleString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                    })}
                </Typography>
            )
        }
    ];

    if (loading) return <Loader />;

    return (
        <div className="container-fluid p-4" style={{ backgroundColor: "var(--bg-color)", minHeight: "100vh" }}>
            <Box mb={4}>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'var(--text-color)', mb: 1 }}>
                    Feedback Overview
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--secondary-color)' }}>
                    Analyze user satisfaction and service quality trends.
                </Typography>
            </Box>

            {/* KPI Section */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-md-3">
                    <StatCard 
                        title="Average Rating" 
                        value={summary?.averageRating || "0.0"} 
                        icon={Star} 
                        trend="8%" 
                        subtitle="Out of 5" 
                        color="#f5a623"
                        bgIcon={Star}
                    />
                </div>
                <div className="col-12 col-md-3">
                    <StatCard 
                        title="Satisfaction Rate" 
                        value={`${satisfactionRate}%`} 
                        icon={Smile} 
                        trend="12%" 
                        progress={satisfactionRate}
                        color="#22c55e"
                        bgIcon={Smile}
                    />
                </div>
                <div className="col-12 col-md-3">
                    <StatCard 
                        title="Total Feedback" 
                        value={summary?.totalFeedback || 0} 
                        icon={MessageSquare} 
                        trend="15%" 
                        color="#3b82f6"
                        bgIcon={MessageSquare}
                    />
                </div>
                <div className="col-12 col-md-3">
                    <StatCard 
                        title="Response Quality" 
                        value={responseQuality.label} 
                        icon={ShieldCheck} 
                        subtitle="Maintain the good work!" 
                        color={responseQuality.color}
                        bgIcon={ShieldCheck}
                    />
                </div>
            </div>

            {/* Visual Insights Section (Moved between KPIs and Filters) */}
            <div className="row g-4 mb-4">
                <div className="col-12 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h6 className="fw-bold mb-4">Rating Distribution</h6>
                        <div className="d-flex flex-column gap-3 justify-content-center" style={{ minHeight: "250px" }}>
                            {[5, 4, 3, 2, 1].map(rating => {
                                const count = summary?.ratingDistribution?.[rating] || 0;
                                const percentage = summary?.totalFeedback > 0 ? ((count / summary.totalFeedback) * 100).toFixed(1) : 0;
                                return (
                                    <div key={rating} className="d-flex align-items-center gap-3">
                                        <div className="small fw-bold" style={{ minWidth: "45px", color: "var(--text-color)" }}>{rating} Star</div>
                                        <div className="flex-grow-1 rounded-pill overflow-hidden" style={{ height: "8px", backgroundColor: "var(--border-color)" }}>
                                            <div className="h-100 rounded-pill transition-all" style={{ width: `${percentage}%`, backgroundColor: rating >= 4 ? "#22c55e" : rating === 3 ? "#eab308" : "#ef4444", transition: "width 1s ease-in-out" }} />
                                        </div>
                                        <div className="small" style={{ minWidth: "65px", color: "var(--secondary-color)" }}>{count} ({percentage}%)</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h6 className="fw-bold mb-4">Satisfaction Level</h6>
                        <div style={{ height: "250px", width: "100%", position: "relative" }}>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={satisfactionData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                                        {satisfactionData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)', color: 'var(--text-color)' }} />
                                    <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" wrapperStyle={{ fontSize: "12px", color: "var(--text-color)" }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
                <div className="col-12 col-md-6 col-xl-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: "var(--card-bg)" }}>
                        <h6 className="fw-bold mb-4">Feedback Trend (Local)</h6>
                        <div style={{ height: "250px", width: "100%", position: "relative" }}>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorFeedbackOverview" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: "var(--secondary-color)"}} tickLine={false} axisLine={false} minTickGap={20} />
                                    <YAxis tick={{fontSize: 10, fill: "var(--secondary-color)"}} tickLine={false} axisLine={false} />
                                    <Tooltip content={({ active, payload, label }) => {
                                        if (active && payload && payload.length) {
                                            return (
                                                <div className="p-2 border rounded shadow-sm" style={{ fontSize: "11px", backgroundColor: "var(--card-bg)", color: "var(--text-color)", borderColor: "var(--border-color)" }}>
                                                    <p className="mb-1 fw-bold">{label}</p>
                                                    <p className="mb-0 text-primary">Feedback: {payload[0].value}</p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }} />
                                    <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFeedbackOverview)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="card shadow-sm border-0 rounded-4 p-3 mb-4" style={{ backgroundColor: "var(--card-bg)" }}>
                <div className="row g-3 align-items-center">
                    <div className="col-12 col-lg-4">
                        <TextField
                            fullWidth
                            placeholder="Search by user, service or ticket..."
                            variant="outlined"
                            size="small"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search size={18} color="var(--secondary-color)" />
                                    </InputAdornment>
                                ),
                                sx: { borderRadius: '12px', bgcolor: 'var(--bg-color)', border: 'none' }
                            }}
                        />
                    </div>
                    <div className="col-6 col-lg-2">
                        <FormControl fullWidth size="small">
                            <Select
                                value={serviceFilter}
                                onChange={(e) => setServiceFilter(e.target.value)}
                                sx={{ borderRadius: '12px', bgcolor: 'var(--bg-color)' }}
                                displayEmpty
                                IconComponent={() => <ChevronDown size={18} color="var(--text-color)" style={{ marginRight: '8px' }} />}
                            >
                                {uniqueServices.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="col-6 col-lg-2">
                        <FormControl fullWidth size="small">
                            <Select
                                value={ratingFilter}
                                onChange={(e) => setRatingFilter(e.target.value)}
                                sx={{ borderRadius: '12px', bgcolor: 'var(--bg-color)' }}
                                IconComponent={() => <ChevronDown size={18} color="var(--text-color)" style={{ marginRight: '8px' }} />}
                            >
                                <MenuItem value="All Ratings">All Ratings</MenuItem>
                                {[5, 4, 3, 2, 1].map(r => <MenuItem key={r} value={r}>{r} Stars</MenuItem>)}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="col-6 col-lg-2">
                        <FormControl fullWidth size="small">
                            <Select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                sx={{ borderRadius: '12px', bgcolor: 'var(--bg-color)' }}
                                IconComponent={() => <ChevronDown size={18} color="var(--text-color)" style={{ marginRight: '8px' }} />}
                            >
                                <MenuItem value="All Status">All Status</MenuItem>
                                {Object.keys(satisfactionColors).map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </div>
                    <div className="col-6 col-lg-2 d-flex justify-content-end">
                        <button 
                            className="btn btn-outline-primary w-100 d-flex align-items-center justify-content-center gap-2" 
                            style={{ borderRadius: '12px', height: '40px' }}
                            onClick={handleExport}
                        >
                            <Download size={18} />
                            Export
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback List Section (Card Based) */}
            <Box mb={5}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <Typography variant="h6" sx={{ fontWeight: 600, color: 'var(--text-color)' }}>
                        Detailed History
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'var(--secondary-color)' }}>
                        Showing {filteredRows.length} results
                    </Typography>
                </div>

                {filteredRows.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                        {filteredRows.slice((page * rowsPerPage), (page + 1) * rowsPerPage).map((feedback) => (
                            <div key={feedback._id} className="card border-0 shadow-sm rounded-4 overflow-hidden" 
                                 style={{ backgroundColor: "var(--card-bg)", transition: 'all 0.3s ease' }}>
                                <div className="p-4">
                                    <div className="row align-items-center g-4">
                                        {/* User Info */}
                                        <div className="col-12 col-lg-3">
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar 
                                                    src={feedback.user?.profileImage ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${feedback.user.profileImage}` : ""}
                                                    sx={{ width: 52, height: 52, bgcolor: 'var(--primary-color)', fontSize: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
                                                >
                                                    {feedback.user?.name?.[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--text-color)', lineHeight: 1.2 }}>
                                                        {feedback.user?.name}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: 'var(--primary-color)', fontWeight: 700, mt: 0.5, letterSpacing: 0.5 }}>
                                                        #{feedback.ticket?.ticketNumber}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'var(--secondary-color)', display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, fontWeight: 500 }}>
                                                        <TrendingUp size={12} style={{ opacity: 0.7 }} />
                                                        {new Date(feedback.createdAt).toLocaleString('en-IN', {
                                                            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                                                        })}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </div>

                                        {/* Content (Summary) */}
                                        <div className="col-12 col-lg-5">
                                            <Box>
                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'var(--text-color)', mb: 1, fontSize: '1rem' }}>
                                                    {feedback.ticket?.service?.name} - {feedback.ticket?.title}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'var(--text-color)', opacity: 0.8, fontStyle: 'italic', mb: 2, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                    "{feedback.comments || "No comments provided."}"
                                                </Typography>
                                                <span className="badge" style={{ backgroundColor: 'var(--bg-color)', color: 'var(--primary-color)', border: '1px solid var(--border-color)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, padding: '4px 10px' }}>
                                                    {feedback.ticket?.service?.name}
                                                </span>
                                            </Box>
                                        </div>

                                        {/* Rating & Status */}
                                        <div className="col-12 col-lg-3">
                                            <Box display="flex" flexDirection="column" gap={1.5}>
                                                <Box display="flex" alignItems="center" gap={2}>
                                                    <Typography sx={{ fontWeight: 800, color: 'var(--text-color)', fontSize: '1.25rem' }}>
                                                        {Number(feedback.rating).toFixed(1)} <small style={{ fontWeight: 500, opacity: 0.5, fontSize: '0.85rem' }}>/ 5</small>
                                                    </Typography>
                                                    <div className="d-flex gap-1">
                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                            <Star 
                                                                key={star} 
                                                                size={16} 
                                                                fill={star <= feedback.rating ? "#f5a623" : "transparent"} 
                                                                color={star <= feedback.rating ? "#f5a623" : "var(--border-color)"} 
                                                            />
                                                        ))}
                                                    </div>
                                                </Box>
                                                <div>
                                                    <span className={`badge rounded-pill ${getSatisfactionColor(feedback.satisfaction)}`} style={{ fontSize: '11px', padding: '8px 18px', fontWeight: 600 }}>
                                                        {feedback.satisfaction}
                                                    </span>
                                                </div>
                                            </Box>
                                        </div>

                                        {/* Action */}
                                        <div className="col-12 col-lg-1 text-end">
                                            <IconButton 
                                                size="small" 
                                                onClick={() => setExpandedId(expandedId === feedback._id ? null : feedback._id)}
                                                sx={{ 
                                                    color: 'var(--text-color)', 
                                                    transition: 'transform 0.3s ease',
                                                    transform: expandedId === feedback._id ? 'rotate(180deg)' : 'none',
                                                    bgcolor: 'var(--bg-color)',
                                                    '&:hover': { bgcolor: 'var(--sidebar-hover)' }
                                                }}
                                            >
                                                <ChevronDown size={22} strokeWidth={2.5} />
                                            </IconButton>
                                        </div>
                                    </div>
                                </div>

                                {/* Expandable Details Section */}
                                <Collapse in={expandedId === feedback._id} timeout="auto" unmountOnExit>
                                    <Divider sx={{ borderColor: 'var(--border-color)', opacity: 0.5 }} />
                                    <Box sx={{ p: 4, bgcolor: 'rgba(0,0,0,0.02)' }}>
                                        <div className="row g-5">
                                            <div className="col-12">
                                                <DetailBox 
                                                    title="User Comments" 
                                                    content={feedback.comments} 
                                                    icon={MessageSquare} 
                                                />
                                            </div>
                                        </div>

                                        <Box 
                                            mt={5} 
                                            pt={4} 
                                            sx={{ 
                                                borderTop: '1px dashed var(--border-color)',
                                                display: 'grid',
                                                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
                                                gap: 3
                                            }}
                                        >
                                            <MetaItem label="Category" value={feedback.ticket?.service?.name} badge />
                                            <MetaItem label="Sub Category" value={feedback.ticket?.title} />
                                            <MetaItem 
                                                label="Technician" 
                                                value={feedback.ticket?.assignedTo?.find(a => a.status === "RESOLVED")?.user?.name || "Unassigned"} 
                                                icon={User} 
                                            />
                                            <MetaItem label="Status" value={feedback.ticket?.status || "CLOSED"} icon={CheckCircle} />
                                            <MetaItem 
                                                label="Date Completed" 
                                                value={new Date(feedback.ticket?.updatedAt || feedback.createdAt).toLocaleString('en-IN', {
                                                    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
                                                })} 
                                                icon={Calendar} 
                                            />
                                        </Box>
                                    </Box>
                                </Collapse>
                            </div>
                        ))}
                    </div>
                ) : (
                    <Box sx={{ py: 8, bgcolor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <NoData Data="Feedback" />
                    </Box>
                )}

                {/* Custom Pagination */}
                <Box mt={4} display="flex" justifyContent="flex-end" alignItems="center" gap={3}>
                    <Box display="flex" alignItems="center" gap={1.5}>
                        <Typography variant="caption" sx={{ color: 'var(--secondary-color)', fontWeight: 500 }}>
                            Rows per page:
                        </Typography>
                        <Select 
                            value={rowsPerPage} 
                            onChange={(e) => setRowsPerPage(e.target.value)}
                            size="small"
                            variant="outlined"
                            sx={{ 
                                height: '32px',
                                fontSize: '12px', 
                                color: 'var(--text-color)',
                                fontWeight: 600,
                                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                                '& .MuiSelect-select': { py: 0.5, pl: 1, pr: '28px !important' },
                                bgcolor: 'transparent',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'var(--sidebar-hover)' }
                            }}
                            IconComponent={() => <ChevronDown size={14} color="var(--secondary-color)" style={{ position: 'absolute', right: '8px', pointerEvents: 'none' }} />}
                        >
                            {[5, 10, 25, 50].map(v => <MenuItem key={v} value={v}>{v}</MenuItem>)}
                        </Select>
                    </Box>
                    <Typography variant="caption" sx={{ color: 'var(--secondary-color)', fontWeight: 500 }}>
                        {(page * rowsPerPage) + 1}-{Math.min((page + 1) * rowsPerPage, filteredRows.length)} of {filteredRows.length}
                    </Typography>
                    <Box display="flex" gap={1.5}>
                        <IconButton 
                            size="small" 
                            disabled={page === 0} 
                            onClick={() => setPage(p => p - 1)}
                            sx={{ 
                                color: 'var(--text-color)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'var(--sidebar-hover)' },
                                '&.Mui-disabled': { opacity: 0.3 }
                            }}
                        >
                            <ChevronDown size={16} style={{ transform: 'rotate(90deg)' }} />
                        </IconButton>
                        <IconButton 
                            size="small" 
                            disabled={(page + 1) * rowsPerPage >= filteredRows.length} 
                            onClick={() => setPage(p => p + 1)}
                            sx={{ 
                                color: 'var(--text-color)', 
                                border: '1px solid var(--border-color)', 
                                borderRadius: '8px',
                                transition: 'all 0.2s',
                                '&:hover': { bgcolor: 'var(--sidebar-hover)' },
                                '&.Mui-disabled': { opacity: 0.3 }
                            }}
                        >
                            <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </div>
    );
};

export default FeedbackOverview;
