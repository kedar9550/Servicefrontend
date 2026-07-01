import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaCheckCircle, FaClock, FaUser, FaTimesCircle, FaPaperPlane, FaRocket, FaTelegramPlane } from "react-icons/fa";
import { FaFilePdf, FaFileWord, FaFileImage, FaFileVideo, FaFileArchive } from "react-icons/fa";




import API from '../../api/axios'
import Loader from '../../Components/Loader'
import { useSocket } from '../../context/SocketContext';

const TicketDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { socket } = useSocket();
  const { user } = useAuth();
  const commentsEndRef = useRef(null);


  const fetchTicketDetails = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);

      const res = await API.get(`/api/complaints/${id}`);

      const data = res.data.data;

      setTicket(data.ticket);
      setComments(data.comments);
      setActivities(data.activities);

    } catch (error) {
      console.error(error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };


  useEffect(() => {

    fetchTicketDetails(true)

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

    const handleConnect = () => {
      socket.emit("join_ticket", id);
    };

    socket.on("connect", handleConnect);
    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("new_message", handleNewMessage);
      socket.emit("leave_ticket", id);
    };
  }, [socket, id]);
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");

  // Auto-scroll to bottom of comments
  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const res = await API.post(`/api/complaints/${id}/comments`, {
        message: newComment,
      });

      setNewComment("");

      // Immediately append the new comment from the response to the state
      if (res.data) {
        const newC = res.data.comment || res.data.data || res.data;
        if (newC && newC._id) {
          setComments(prev => {
            if (prev.some(c => c._id === newC._id)) return prev;
            return [...prev, newC];
          });
        } else {
          fetchTicketDetails(false);
        }
      } else {
        fetchTicketDetails(false);
      }

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
    if (action === "TICKET_CREATED") return "var(--primary-color)";
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
    if (ticket.status === "RESOLVED" || ticket.status === "REJECTED" || ticket.status === "CLOSED") return 3;
    if (ticket.status === "IN_PROGRESS") return 2;
    if (ticket.assignedTo?.filter(a => a.status !== "REJECTED").length) return 1;
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
        style={{ cursor: "pointer", color: "var(--primary-color)" }}
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
                  {ticket.assignedTo?.filter(a => a.status !== "REJECTED").length
                    ? ticket.assignedTo.filter(a => a.status !== "REJECTED").map(u => u.user?.name).filter(Boolean).join(", ")
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
          <div className="card shadow-sm p-3 p-md-4">
            <style>{`
              .chat-bubble {
                max-width: 92%;
              }
              @media (min-width: 768px) {
                .chat-bubble {
                  max-width: 80%;
                }
              }
              .chat-avatar {
                width: 32px;
                height: 32px;
                min-width: 32px;
              }
              @media (min-width: 768px) {
                .chat-avatar {
                  width: 42px;
                  height: 42px;
                  min-width: 42px;
                }
              }
              .chat-avatar-margin-mine {
                margin: 0 0 0 8px;
              }
              .chat-avatar-margin-other {
                margin: 0 8px 0 0;
              }
              @media (min-width: 768px) {
                .chat-avatar-margin-mine {
                  margin: 0 0 0 12px;
                }
                .chat-avatar-margin-other {
                  margin: 0 12px 0 0;
                }
              }
              /* Default Light Theme Colors */
              .chat-bubble-mine {
                background-color: #e8f0fe;
              }
              .chat-bubble-other {
                background-color: #f8f9fa;
              }
              .chat-text {
                color: #1f1f1f;
              }
              .chat-name {
                color: #2d3748;
              }
              /* Dark Theme Colors */
              [data-bs-theme="dark"] .chat-bubble-mine {
                background-color: #1e3a5f;
              }
              [data-bs-theme="dark"] .chat-bubble-other {
                background-color: #2b3035;
              }
              [data-bs-theme="dark"] .chat-text {
                color: #e9ecef;
              }
              [data-bs-theme="dark"] .chat-name {
                color: #adb5bd;
              }
            `}</style>
            <div className="d-flex align-items-center mb-3 mb-md-4">
              <i className="bi bi-chat-left-text fs-4 me-2"></i>
              <h5 className="mb-0">Comments ({comments.length})</h5>
            </div>

            <div className="d-flex flex-column gap-3 mb-3 mb-md-4">
              {comments.map((c) => {
                const isMine = (c.user?._id || c.user) === (user?._id || user?.id) || c.user?.institutionId === user?.institutionId;

                return (
                  <div key={c._id} className={`d-flex ${isMine ? 'flex-row-reverse' : 'flex-row'} align-items-end`}>

                    {/* Avatar */}
                    <div
                      className={`chat-avatar rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border shadow-sm flex-shrink-0 ${isMine ? 'chat-avatar-margin-mine' : 'chat-avatar-margin-other'}`}
                      style={{ overflow: 'hidden' }}
                    >
                      <img
                        src={c.user?.profileImage ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${c.user.profileImage}` : `https://info.aec.edu.in/aec/employeephotos/${c.user?.institutionId}.jpg`}
                        alt={c.user?.name?.[0] || 'U'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${c.user?.name || 'U'}&background=0d6efd&color=fff`;
                        }}
                      />
                    </div>

                    {/* Chat Bubble */}
                    <div className={`chat-bubble ${isMine ? 'chat-bubble-mine' : 'chat-bubble-other'} p-2 p-md-3 rounded-4 shadow-sm position-relative`}>

                      <p className="chat-text mb-2 mb-md-3 text-start" style={{ fontSize: '0.90em', wordBreak: 'break-word' }}>
                        {c.message}
                      </p>

                      <div className="d-flex flex-column align-items-end">
                        {!isMine && (
                          <strong className="chat-name" style={{ fontSize: '0.70em', letterSpacing: '0.3px' }}>
                            {c.user?.name}
                          </strong>
                        )}
                        <small className="text-secondary" style={{ fontSize: '0.70em' }}>
                          {new Date(c.createdAt).toLocaleString()}
                        </small>
                      </div>

                    </div>
                  </div>
                );
              })}
              <div ref={commentsEndRef} />
            </div>

            {ticket.status !== "RESOLVED" && ticket.status !== "REJECTED" && ticket.status !== "CLOSED" && (
              <div className="d-flex align-items-end mt-3 gap-2">
                <div
                  className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center border shadow-sm flex-shrink-0"
                  style={{ width: 46, height: 46, overflow: 'hidden' }}
                >
                  <img
                    src={user?.profileImage ? `${import.meta.env.VITE_BACKEND_URL}/uploads/profile/${user.profileImage}` : `https://info.aec.edu.in/aec/employeephotos/${user?.institutionId}.jpg`}
                    alt={user?.name?.[0] || 'U'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${user?.name || 'U'}&background=0d6efd&color=fff`;
                    }}
                  />
                </div>
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
                            <FaCheckCircle color="var(--primary-color)" size={16} />
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
                          {ticket.assignedTo.some(a => a.status !== "REJECTED") && (
                            <div>
                              <FaUser size={12} /> Assigned to{" "}
                              {ticket.assignedTo.filter(a => a.status !== "REJECTED").map(u => u.user?.name).filter(Boolean).join(", ")}
                            </div>
                          )}
                          {ticket.assignedTo.some(a => a.status === "REJECTED") && (
                            <div className="text-danger mt-1">
                              <FaTimesCircle size={12} /> Rejected by{" "}
                              {ticket.assignedTo.filter(a => a.status === "REJECTED").map(u => u.user?.name).filter(Boolean).join(", ")}
                            </div>
                          )}
                        </div>
                      )}

                      {stage.key === "IN_PROGRESS" && ticket.status === "IN_PROGRESS" && (
                        <div className="text-muted small">
                          Work in progress
                        </div>
                      )}

                      {stage.key === "RESOLVED" && (ticket.status === "RESOLVED" || ticket.status === "CLOSED") && (
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

      <style>{`
        .chat-bubble {
          border: 1px solid #e2e8f0;
          min-width: 250px;
        }
        .chat-bubble-mine::after {
          content: '';
          position: absolute;
          top: 50%;
          right: -8px;
          transform: translateY(-50%);
          border-width: 8px 0 8px 8px;
          border-style: solid;
          border-color: transparent transparent transparent #e8f0fe;
          display: block;
          width: 0;
        }
        .chat-bubble-other::after {
          content: '';
          position: absolute;
          top: 50%;
          left: -8px;
          transform: translateY(-50%);
          border-width: 8px 8px 8px 0;
          border-style: solid;
          border-color: transparent #f8f9fa transparent transparent;
          display: block;
          width: 0;
        }
      `}</style>
    </div >
  );
};

export default TicketDetails;
