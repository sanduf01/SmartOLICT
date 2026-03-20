import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './manage-users.css';
import api from '../utils/api';

function ManageUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/users/admin/all');
      setUsers(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await api.put(`/api/users/admin/${userId}/role`, { role });
      // Update local state
      setUsers(users.map(user =>
        user._id === userId ? { ...user, role } : user
      ));
      setEditingUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = (user) => {
    setSelectedUserToDelete(user);
    setShowDeleteModal(true);
  };

  const confirmDeleteUser = async () => {
    if (!selectedUserToDelete) return;

    try {
      await api.delete(`/api/users/admin/${selectedUserToDelete._id}`);
      // Remove from local state
      setUsers(users.filter(user => user._id !== selectedUserToDelete._id));
      setShowDeleteModal(false);
      setSelectedUserToDelete(null);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="manage-users-container">Loading...</div>;
  }

  if (error) {
    return <div className="manage-users-container">Error: {error}</div>;
  }

  return (
    <div className="manage-users-container">
      <div style={{display: 'flex', alignItems: 'center', gap: '300px'}}>
        <FaArrowLeft className="nav-icon" title="Back" onClick={() => navigate('/dashboard')} style={{cursor: 'pointer'}} />
        <h1>Manage Users</h1>
      </div>
      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.firstName}</td>
                <td>{user.lastName}</td>
                <td>
                  {editingUser === user._id ? (
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="admin">Admin</option>
                    </select>
                  ) : (
                    user.role
                  )}
                </td>
                <td>
                  {editingUser === user._id ? (
                    <>
                      <button onClick={() => handleRoleChange(user._id, newRole)}>Save</button>
                      <button onClick={() => setEditingUser(null)}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => {
                        setEditingUser(user._id);
                        setNewRole(user.role);
                      }}>Edit Role</button>
                      <button onClick={() => handleDeleteUser(user)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ===== DELETE USER MODAL ===== */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            <h2>Confirm Delete User</h2>
            <div className="delete-user-info">
              <p>Are you sure you want to delete this user?</p>
              {selectedUserToDelete && (
                <div className="user-details">
                  <p><strong>Username:</strong> {selectedUserToDelete.username}</p>
                  <p><strong>Email:</strong> {selectedUserToDelete.email}</p>
                  <p><strong>Role:</strong> {selectedUserToDelete.role}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={confirmDeleteUser} className="delete-confirm-btn">Delete</button>
              <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManageUsers;
