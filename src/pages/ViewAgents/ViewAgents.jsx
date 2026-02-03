import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Header } from '../../components/Header'
import axios from 'axios';
import * as XLSX from 'xlsx';
import './ViewAgents.css';

export function ViewAgents() {
    const [agents, setAgents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [mautamersData, setMautamersData] = useState([]);
    const [creating, setCreating] = useState(false);
    const [selectedAgent, setSelectedAgent] = useState(null);
    const [updateUsername, setUpdateUsername] = useState('');
    const [updatePassword, setUpdatePassword] = useState('');
    const [updating, setUpdating] = useState(false);

    const token = localStorage.getItem('access');
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigate('/');
        } else {
            fetchAgents();
        }
    }, []);

    const fetchAgents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:5000/api/admin/agents/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setAgents(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching agents:', error);
            setLoading(false);
        }
    };


    const handleExcelUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const data = await parseExcelFile(file);
            setMautamersData(data);
            alert(`${data.length} mautamers loaded from Excel`);
        } catch (error) {
            console.error('Error parsing Excel:', error);
            alert('Failed to parse Excel file');
        }

        event.target.value = '';
    };


    const parseExcelFile = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    const mautamers = jsonData.map(row => ({
                        pax_name: row['Pax Name'] || row['pax_name'] || row['Name'] || row['name'] || '',
                        passport: row['Passport'] || row['passport'] || row['Passport No'] || row['passport_no'] || ''
                    })).filter(m => m.pax_name && m.passport);

                    resolve(mautamers);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    };

    const handleCreateAgent = async (e) => {
        e.preventDefault();

        if (!newUsername || !newPassword) {
            alert('Please fill username and password');
            return;
        }

        setCreating(true);

        try {
            const response = await axios.post(
                'http://127.0.0.1:5000/api/admin/agents/create/',
                {
                    username: newUsername,
                    password: newPassword,
                    mautamers: mautamersData
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert(response.data.message);

            setNewUsername('');
            setNewPassword('');
            setMautamersData([]);
            setShowCreateModal(false);

            fetchAgents();

        } catch (error) {
            console.error('Error creating agent:', error);
            if (error.response && error.response.data) {
                alert(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to create agent');
            }
        } finally {
            setCreating(false);
        }
    };


    const handleOpenUpdateModal = (agent) => {
        setSelectedAgent(agent);
        setUpdateUsername(agent.username);
        setUpdatePassword('');
        setShowUpdateModal(true);
    };


    const handleUpdateAgent = async (e) => {
        e.preventDefault();

        if (!updateUsername && !updatePassword) {
            alert('Please provide username or password to update');
            return;
        }

        setUpdating(true);

        try {
            const updateData = {};
            if (updateUsername && updateUsername !== selectedAgent.username) {
                updateData.username = updateUsername;
            }
            if (updatePassword) {
                updateData.password = updatePassword;
            }

            if (Object.keys(updateData).length === 0) {
                alert('No changes detected');
                setUpdating(false);
                return;
            }

            const response = await axios.patch(
                `http://127.0.0.1:5000/api/admin/agents/${selectedAgent.id}/update/`,
                updateData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert(response.data.message);

            setSelectedAgent(null);
            setUpdateUsername('');
            setUpdatePassword('');
            setShowUpdateModal(false);

            fetchAgents();

        } catch (error) {
            console.error('Error updating agent:', error);
            if (error.response && error.response.data) {
                alert(`Error: ${error.response.data.error || JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to update agent');
            }
        } finally {
            setUpdating(false);
        }
    };


    const handleUploadMautamersForAgent = async (agentId, event) => {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const mautamers = await parseExcelFile(file);

            if (mautamers.length === 0) {
                alert('No valid data found in Excel file');
                return;
            }

            const response = await axios.post(
                `http://127.0.0.1:5000/api/admin/agents/${agentId}/mautamers/`,
                {
                    mautamers: mautamers,
                    replace_existing: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            alert(response.data.message);
            fetchAgents();

        } catch (error) {
            console.error('Error uploading mautamers:', error);
            alert('Failed to upload mautamers');
        }

        event.target.value = '';
    };

    return (
        <>
            <Header />

            <main className="agents-admin-container">
                <div className="agents-page-header">
                    <h2>Agent Management</h2>
                    <button
                        className="agents-btn-primary"
                        onClick={() => setShowCreateModal(true)}
                    >
                        + Create New Agent
                    </button>
                </div>

                <div className="agents-table-card">
                    <div className="agents-table-wrapper">
                        <table className="agents-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Mautamers</th>
                                    <th>Vouchers</th>
                                    <th>Joined Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="5" className="agents-no-data">
                                            <div className="agents-empty-state">
                                                <p>Loading agents...</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : agents.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="agents-no-data">
                                            <div className="agents-empty-state">
                                                <p>No agents found</p>
                                                <small>Create your first agent to get started</small>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    agents.map((agent) => (
                                        <tr key={agent.id}>
                                            <td><strong>{agent.username}</strong></td>
                                            <td>{agent.mautamers_count}</td>
                                            <td>{agent.vouchers_count}</td>
                                            <td>
                                                {new Date(agent.date_joined).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <div className="agents-action-buttons-group">

                                                    <label className="agents-action-btn agents-excel-btn" title="Upload Mautamers">
                                                        <input
                                                            type="file"
                                                            accept=".xlsx, .xls"
                                                            onChange={(e) => handleUploadMautamersForAgent(agent.id, e)}
                                                            style={{ display: 'none' }}
                                                        />
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M8 12V4M8 4L5 7M8 4L11 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            <path d="M2 12v2h12v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                        </svg>
                                                        <span className="agents-btn-text">Upload</span>
                                                    </label>

                                                    <button
                                                        className="agents-action-btn agents-update-btn"
                                                        title="Update Agent"
                                                        onClick={() => handleOpenUpdateModal(agent)}
                                                    >
                                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                            <path d="M11.333 2A1.886 1.886 0 0114 4.667l-9 9-3.667 1 1-3.667 9-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                        </svg>
                                                        <span className="agents-btn-text">Update</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>


            {showCreateModal && (
                <div className="agents-modal-overlay" onClick={() => setShowCreateModal(false)}>
                    <div className="agents-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Create New Agent</h3>

                        <form onSubmit={handleCreateAgent}>
                            <div className="agents-form-group">
                                <label htmlFor="username">Username *</label>
                                <input
                                    type="text"
                                    id="username"
                                    placeholder="Enter username"
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="agents-form-group">
                                <label htmlFor="password">Password *</label>
                                <input
                                    type="password"
                                    id="password"
                                    placeholder="Enter password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="agents-form-group">
                                <label htmlFor="excel-upload">Mautamers Excel (Optional)</label>
                                <input
                                    type="file"
                                    id="excel-upload"
                                    accept=".xlsx, .xls"
                                    onChange={handleExcelUpload}
                                />
                                {mautamersData.length > 0 && (
                                    <p className="agents-success-text">
                                        ✓ {mautamersData.length} mautamers loaded
                                    </p>
                                )}
                            </div>

                            <div className="agents-modal-actions">
                                <button
                                    type="button"
                                    className="agents-btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="agents-btn-primary"
                                    disabled={creating}
                                >
                                    {creating ? 'Creating...' : 'Create Agent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}


            {showUpdateModal && selectedAgent && (
                <div className="agents-modal-overlay" onClick={() => setShowUpdateModal(false)}>
                    <div className="agents-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Update Agent: {selectedAgent.username}</h3>

                        <form onSubmit={handleUpdateAgent}>
                            <div className="agents-form-group">
                                <label htmlFor="update-username">Username</label>
                                <input
                                    type="text"
                                    id="update-username"
                                    placeholder="Enter new username"
                                    value={updateUsername}
                                    onChange={(e) => setUpdateUsername(e.target.value)}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Leave empty to keep current username
                                </small>
                            </div>

                            <div className="agents-form-group">
                                <label htmlFor="update-password">New Password</label>
                                <input
                                    type="password"
                                    id="update-password"
                                    placeholder="Enter new password"
                                    value={updatePassword}
                                    onChange={(e) => setUpdatePassword(e.target.value)}
                                />
                                <small style={{ color: '#666', fontSize: '12px' }}>
                                    Leave empty to keep current password
                                </small>
                            </div>

                            <div className="agents-modal-actions">
                                <button
                                    type="button"
                                    className="agents-btn-secondary"
                                    onClick={() => setShowUpdateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="agents-btn-primary"
                                    disabled={updating}
                                >
                                    {updating ? 'Updating...' : 'Update Agent'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}