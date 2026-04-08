import React from "react";
import { Users, CheckCircle, AlertCircle, Clock, Mail, Phone, Trash2, ChevronLeft, History, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from '../../api/axios'
import { useState, useEffect } from "react";

function TeamMembers() {
    const navigate = useNavigate();


    const [showModal, setShowModal] = React.useState(false);
    const [searchText, setSearchText] = React.useState("");
    const [searchResults, setSearchResults] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [notFound, setNotFound] = useState(false)
    const [summary, setSummary] = useState(null);
    const [developerData, setDeveloperData] = useState([]);
    const [serviceName, setServiceName] = useState("");
    
    // Detailed Member View State
    const [selectedMember, setSelectedMember] = useState(null);
    const [memberTickets, setMemberTickets] = useState([]);
    const [loadingTickets, setLoadingTickets] = useState(false);
    const [showAllTickets, setShowAllTickets] = useState(false);
    useEffect(() => {
        fetchDashboard();

    }, []);

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const { data } = await API.get("/api/team/dashboard");
            //console.log("Dashboard Data:", data);
            setSummary(data.summary);
            setDeveloperData(data.members);
            if (data.serviceName) setServiceName(data.serviceName);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };


    const handleRemoveMember = async (userId) => {
        if (!window.confirm("Are you sure you want to remove this member?")) return;
        try {
            await API.delete(`/api/team/remove-member/${userId}`);
            fetchDashboard(); // refresh team list
        } catch (err) {
            alert(err.response?.data?.message || "Remove failed");
        }
    };

    const handleSearch = async () => {
        if (!searchText.trim()) return;

        try {
            setLoading(true);
            setNotFound(false);

            const { data } = await API.get(
                `/api/auth/search?query=${searchText}`
            );

            console.log("Search Response:", data);

            const users = Array.isArray(data)
                ? data
                : data.users || [];

            if (users.length === 0) {
                setSearchResults([]);
                setNotFound(true);
            } else {
                setSearchResults(users);
            }

        } catch (err) {
            setSearchResults([]);
            setNotFound(true);
        } finally {
            setLoading(false);
        }
    };

    const handleAddMember = async (user) => {
        try {

            const { data } = await API.post("/api/team/add-member", {
                userId: user._id
            });

            alert(data.message);
            setShowModal(false);
            setSearchResults([]);
            setSearchText("");

            await fetchDashboard(); // refresh team list

        } catch (err) {
            alert(err.response?.data?.message || "Add failed");
        }
    };

    const handleMemberClick = async (member) => {
        setSelectedMember(member);
        setLoadingTickets(true);
        setShowAllTickets(false);
        try {
            const { data } = await API.get("/api/complaints/dept-all");
            const assignedTickets = data.filter(ticket =>
                ticket.assignedTo && ticket.assignedTo.some(a => a.user && a.user.toString() === member._id.toString())
            );
            setMemberTickets(assignedTickets);
        } catch (error) {
            console.error("Error fetching member tickets:", error);
        } finally {
            setLoadingTickets(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    if (selectedMember) {
        const initials = selectedMember.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .toUpperCase();

        const displayedTickets = showAllTickets ? memberTickets : memberTickets.slice(0, 5);

        return (
            <div className="px-2 py-3 px-md-4 py-md-4 pb-5" style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>
                {/* Back Button */}
                <button 
                    className="btn btn-light mb-4 d-flex align-items-center gap-2"
                    onClick={() => setSelectedMember(null)}
                >
                    <ChevronLeft size={20} /> Back to Team
                </button>

                {/* Profile Header */}
                <div className="card border-0 rounded-4 p-4 shadow-sm mb-4">
                    <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-4">
                        <div className="d-flex align-items-center gap-4">
                            <div style={{ position: "relative", width: "90px", height: "90px" }}>
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold fs-3"
                                    style={{ width: "100%", height: "100%", backgroundColor: "var(--primary-color)", position: "absolute", top: 0, left: 0, zIndex: 1 }}
                                >
                                    {initials}
                                </div>
                                <img
                                    src={selectedMember.profileImage ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${selectedMember.profileImage}` : `https://info.aec.edu.in/aec/employeephotos/${selectedMember.empId}.jpg`}
                                    alt={selectedMember.name}
                                    className="rounded-circle bg-white"
                                    style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 2 }}
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                            <div>
                                <h3 className="fw-bold mb-1" style={{ color: 'var(--text-color)' }}>{selectedMember.name}</h3>
                                <p className="text-muted mb-3 fs-6">Emp ID: {selectedMember.empId}</p>
                                <div className="d-flex flex-column gap-2 text-muted">
                                    <span className="d-flex align-items-center gap-2"><Mail size={16} /> {selectedMember.email}</span>
                                    <span className="d-flex align-items-center gap-2"><Phone size={16} /> {selectedMember.phone || "N/A"}</span>
                                </div>
                            </div>
                        </div>
                        <div className="d-flex flex-column align-items-end gap-3">
                            <span
                                className="badge rounded-pill px-4 py-2 fs-6"
                                style={{
                                    backgroundColor: selectedMember.status === "available" ? "rgba(47, 158, 68, 0.15)" : "rgba(201, 42, 42, 0.15)",
                                    color: selectedMember.status === "available" ? "#2f9e44" : "#e03131"
                                }}
                            >
                                {selectedMember.status}
                            </span>
                            <button 
                                className="btn btn-outline-danger d-flex align-items-center justify-content-center"
                                style={{ width: '36px', height: '36px', padding: 0 }}
                                title="Delete User"
                                onClick={() => {
                                    handleRemoveMember(selectedMember._id);
                                    setSelectedMember(null);
                                }}
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="row g-3 mb-4">
                    <div className="col-12 col-md-6">
                        <div className="card border p-4 rounded-4" style={{ backgroundColor: "var(--stat-card-bg)" }}>
                            <div className="d-flex align-items-center gap-2 text-dark mb-3">
                                <FileText size={20} className="text-success" />
                                <span className="fw-medium fs-5">Active Tickets</span>
                            </div>
                            <h2 className="fw-bold mb-0" style={{ color: 'var(--text-color)' }}>{selectedMember.activeTickets}</h2>
                        </div>
                    </div>
                    <div className="col-12 col-md-6">
                        <div className="card border p-4 rounded-4" style={{ backgroundColor: "var(--stat-card-bg)" }}>
                            <div className="d-flex align-items-center gap-2 text-dark mb-3">
                                <CheckCircle size={20} className="text-success" />
                                <span className="fw-medium fs-5">Completed Tickets</span>
                            </div>
                            <h2 className="fw-bold text-success mb-0">{selectedMember.completed}</h2>
                        </div>
                    </div>
                </div>

                {/* Recent Tickets */}
                <div className="card border rounded-4 shadow-sm overflow-hidden">
                    <div className="p-4 border-bottom bg-white">
                        <h5 className="fw-bold mb-0" style={{ color: 'var(--text-color)' }}>Ticket History</h5>
                    </div>

                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light text-muted">
                                <tr>
                                    <th className="fw-medium py-3 px-4">Ticket ID</th>
                                    <th className="fw-medium py-3">Subject</th>
                                    <th className="fw-medium py-3">Status</th>
                                    <th className="fw-medium py-3">Created</th>
                                    <th className="fw-medium py-3">Completed</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingTickets ? (
                                    <tr><td colSpan="5" className="text-center py-4">Loading tickets...</td></tr>
                                ) : displayedTickets.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted">No tickets found for this member.</td></tr>
                                ) : (
                                    displayedTickets.map(ticket => {
                                        const myAssignment = ticket.assignedTo?.find(a => a.user && a.user.toString() === selectedMember._id.toString());
                                        const status = myAssignment?.status || ticket.status;
                                        
                                        return (
                                            <tr key={ticket._id}>
                                                <td className="fw-bold px-4">{ticket.ticketNumber}</td>
                                                <td>{ticket.title}</td>
                                                <td>
                                                    <span className="badge" style={{
                                                        backgroundColor: status === 'RESOLVED' ? '#20c997' : status === 'ASSIGNED' ? '#0d6efd' : '#ffc107',
                                                        color: '#fff',
                                                        padding: '6px 12px',
                                                        borderRadius: '20px'
                                                    }}>
                                                        {status === 'RESOLVED' ? '✓ Completed' : status === 'IN_PROGRESS' ? 'In Progress' : status}
                                                    </span>
                                                </td>
                                                <td className="text-muted">{formatDate(ticket.createdAt)}</td>
                                                <td className="text-muted text-nowrap">{status === 'RESOLVED' && myAssignment?.updatedAt ? formatDate(myAssignment.updatedAt) : '-'}</td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    
                    {!showAllTickets && memberTickets.length > 5 && (
                        <div className="p-3 border-top bg-white d-flex justify-content-center align-items-center">
                            <button 
                                className="btn px-5 py-2 fw-bold" 
                                style={{ backgroundColor: '#20c997', color: 'white', borderRadius: '25px' }}
                                onClick={() => setShowAllTickets(true)}
                            >
                                View More
                            </button>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="px-2 py-3 px-md-4 py-md-4" style={{ minHeight: "100vh", backgroundColor: "var(--bg-color)" }}>

            <div className="d-flex justify-content-between align-items-center mb-4 gap-2">
                <div className="flex-grow-1">
                    <h2 className="fw-bold mb-1" style={{ fontSize: "1.75rem" }}>Service Members</h2>
                    <p className="text-secondary mb-0" style={{ fontSize: "0.95rem" }}>
                        {serviceName ? `${serviceName} Service Team` : "Service Team"} - View member profiles and workload
                    </p>
                </div>

                <button
                    className="btn btn-primary-custom shadow-sm fw-medium d-flex align-items-center justify-content-center text-white"
                    style={{ 
                        transition: "0.3s",
                        width: "48px", // Mobile: Round (width=height)
                        height: "48px",
                        borderRadius: "50%",
                        backgroundColor: "var(--primary-color)",
                        padding: "0"
                    }}
                    onClick={() => setShowModal(true)}
                    onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                    onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                >
                    {/* Desktop Text */}
                    <span className="d-none d-md-inline me-md-2 ps-md-4 pe-md-1">+ Add Team Member</span>
                    {/* Icon - Using Users icon as a fallback if UserPlus is not needed or just keep it simple */}
                    <span className="d-flex align-items-center justify-content-center pe-md-4 text-center">
                        <Users size={20} />
                    </span>

                    {/* Desktop Style Override - Consistent with Dashboard/Tickets */}
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media (min-width: 768px) {
                            .btn-primary-custom { 
                                width: auto !important; 
                                height: auto !important; 
                                border-radius: 50px !important; 
                                padding: 0.6rem 1.5rem !important;
                            }
                        }
                    `}} />
                </button>
            </div>

            <div className="row g-3">

                {/* Total Members */}
                <div className="col-12 col-md-3">
                    <div className="card border-0 shadow-sm p-4 rounded-4">
                        <div className="d-flex align-items-center gap-2 text-primary mb-2">
                            <Users size={18} />
                            <span className="fw-medium">Total Members</span>
                        </div>
                        <h3 className="fw-bold m-0">{summary?.totalMembers || 0}</h3>
                    </div>
                </div>

                {/* Available */}
                <div className="col-12 col-md-3">
                    <div
                        className="card border p-4 rounded-4"
                        style={{
                            backgroundColor: "var(--stat-card-bg)",
                            borderColor: "var(--border-color)"
                        }}
                    >
                        <div className="d-flex align-items-center gap-2 text-success mb-2">
                            <CheckCircle size={18} />
                            <span className="fw-medium">Available</span>
                        </div>
                        <h3 className="fw-bold text-success m-0">{summary?.totalAvailable || 0}</h3>
                    </div>
                </div>

                {/* Busy */}
                <div className="col-12 col-md-3">
                    <div
                        className="card border p-4 rounded-4"
                        style={{
                            backgroundColor: "var(--stat-card-bg)",
                            borderColor: "var(--border-color)"
                        }}
                    >
                        <div className="d-flex align-items-center gap-2 text-warning mb-2">
                            <AlertCircle size={18} />
                            <span className="fw-medium">Busy</span>
                        </div>
                        <h3 className="fw-bold text-warning m-0">{summary?.totalBusy || 0}</h3>
                    </div>
                </div>

                {/* Active Tickets */}
                <div className="col-12 col-md-3">
                    <div
                        className="card border p-4 rounded-4"
                        style={{
                            backgroundColor: "var(--stat-card-bg)",
                            borderColor: "var(--border-color)"
                        }}
                    >
                        <div className="d-flex align-items-center gap-2 text-primary mb-2">
                            <Clock size={18} />
                            <span className="fw-medium">Active Tickets</span>
                        </div>
                        <h3 className="fw-bold text-primary m-0">{summary?.totalActiveTickets || 0}</h3>
                    </div>
                </div>

            </div>



            {/*---------------------------------- Devlopers card -------------------------------------------*/}
            <div className="row g-4 mt-4">
                {developerData.map((dev, index) => {

                    const initials = dev.name
                        .split(" ")
                        .map(word => word[0])
                        .join("")
                        .toUpperCase();

                    return (
                        <div className="col-12 col-md-6 col-lg-4" key={dev._id}>
                            <div 
                                className="card p-4 shadow-sm border-0 rounded-4 h-100" 
                                style={{cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s'}}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-5px)';
                                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 .125rem .25rem rgba(0,0,0,.075)';
                                }}
                                onClick={() => handleMemberClick(dev)}
                            >

                                {/* Header */}
                                <div className="d-flex justify-content-between align-items-start">
                                    <div className="d-flex align-items-center gap-3">
                                        <div style={{ position: "relative", width: "55px", height: "55px" }}>
                                            <div
                                                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                                                style={{ width: "100%", height: "100%", backgroundColor: "var(--primary-color)", position: "absolute", top: 0, left: 0, zIndex: 1 }}
                                            >
                                                {initials}
                                            </div>
                                            <img
                                                src={dev.profileImage ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${dev.profileImage}` : `https://info.aec.edu.in/aec/employeephotos/${dev.empId}.jpg`}
                                                alt={dev.name}
                                                className="rounded-circle"
                                                style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", top: 0, left: 0, zIndex: 2 }}
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        </div>

                                        <div>
                                            <h6 className="fw-bold mb-0">{dev.name}</h6>
                                            <small className="text-muted">Emp ID: {dev.empId}</small>
                                        </div>
                                    </div>

                                    <span
                                        className="badge rounded-pill px-3 py-2"
                                        style={{
                                            backgroundColor:
                                                dev.status === "available" ? "rgba(47, 158, 68, 0.15)" : "rgba(201, 42, 42, 0.15)",
                                            color:
                                                dev.status === "available" ? "#2f9e44" : "#e03131"
                                        }}
                                    >
                                        {dev.status}
                                    </span>
                                </div>

                                {/* Contact */}
                                <div className="mt-3 text-muted small">
                                    <div className="d-flex align-items-center gap-2 mb-1">
                                        <Mail size={14} />
                                        {dev.email}
                                    </div>
                                    <div className="d-flex align-items-center gap-2">
                                        <Phone size={14} />
                                        {dev.phone}
                                    </div>
                                </div>

                                <hr />

                                {/* Tickets */}
                                <div className="d-flex justify-content-between">
                                    <div className="text-center">
                                        <small className="text-muted">Active Tickets</small>
                                        <h5 className="fw-bold mb-0">{dev.activeTickets}</h5>
                                    </div>
                                    <div className="text-center">
                                        <small className="text-muted">Completed</small>
                                        <h5 className="fw-bold text-success mb-0">
                                            {dev.completed}
                                        </h5>
                                    </div>
                                </div>





                            </div>
                        </div>
                    );
                })}
            </div>


            {showModal && (
                <div className="modal-overlay-emp">
                    <div className="modal-content-emp p-4 rounded-4 shadow">

                        <div className="d-flex justify-content-between mb-3">
                            <h5 className="fw-bold">Add Team Member</h5>
                            <button
                                className="btn btn-sm btn-light"
                                onClick={() => setShowModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="d-flex gap-2 mb-3">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by Name or Emp ID"
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                            />

                            <button
                                className="btn btn-primary"
                                onClick={handleSearch}
                            >
                                Search
                            </button>
                        </div>

                        {loading && <p>Searching...</p>}

                        {searchResults.map((dev, index) => (
                            <div key={index} className="border rounded-3 p-3 mb-2">

                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{dev.name}</strong>
                                        <div className="text-muted small">
                                            Emp ID: {dev.institutionId}
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-success btn-sm"
                                        onClick={() => handleAddMember(dev)}
                                    >
                                        Add
                                    </button>
                                </div>

                            </div>
                        ))}

                        {notFound && !loading && (
                            <div className="text-center mt-3">

                                <p className="text-danger mb-2">
                                    User not found in system
                                </p>

                                <button
                                    className="btn btn-outline-primary"
                                    onClick={() => {
                                        setShowModal(false);
                                        navigate("/super/add-user");
                                    }}
                                >
                                    + Create New User
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </div>
    );
}

export default TeamMembers;



