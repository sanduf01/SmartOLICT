import React, { useState, useEffect } from "react";
import "./notification.css";
import { Bell, ArrowLeft, Trash2, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

export default function Notification() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/api/notifications");
      // Transform API data to match component structure
      const transformedNotifications = response.data.map(notif => ({
        id: notif._id,
        title: notif.title,
        desc: notif.desc,
        isRead: notif.isRead || false
      }));
      setNotifications(transformedNotifications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/api/notifications/${id}/read`);
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
    } catch (err) {
      console.error("Error marking as read:", err);
      // Still update locally even if API fails
      setNotifications(notifications.map(notif =>
        notif.id === id ? { ...notif, isRead: true } : notif
      ));
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/notifications/${id}`);
      setNotifications(notifications.filter(notif => notif.id !== id));
    } catch (err) {
      // Still remove locally even if API fails
      setNotifications(notifications.filter(notif => notif.id !== id));
    }
  };

  return (
    <div className="notify-bg">
      <div className="notify-card">

        {/* Header with Back Button */}
        <div className="notify-header">
          <button 
            className="back-btn" 
            onClick={() => navigate("/setting")}
          >
            <ArrowLeft size={20} />Back
          </button>

          <div className="notify-title">
            <img
              className="settings-logo"
              src="https://i.imgur.com/ifXSUE0_d.webp?maxwidth=760&fidelity=grand"
              alt="logo"
            />
            <Bell size={22} />
            <h2>Notifications</h2>
          </div>
          <span className="notify-sub">Smart O/L ICT</span>
        </div>

        {/* Notification List */}
        <div className="notify-list">
          {notifications.map((item) => (
            <div key={item.id} className={`notify-item ${item.isRead ? 'read' : ''}`}>
              <div className="notify-icon">
                <Bell size={18} />
              </div>
              <div className="notify-content">
                <h4 className="notify-title-text">{item.title}</h4>
                <p>{item.desc}</p>
              </div>
              <div className="notify-actions">
                {!item.isRead && (
                  <button 
                    className="action-btn mark-read-btn" 
                    onClick={() => handleMarkAsRead(item.id)}
                    title="Mark as Read"
                  >
                    <Check size={16} />
                  </button>
                )}
                <button 
                  className="action-btn delete-btn" 
                  onClick={() => handleDelete(item.id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
