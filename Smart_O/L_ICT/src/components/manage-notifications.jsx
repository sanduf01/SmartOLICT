import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './manage-notifications.css';
import api from '../utils/api';

function ManageNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    isGlobal: true,
    targetUsers: []
  });
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);

  useEffect(() => {
    fetchNotifications();
    fetchUsers();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications/all');
      setNotifications(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/admin/all');
      /*const response = await api.get('/api/users');*/
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => ({
      ...prev,
      targetUsers: prev.targetUsers.includes(userId)
        ? prev.targetUsers.filter(id => id !== userId)
        : [...prev.targetUsers, userId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/notifications/create', formData);
      setFormData({
        title: '',
        desc: '',
        isGlobal: true,
        targetUsers: []
      });
      setShowForm(false);
      fetchNotifications();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = (id) => {
    setNotificationToDelete(id);
    setShowDeletePopup(true);
  };

  const confirmDelete = async () => {
    if (!notificationToDelete) return;
    try {
      await api.delete(`/api/notifications/${notificationToDelete}`);
      fetchNotifications();
      setShowDeletePopup(false);
      setNotificationToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const cancelDelete = () => {
    setShowDeletePopup(false);
    setNotificationToDelete(null);
  };

  if (loading) {
    return <div className="manage-notifications-container">Loading...</div>;
  }

  return (
    <div className="manage-notifications-container">
      <div style={{display: 'flex', alignItems: 'center', gap: '60px'}}>
        <FaArrowLeft className="nav-icon" title="Back" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}} />
        <h1>Manage Notifications</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <button className="create-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Cancel' : 'Create Notification'}
      </button>

      {showForm && (
        <form className="notification-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description:</label>
            <textarea
              name="desc"
              value={formData.desc}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="isGlobal"
                checked={formData.isGlobal}
                onChange={handleInputChange}
              />
              Send to all users (Global)
            </label>
          </div>

          {!formData.isGlobal && (
            <div className="form-group">
              <label>Select Target Users:</label>
              <select
                multiple
                value={formData.targetUsers}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData(prev => ({ ...prev, targetUsers: selectedOptions }));
                }}
              >
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.firstName} {user.lastName} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button type="submit" className="submit-btn">Send Notification</button>
        </form>
      )}

      <div className="notifications-list">
        <h2>Existing Notifications</h2>
        {notifications.map(notification => (
          <div key={notification._id} className="notification-item">
            <h3>{notification.title}</h3>
            <p>{notification.desc}</p>
            <small>
              Created by: {notification.createdBy?.firstName} {notification.createdBy?.lastName} |
              {notification.isGlobal ? 'Global' : `Targeted (${notification.targetUsers?.length} users)`} |
              {new Date(notification.createdAt).toLocaleDateString()}
            </small>
            <button className="delete-btn" onClick={() => handleDelete(notification._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {showDeletePopup && (
        <div className="delete-popup-overlay">
          <div className="delete-popup">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this notification?</p>
            <div className="popup-buttons">
              <button className="confirm-btn" onClick={confirmDelete}>Confirm</button>
              <button className="cancel-btn" onClick={cancelDelete}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageNotifications;
