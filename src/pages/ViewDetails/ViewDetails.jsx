import { Header } from "../../components/Header";
import { useNavigate, useParams } from "react-router";
import { useEffect, useState } from "react";
import axios from 'axios';
import './ViewDetails.css';

export function ViewDetails() {
    const token = localStorage.getItem('access');

    const navigateToLoginPage = useNavigate();
    const navigate = useNavigate();
    const { id } = useParams();

    const [voucher, setVoucher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!token) {
            navigateToLoginPage('/');
        } else {
            fetchVoucherDetails();
        }
    }, []);


    const fetchVoucherDetails = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://127.0.0.1:5000/vouchers/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setVoucher(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching voucher:', err);
            setError('Failed to load voucher details');
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        navigate('/homepage');
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="view-details-loading-container">
                    <p>Loading voucher details...</p>
                </div>
            </>
        );
    }

    if (error || !voucher) {
        return (
            <>
                <Header />
                <div className="view-details-error-container">
                    <p style={{ color: 'red' }}>{error || 'Voucher not found'}</p>
                    <button onClick={handleGoBack} className="view-details-btn-go-back">Go Back</button>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />

            <div className="view-details-voucher-container">
                {/* Header Section */}
                <div className="view-details-voucher-header">
                    <h1 className="view-details-voucher-title">VNo: {voucher.vNo}</h1>

                    <div className="view-details-action-buttons-header">
                        <button className="view-details-btn-go-back" onClick={handleGoBack}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            GO BACK
                        </button>
                        <button className="view-details-btn-print" onClick={handlePrint}>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M4 5V2h8v3M4 11H2V7h12v4h-2M4 14h8v-3H4v3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                            PRINT
                        </button>
                    </div>
                </div>


                <div className="view-details-company-section">
                    <div className="view-details-company-logo">
                        <img src="/TravelAgency.png" alt="Company Logo" />
                    </div>
                    <div className="view-details-company-info">
                        <h2>BASMA EMAAR GROUP FOR UMRAH SERVICES</h2>
                        <p>IATA {voucher.flight_info?.iata || 'N/A'}</p>
                    </div>
                </div>


                <div className="view-details-service-info">
                    <div className="view-details-info-row">
                        <div className="view-details-info-item">
                            <strong>Service No:</strong> {voucher.flight_info?.service_no || 'ADASDA'}
                        </div>
                        <div className="view-details-info-item">
                            <strong>Basma VNo:</strong> {voucher.vNo}
                        </div>
                        <div className="view-details-info-item">
                            <strong>Date Created:</strong> {new Date(voucher.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    </div>
                    <div className="view-details-info-row">
                        <div className="view-details-info-item view-details-full-width">
                            <strong>General Information About Services</strong>
                        </div>
                        <div className="view-details-info-item">
                            <strong>GroupHead/PhoneNo:</strong> {voucher.groupName || 'N/A'}
                        </div>
                    </div>
                </div>


                <table className="view-details-info-table">
                    <thead>
                        <tr>
                            <th>Arrival Date</th>
                            <th>Dep. Date</th>
                            <th>Nights</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{voucher.flight_info?.arrival_date ? new Date(voucher.flight_info.arrival_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                            <td>{voucher.flight_info?.return_date ? new Date(voucher.flight_info.return_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                            <td>{voucher.flight_info?.nights || 0}</td>
                        </tr>
                    </tbody>
                </table>


                <h3 className="view-details-section-heading">KSA Arrival information</h3>
                <table className="view-details-detail-table">
                    <thead>
                        <tr>
                            <th>Entry Port</th>
                            <th>Sector</th>
                            <th>Flight No</th>
                            <th>Dept-Date Pk</th>
                            <th>Dep-Time Pk</th>
                            <th>Arrival Date</th>
                            <th>Arrival Time</th>
                            <th>PNR</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{voucher.flight_info?.sector_from || 'N/A'}</td>
                            <td>{voucher.flight_info?.sector_to || 'N/A'}</td>
                            <td>{voucher.flight_info?.departure_flight_no || 'N/A'}</td>
                            <td>{voucher.flight_info?.departure_date ? new Date(voucher.flight_info.departure_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                            <td>{voucher.flight_info?.depart_time || 'N/A'}</td>
                            <td>{voucher.flight_info?.arrival_date ? new Date(voucher.flight_info.arrival_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                            <td>{voucher.flight_info?.arrival_time || 'N/A'}</td>
                            <td>{voucher.flight_info?.departure_pnr || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>


                <h3 className="view-details-section-heading">Departure Information</h3>
                <table className="view-details-detail-table">
                    <thead>
                        <tr>
                            <th>Dep Port</th>
                            <th>Sector</th>
                            <th>Flight No</th>
                            <th>Dept-Date</th>
                            <th>Dep-Time</th>
                            <th>PNR</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{voucher.flight_info?.return_sector_from || 'N/A'}</td>
                            <td>{voucher.flight_info?.return_sector_to || 'N/A'}</td>
                            <td>{voucher.flight_info?.return_flight_no || 'N/A'}</td>
                            <td>{voucher.flight_info?.return_date ? new Date(voucher.flight_info.return_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                            <td>{voucher.flight_info?.return_time || 'N/A'}</td>
                            <td>{voucher.flight_info?.return_pnr || 'N/A'}</td>
                        </tr>
                    </tbody>
                </table>


                <h3 className="view-details-section-heading">Accommodation Detail</h3>
                <table className="view-details-detail-table">
                    <thead>
                        <tr>
                            <th>PKG-TYPE</th>
                            <th>City</th>
                            <th>Hotel</th>
                            <th>Check-in Date</th>
                            <th>Check-out Date</th>
                            <th>Nights</th>
                            <th>Room Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        {voucher.hotels && voucher.hotels.length > 0 ? (
                            voucher.hotels.map((hotel, index) => (
                                <tr key={index}>
                                    <td>{hotel.hotel_head || 'ALL'}</td>
                                    <td>{hotel.city}</td>
                                    <td>{hotel.hotel_name}</td>
                                    <td>{hotel.checking_date}</td>
                                    <td>{hotel.checkout_date}</td>
                                    <td>{hotel.nights}</td>
                                    <td>{hotel.room_type}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" style={{ textAlign: 'center' }}>No hotel information</td>
                            </tr>
                        )}
                    </tbody>
                </table>


                <h3 className="view-details-section-heading">Transportation Detail</h3>
                <table className="view-details-detail-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Transport Trip</th>
                            <th>Transport By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {voucher.transportations && voucher.transportations.length > 0 ? (
                            voucher.transportations.map((transport, index) => (
                                <tr key={index}>
                                    <td>{transport.date}</td>
                                    <td>{transport.from_location}</td>
                                    <td>{transport.type_of_transfer}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center' }}>No transportation information</td>
                            </tr>
                        )}
                    </tbody>
                </table>


                <h3 className="view-details-section-heading">Mutamers (Pilgrims) Detail</h3>
                <table className="view-details-detail-table">
                    <thead>
                        <tr>
                            <th>PILGRIM NAME</th>
                            <th>PASSPORT</th>
                            <th>GROUP NAME</th>
                        </tr>
                    </thead>
                    <tbody>
                        {voucher.mautamers && voucher.mautamers.length > 0 ? (
                            voucher.mautamers.map((mautamer, index) => (
                                <tr key={index}>
                                    <td>{mautamer.pax_name}</td>
                                    <td>{mautamer.passport}</td>
                                    <td>{voucher.groupName || 'N/A'}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="3" style={{ textAlign: 'center', padding: '20px' }}>
                                    No pilgrim information available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </>
    );
}