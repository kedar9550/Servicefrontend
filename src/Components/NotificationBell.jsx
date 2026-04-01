import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { Bell, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const NotificationBell = () => {
  const { socket } = useSocket();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/api/notifications', { withCredentials: true });
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;

    const handleNewNotif = (notif) => {
      setNotifications((prev) => [notif, ...prev]);
      toast.info(notif.title + ': ' + notif.message, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    };

    socket.on('new_notification', handleNewNotif);

    return () => {
      socket.off('new_notification', handleNewNotif);
    };
  }, [socket]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notif) => {
    setShowDropdown(false);
    if (!notif.isRead) {
      try {
        await API.put(`/api/notifications/${notif._id}/read`, {}, { withCredentials: true });
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, isRead: true } : n));
      } catch (err) {
        console.error('Failed to mark read', err);
      }
    }
    if (notif.type === 'TICKET_CREATED') {
      navigate('/dept/assign');
    } else if (notif.type === 'TICKET_ASSIGNED') {
      navigate('/dev/assigned');
    } else if (notif.type === 'ASSIGNMENT_REJECTED') {
      navigate('/rejected');
    } else if (notif.ticketId) {
      navigate(`/ticketdetails/${notif.ticketId}`); 
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put(`/api/notifications/read-all`, {}, { withCredentials: true });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const handleDeleteNotification = async (e, notifId) => {
    e.stopPropagation();
    try {
      await API.delete(`/api/notifications/${notifId}`, { withCredentials: true });
      setNotifications(prev => prev.filter(n => n._id !== notifId));
      toast.success('Notification deleted');
    } catch (err) {
      console.error('Failed to delete notification', err);
      toast.error('Failed to delete notification');
    }
  };

  return (
    <div className="position-relative me-4" ref={dropdownRef}>
      <div 
        style={{ cursor: 'pointer', position: 'relative', marginTop:'8px' }}
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <Bell size={24} color="var(--text-color)" />

        {unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65em' }}>
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </div>

      {showDropdown && (
        <div 
          className="dropdown-menu show shadow notification-scrollbar" 
          style={{ 
            position: 'absolute', 
            right: '-10px', 
            top: '60px', 
            width: '350px', 
            maxHeight: '450px', 
            overflowY: 'auto', 
            zIndex: 1050, 
            backgroundColor: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0'
          }}
        >
          <div 
            className="d-flex justify-content-between align-items-center px-3 py-3 border-bottom"
            style={{ borderColor: 'var(--border-color) !important' }}
          >
            <h6 className="m-0 fw-bold" style={{ color: 'var(--text-color)' }}>Notifications</h6>
            {unreadCount > 0 && (
              <span 
                style={{ fontSize: '0.8em', cursor: 'pointer', color: 'var(--accent-color)', fontWeight: '600' }} 
                onClick={markAllAsRead}
              >
                Mark all as read
              </span>
            )}
          </div>

          <div className="list-group list-group-flush" style={{ backgroundColor: 'transparent' }}>
            {notifications.length === 0 ? (
              <div className="text-center p-4" style={{ color: 'var(--secondary-color)' }}>No new notifications</div>
            ) : (
              notifications.map((notif) => (
                <button
                  key={notif._id}
                  className="list-group-item list-group-item-action border-bottom"
                  onClick={() => handleNotificationClick(notif)}
                  style={{ 
                    textAlign: 'left',
                    backgroundColor: !notif.isRead ? 'rgba(var(--primary-color-rgb, 11, 82, 153), 0.05)' : 'transparent',
                    borderColor: 'var(--border-color)',
                    padding: '12px 16px',
                    transition: 'background-color 0.2s ease'
                  }}
                >
                  <div className="d-flex w-100 justify-content-between align-items-center mb-1">
                    <strong 
                      style={{ 
                        fontSize: '0.95em', 
                        color: 'var(--text-color)',
                        fontWeight: !notif.isRead ? '700' : '500'
                      }}
                    >
                      {notif.title}
                    </strong>
                    <div className="d-flex align-items-center" style={{ gap: '10px' }}>
                      <small style={{ fontSize: '0.75em', color: 'var(--secondary-color)' }}>
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </small>
                      <Trash2 
                        size={16} 
                        className="text-danger" 
                        style={{ 
                          cursor: 'pointer',
                          opacity: 0.7
                        }}
                        onClick={(e) => handleDeleteNotification(e, notif._id)}
                      />
                    </div>
                  </div>
                  <p 
                    className="mb-0" 
                    style={{ 
                      fontSize: '0.85em', 
                      color: !notif.isRead ? 'var(--text-color)' : 'var(--secondary-color)',
                      lineHeight: '1.4'
                    }}
                  >
                    {notif.message}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
