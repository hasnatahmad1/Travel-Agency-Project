import { useEffect, useState } from "react";
import { Header } from "../../components/Header";
import { useNavigate } from "react-router";
import axios from 'axios';
import './HomePage.css'

export function HomePage() {
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchQuery, setSearchQuery] = useState('');


    const navigateToLoginPage = useNavigate();
    const navigate = useNavigate();

    const token = localStorage.getItem('access');
    const isSuperUser = JSON.parse(localStorage.getItem('is_superuser'));

    useEffect(() => {
        if (!token) {
            navigateToLoginPage('/');
        }
        else if (isSuperUser) {
            fetchVouchersForAdmin();
        }
        else {
            fetchVouchers();
        }
    }, [])

    const fetchVouchersForAdmin = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await axios.get('http://127.0.0.1:5000/api/admin/vouchers/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (Array.isArray(response.data)) {
                setVouchers(response.data);
            } else {
                setVouchers([]);
                console.error('Response is not an array:', response.data);
            }

            setLoading(false);
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            setError('Failed to load vouchers');
            setVouchers([]);
            setLoading(false);
        }
    };


    const getStatusClass = (status) => {
        switch (status) {
            case 'approved':
                return 'home-status-approved';
            case 'rejected':
                return 'home-status-rejected';
            case 'pending':
            default:
                return 'home-status-pending';
        }
    };


    const handleApprove = async (voucherId) => {
        if (window.confirm('Are you sure you want to approve this voucher?')) {
            try {
                await axios.patch(
                    `http://127.0.0.1:5000/api/admin/vouchers/${voucherId}/status/`,
                    { status: 'approved' },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                alert('Voucher approved successfully');
                fetchVouchersForAdmin();
            } catch (err) {
                console.error('Error approving voucher:', err);
                alert('Failed to approve voucher');
            }
        }
    };


    const handleReject = async (voucherId) => {
        if (window.confirm('Are you sure you want to reject this voucher?')) {
            try {
                await axios.patch(
                    `http://127.0.0.1:5000/api/admin/vouchers/${voucherId}/status/`,
                    { status: 'rejected' },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                alert('Voucher rejected successfully');
                fetchVouchersForAdmin();
            } catch (err) {
                console.error('Error rejecting voucher:', err);
                alert('Failed to reject voucher');
            }
        }
    };


    const handleViewVoucher = (voucherId) => {
        navigate(`/homepage/viewdetails/${voucherId}`);
    };


    const filteredVouchers = Array.isArray(vouchers)
        ? vouchers.filter(voucher =>
            voucher.vNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            voucher.agentName.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];


    const indexOfLastVoucher = currentPage * rowsPerPage;
    const indexOfFirstVoucher = indexOfLastVoucher - rowsPerPage;
    const currentVouchers = filteredVouchers.slice(indexOfFirstVoucher, indexOfLastVoucher);
    const totalPages = Math.ceil(filteredVouchers.length / rowsPerPage);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };



    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://127.0.0.1:5000/vouchers/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setVouchers(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching vouchers:', err);
            setError('Failed to load vouchers');
            setLoading(false);
        }
    };


    const toggleCreateNewButton = () => {
        window.location.href = '/homepage/createnewpage';
    };


    const handleDeleteVoucher = async (voucherId) => {
        if (window.confirm('Are you sure you want to delete this voucher?')) {
            try {
                await axios.delete(`http://127.0.0.1:5000/vouchers/${voucherId}/`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });


                fetchVouchers();
                alert('Voucher deleted successfully');
            } catch (err) {
                console.error('Error deleting voucher:', err);
                alert('Failed to delete voucher');
            }
        }
    };


    return (
        <>
            <Header />

            <main className="home-page-container">
                <div className="home-page-header">
                    <h2>Manage Vouchers</h2>
                    {
                        !isSuperUser &&
                        <button className="home-create-btn" onClick={toggleCreateNewButton}>CREATE NEW +</button>
                    }
                </div>

                <div className="home-table-card">
                    <div className="home-table-controls">
                        <div className="home-search-box">
                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                                <circle cx="8" cy="8" r="6" stroke="#999" strokeWidth="2" />
                                <path d="M12 12L16 16" stroke="#999" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by vNo or Agent..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {
                        !isSuperUser ? (
                            <div className="home-table-wrapper">
                                <table className="home-voucher-table">
                                    <thead>
                                        <tr>
                                            <th>
                                                <div className="home-th-content">
                                                    vNo
                                                    <svg className="home-sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 3L9 6H3L6 3Z" fill="#999" />
                                                        <path d="M6 9L3 6H9L6 9Z" fill="#999" />
                                                    </svg>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="home-th-content">
                                                    Agent
                                                    <svg className="home-sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 3L9 6H3L6 3Z" fill="#999" />
                                                        <path d="M6 9L3 6H9L6 9Z" fill="#999" />
                                                    </svg>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="home-th-content">
                                                    Group Name
                                                    <svg className="home-sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 3L9 6H3L6 3Z" fill="#999" />
                                                        <path d="M6 9L3 6H9L6 9Z" fill="#999" />
                                                    </svg>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="home-th-content">
                                                    Status
                                                    <svg className="home-sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 3L9 6H3L6 3Z" fill="#999" />
                                                        <path d="M6 9L3 6H9L6 9Z" fill="#999" />
                                                    </svg>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="home-th-content">
                                                    Created Date
                                                    <svg className="home-sort-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
                                                        <path d="M6 3L9 6H3L6 3Z" fill="#999" />
                                                        <path d="M6 9L3 6H9L6 9Z" fill="#999" />
                                                    </svg>
                                                </div>
                                            </th>
                                            <th>
                                                <div className="home-th-content">
                                                    Actions
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="6" className="home-no-data">
                                                    <div className="home-empty-state">
                                                        <p>Loading vouchers...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="6" className="home-no-data">
                                                    <div className="home-empty-state">
                                                        <p style={{ color: 'red' }}>{error}</p>
                                                        <button onClick={fetchVouchers} className="home-retry-btn">Retry</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : currentVouchers.length === 0 ? (
                                            <tr>
                                                <td colSpan="6" className="home-no-data">
                                                    <div className="home-empty-state">
                                                        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                                                            <circle cx="32" cy="32" r="30" stroke="#ddd" strokeWidth="2" strokeDasharray="4 4" />
                                                            <path d="M32 20V44M20 32H44" stroke="#ddd" strokeWidth="2" strokeLinecap="round" />
                                                        </svg>
                                                        <p>No records to display</p>
                                                        <small>Create your first voucher to get started</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentVouchers.map((voucher) => (
                                                <tr key={voucher.id}>
                                                    <td><strong>{voucher.vNo}</strong></td>
                                                    <td>{voucher.agentName}</td>
                                                    <td>{voucher.groupName || '-'}</td>
                                                    <td>
                                                        <span className={`home-status-badge ${getStatusClass(voucher.status)}`}>
                                                            {voucher.status}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(voucher.created_at).toLocaleDateString()}</td>
                                                    <td>
                                                        <div className="home-action-buttons">
                                                            <button
                                                                className="home-action-btn home-view-btn"
                                                                onClick={() => handleViewVoucher(voucher.id)}
                                                                title="View Details"
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M8 3C4.5 3 1.5 8 1.5 8s3 5 6.5 5 6.5-5 6.5-5-3-5-6.5-5z" stroke="currentColor" strokeWidth="1.5" />
                                                                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="home-action-btn home-delete-btn"
                                                                onClick={() => handleDeleteVoucher(voucher.id)}
                                                                title="Delete"
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M3 4h10M5 4V3a1 1 0 011-1h4a1 1 0 011 1v1M6 7v4M10 7v4M4 4h8l-.5 8a1 1 0 01-1 1h-5a1 1 0 01-1-1L4 4z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="home-table-wrapper">
                                <table className="home-voucher-table">
                                    <thead>
                                        <tr>
                                            <th>vNo</th>
                                            <th>Agent</th>
                                            <th>Arrival Date</th>
                                            <th>Return Date</th>
                                            <th>Nights</th>
                                            <th>Status</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan="7" className="home-no-data">
                                                    <div className="home-empty-state">
                                                        <p>Loading vouchers...</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : error ? (
                                            <tr>
                                                <td colSpan="7" className="home-no-data">
                                                    <div className="home-empty-state">
                                                        <p style={{ color: 'red' }}>{error}</p>
                                                        <button onClick={fetchVouchersForAdmin} className="home-retry-btn">Retry</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : currentVouchers.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="home-no-data">
                                                    <div className="home-empty-state">
                                                        <p>No records to display</p>
                                                        <small>Agents will create vouchers that appear here</small>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            currentVouchers.map((voucher) => (
                                                <tr key={voucher.id}>
                                                    <td><strong>{voucher.vNo}</strong></td>
                                                    <td>{voucher.agentName}</td>
                                                    <td>
                                                        {voucher.arrival_date
                                                            ? new Date(voucher.arrival_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })
                                                            : 'N/A'
                                                        }
                                                    </td>
                                                    <td>
                                                        {voucher.return_date
                                                            ? new Date(voucher.return_date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })
                                                            : 'N/A'
                                                        }
                                                    </td>
                                                    <td>{voucher.nights || 0}</td>
                                                    <td>
                                                        <span className={`home-status-badge ${getStatusClass(voucher.status)}`}>
                                                            {voucher.status.toUpperCase()}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <div className="home-action-buttons">

                                                            <button
                                                                className="home-action-btn home-view-btn"
                                                                onClick={() => handleViewVoucher(voucher.id)}
                                                                title="View Details"
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M8 3C4.5 3 1.5 8 1.5 8s3 5 6.5 5 6.5-5 6.5-5-3-5-6.5-5z" stroke="currentColor" strokeWidth="1.5" />
                                                                    <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
                                                                </svg>
                                                            </button>


                                                            <button
                                                                className="home-action-btn home-approve-btn"
                                                                onClick={() => handleApprove(voucher.id)}
                                                                title="Approve"
                                                                disabled={voucher.status === 'approved'}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M3 8l3 3 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>


                                                            <button
                                                                className="home-action-btn home-reject-btn"
                                                                onClick={() => handleReject(voucher.id)}
                                                                title="Reject"
                                                                disabled={voucher.status === 'rejected'}
                                                            >
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                                                    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )
                    }

                    <div className="home-table-footer">
                        <div className="home-rows-per-page">
                            <span>Rows per page:</span>
                            <select
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                            >
                                <option value="10">10</option>
                                <option value="25">25</option>
                                <option value="50">50</option>
                            </select>
                        </div>

                        <div className="home-pagination-info">
                            <span>
                                {filteredVouchers.length === 0
                                    ? '0–0 of 0'
                                    : `${indexOfFirstVoucher + 1}–${Math.min(indexOfLastVoucher, filteredVouchers.length)} of ${filteredVouchers.length}`
                                }
                            </span>
                        </div>

                        <div className="home-pagination-controls">
                            <button
                                className="home-pagination-btn"
                                onClick={handlePrevPage}
                                disabled={currentPage === 1}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M10 4L6 8L10 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                            <button
                                className="home-pagination-btn"
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages || filteredVouchers.length === 0}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}