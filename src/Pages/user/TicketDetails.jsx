import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaClock, FaUser, FaTimesCircle, FaPaperPlane, FaRocket, FaTelegramPlane } from "react-icons/fa";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileVideo, FaFileArchive } from "react-icons/fa";




import API from '../../api/axios'
import Loader from '../../Components/Loader'
import { useSocket } from '../../context/SocketContext';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const fetchTicketDetails = async () => {
    try {
      setLoading(true);

      const res = await API.get(`/api/complaints/${id}`);

      const data = res.data.data;

      setTicket(data.ticket);
      setComments(data.comments);
      setActivities(data.activities);

      console.log('tickts', ticket)
      console.log('Comments', comments)
      console.log('activities', activities)

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {

    fetchTicketDetails()

  }, [id])

  useEffect(() => {
    if (!socket || !id) return;

    socket.emit("join_ticket", id);

    const handleNewMessage = (msg) => {
      setComments((prev) => {
        // Prevent duplicate comments if user receives socket event + API response
        if (prev.some(c => c._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_ticket", id);
    };
  }, [socket, id]);
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      await API.post(`/api/complaints/${id}/comments`, {
        message: newComment,
      });

      setNewComment("");

      // We no longer need to fetchTicketDetails() here because 
      // the new comment will be broadcast via Socket.IO and appended immediately.


    } catch (error) {
      console.error(error);
    }
  };




  const formatAction = (activity) => {
    switch (activity.action) {
      case "TICKET_CREATED":
        return "Ticket Created";
      case "ASSIGNED":
        return "Assigned";
      case "STATUS_CHANGED":
        return `Status changed`;
      default:
        return activity.action;
    }
  };

  const getDotColor = (action) => {
    if (action === "TICKET_CREATED") return "#0b5299";
    if (action === "STATUS_CHANGED") return "#f39c12";
    if (action === "ASSIGNED") return "#27ae60";
    return "#6c757d";
  };

  const getFileIcon = (type) => {
    if (!type) return <FaFileWord />;

    if (type.includes("pdf")) return <FaFilePdf color="red" />;
    if (type.includes("image")) return <FaFileImage color="green" />;
    if (type.includes("video")) return <FaFileVideo color="purple" />;
    if (type.includes("zip") || type.includes("rar")) return <FaFileArchive />;
    if (type.includes("word") || type.includes("doc")) return <FaFileWord color="blue" />;

    return <FaFileWord />;
  };




  if (loading) {
    return <Loader />;
  }

  if (!ticket) {
    return <p className="text-center mt-5">Ticket not found</p>;
  }

  const getCurrentStage = () => {
    if (ticket.status === "RESOLVED" || ticket.status === "REJECTED") return 3;
    if (ticket.status === "IN_PROGRESS") return 2;
    if (ticket.assignedTo?.length) return 1;
    return 0;
  };

  const stages = [
    { key: "CREATED", label: "Ticket Created" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "IN_PROGRESS", label: "In Progress" },
    {
      key: ticket.status === "REJECTED" ? "REJECTED" : "RESOLVED",
      label: ticket.status === "REJECTED" ? "Rejected" : "Completed"
    }
  ];

  return (
    <div className="container-fluid p-4">

      <p
        style={{ cursor: "pointer", color: "#0b5299" }}
        onClick={() => navigate(-1)}
      >
        ← Back to Tickets
      </p>

      <div className="row g-4">

        {/* LEFT SIDE */}
        <div className="col-lg-8">

          {/* HEADER CARD */}
          <div className="card shadow-sm p-4 mb-4">
            <div className="d-flex justify-content-between">
              <div>
                <small>{ticket.ticketNumber}</small>
                <h3 className="fw-bold">{ticket.title}</h3>
              </div>

              <div>
                <span className="badge bg-danger me-2">
                  {ticket.priority}
                </span>
                <span className="badge bg-warning text-dark">
                  {ticket.status}
                </span>
              </div>
            </div>

            <hr />

            <div className="row text-muted small">
              <div className="col-md-3">
                <strong>Created By</strong>
                <p>{ticket.createdBy?.name}</p>
              </div>
              <div className="col-md-3">
                <strong>Assigned To</strong>
                <p>
                  {ticket.assignedTo?.length
                    ? ticket.assignedTo.map(u => u.user?.name).filter(Boolean).join(", ")
                    : "Not Assigned"}
                </p>
              </div>
              <div className="col-md-3">
                <strong>Created</strong>
                <p>{new Date(ticket.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="col-md-3">
                <strong>Service Category</strong>
                <p>{ticket.service?.name}</p>
              </div>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="card shadow-sm p-4 mb-4">
            <h5>Description</h5>
            <div
              dangerouslySetInnerHTML={{ __html: ticket.description }}
            />
          </div>

          {/* COMMENTS */}
          <div className="card shadow-sm p-4">
            <h5>Comments ({comments.length})</h5>

            {comments.map((c) => (
              <div key={c._id} className="d-flex mb-3">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border shadow-sm"
                  style={{ width: 42, height: 42, overflow: 'hidden', minWidth: 42 }}
                >
                  {c.user?.profileImage ? (
                    <img 
                      src={`${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${c.user.profileImage}`} 
                      alt={c.user?.name?.[0]} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = `https://info.aec.edu.in/aec/employeephotos/${c.user.empId}.jpg`;
                      }}
                    />
                  ) : (
                    <span style={{ fontWeight: '500' }}>{c.user?.name?.[0]}</span>
                  )}
                </div>


                <div className="ms-3 p-3 rounded-4 w-100 shadow-sm border" 
                    style={{ 
                      backgroundColor: 'var(--stat-card-bg)', 
                      borderColor: 'var(--border-color) !important',
                      color: 'var(--text-color)' 
                    }}>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <strong style={{ color: 'var(--text-color)' }}>{c.user?.name}</strong>
                    <small className="text-secondary" style={{ fontSize: '0.75em' }}>
                      {new Date(c.createdAt).toLocaleString()}
                    </small>
                  </div>
                  <p className="mb-0" style={{ color: 'var(--text-color)', fontSize: '0.90em', opacity: 0.9 }}>
                    {c.message}
                  </p>
                </div>

              </div>
            ))}

            {ticket.status !== "RESOLVED" && ticket.status !== "REJECTED" && (
              <div className="d-flex align-items-end mt-3 gap-2">
                <textarea
                  className="form-control"
                  placeholder="Add a comment..."
                  rows="1"
                  style={{ 
                    resize: 'none', 
                    minHeight: '46px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--input-bg)',
                    color: 'var(--text-color)',
                    borderColor: 'var(--border-color)'
                  }}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <button
                  className="btn btn-primary d-flex align-items-center justify-content-center"
                  style={{ 
                    width: '46px', 
                    height: '46px', 
                    minWidth: '46px',
                    borderRadius: '12px'
                  }}
                  onClick={handleAddComment}
                  title="Send Comment"
                >
                  <FaTelegramPlane size={18} />
                </button>


              </div>
            )}

          </div>

        </div>
        {/* RIGHT SIDE */}
        <div className="col-lg-4">

          {/* Activity Timeline */}
          <div className="card shadow-sm p-4 mb-4">
            <h5 className="fw-bold mb-4">Activity Timeline</h5>

            <div className="timeline">

              {stages.map((stage, index) => {
                const current = getCurrentStage();
                const isCompleted = index <= current;

                return (
                  <div key={stage.key}
                    className={`timeline-item ${isCompleted ? "completed" : ""}`}>

                    <div className="timeline-icon">
                      {isCompleted ? (
                        stage.key === "REJECTED" ? (
                          <FaTimesCircle color="#e74c3c" size={16} />
                        ) : (
                          // If ticket is overall REJECTED, don't show success checkmarks for intermediate steps
                          ticket.status === "REJECTED" && (stage.key === "ASSIGNED" || stage.key === "IN_PROGRESS") ? (
                            <div style={{ width: 12, height: 12, backgroundColor: "#adb5bd", borderRadius: "50%" }} />
                          ) : (
                            <FaCheckCircle color="#0b5299" size={16} />
                          )
                        )
                      ) : (
                        <FaClock color="#adb5bd" size={14} />
                      )}
                    </div>

                    <div>
                      <strong>{stage.label}</strong>

                      {stage.key === "CREATED" && (
                        <div className="text-muted small">
                          <FaUser size={12} /> {ticket.createdBy?.name} <br />
                          {new Date(ticket.createdAt).toLocaleString("en-IN", {
                            timeZone: "Asia/Kolkata"
                          })}
                        </div>
                      )}

                      {stage.key === "ASSIGNED" && ticket.assignedTo?.length > 0 && (
                        <div className="text-muted small">
                          <FaUser size={12} /> Assigned to{" "}
                          {ticket.assignedTo.map(u => u.user?.name).filter(Boolean).join(", ")}
                        </div>
                      )}

                      {stage.key === "IN_PROGRESS" && ticket.status === "IN_PROGRESS" && (
                        <div className="text-muted small">
                          Work in progress
                        </div>
                      )}

                      {stage.key === "RESOLVED" && ticket.status === "RESOLVED" && (
                        <div className="text-muted small">
                          Ticket completed successfully
                        </div>
                      )}

                      {stage.key === "REJECTED" && ticket.status === "REJECTED" && (
                        <div className="bg-danger-subtle p-2 rounded mt-2 border-start border-danger border-3">
                          <p className="mb-1 text-danger-emphasis fw-bold x-small">Rejection Reason:</p>
                          <p className="mb-0 text-muted small">{ticket.rejectionReason || "No remarks provided."}</p>
                        </div>
                      )}
                    </div>

                  </div>
                );
              })}

            </div>
          </div>

          {/* Attachments */}
          <div className="card shadow-sm p-4 attachments">
            <h5 className="fw-bold mb-4">Attachments</h5>


            {ticket.attachments?.map((file) => (
              <div key={file._id} className="mb-2">
                <a
                  href={`${import.meta.env.VITE_BACKEND_URL}/api/complaints/${ticket._id}/attachments/${file._id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="attachment-link"
                >
                  {getFileIcon(file.fileType)} <span className="ms-2">{file.fileName}</span>
                </a>

              </div>
            ))}


          </div>

        </div>
      </div>
    </div >
  );
};

export default TicketDetails;
