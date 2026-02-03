import { Header } from "../../components/Header";
import { useNavigate } from "react-router";
import { useEffect, useState } from "react";
import axios from 'axios';
import './CreateNewPage.css'

export function CreateNewPage() {
    const [vNo, setVNo] = useState('');
    const [groupName, setGroupName] = useState('');
    const [availableMautamers, setAvailableMautamers] = useState([]);
    const [selectedMautamerIds, setSelectedMautamerIds] = useState([]);
    const [loadingMautamers, setLoadingMautamers] = useState(false);
    const [departureDate, setDepartureDate] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [departTime, setDepartTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [sectorFrom, setSectorFrom] = useState('');
    const [sectorTo, setSectorTo] = useState('');
    const [departureFlightNo, setDepartureFlightNo] = useState('');
    const [departureFlight, setDepartureFlight] = useState('');
    const [departurePnr, setDeparturePnr] = useState('');
    const [nights, setNights] = useState(0);
    const [returnDate, setReturnDate] = useState('');
    const [returnTime, setReturnTime] = useState('');
    const [returnSectorFrom, setReturnSectorFrom] = useState('');
    const [returnSectorTo, setReturnSectorTo] = useState('');
    const [returnFlightNo, setReturnFlightNo] = useState('');
    const [returnFlight, setReturnFlight] = useState('');
    const [returnPnr, setReturnPnr] = useState('');
    const [shirka, setShirka] = useState('');
    const [iata, setIata] = useState('');
    const [serviceNo, setServiceNo] = useState('');
    const [hotels, setHotels] = useState([
        {
            hotel_head: '',
            city: '',
            checking_date: '',
            checkout_date: '',
            nights: '',
            hotel_name: '',
            room_type: ''
        }
    ]);
    const [transportations, setTransportations] = useState([
        {
            date: '',
            from_location: '',
            type_of_transfer: ''
        }
    ]);
    const [remarks, setRemarks] = useState('');
    const [loading, setLoading] = useState(false);

    const token = localStorage.getItem('access');
    const userName = localStorage.getItem('user-name');
    const navigateToLoginPage = useNavigate();
    const navigate = useNavigate();

    useEffect(() => {
        if (!token) {
            navigateToLoginPage('/');
        } else {

            fetchMautamers();
        }
    }, []);




    const fetchMautamers = async () => {
        try {
            setLoadingMautamers(true);

            const response = await axios.get('http://127.0.0.1:5000/api/agent/mautamers/', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            setAvailableMautamers(response.data);
            setLoadingMautamers(false);
        } catch (error) {
            console.error('Error fetching mautamers:', error);
            setLoadingMautamers(false);
        }
    };


    const toggleMautamerSelection = (mautamerId) => {
        setSelectedMautamerIds(prev => {
            if (prev.includes(mautamerId)) {

                return prev.filter(id => id !== mautamerId);
            } else {

                return [...prev, mautamerId];
            }
        });
    };

    const selectAllMautamers = () => {
        if (selectedMautamerIds.length === availableMautamers.length) {

            setSelectedMautamerIds([]);
        } else {

            setSelectedMautamerIds(availableMautamers.map(m => m.id));
        }
    };


    const calculateNights = () => {
        if (departureDate && returnDate) {
            const depart = new Date(departureDate);
            const returnD = new Date(returnDate);
            const diffTime = Math.abs(returnD - depart);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setNights(diffDays);
        }
    };


    const addNewHotel = () => {
        setHotels([...hotels, {
            hotel_head: '',
            city: '',
            checking_date: '',
            checkout_date: '',
            nights: '',
            hotel_name: '',
            room_type: ''
        }]);
    };


    const deleteHotel = (index) => {
        const updatedHotels = hotels.filter((_, i) => i !== index);
        setHotels(updatedHotels);
    };


    const updateHotel = (index, field, value) => {
        const updatedHotels = [...hotels];
        updatedHotels[index][field] = value;
        setHotels(updatedHotels);
    };


    const addNewTransportation = () => {
        setTransportations([...transportations, {
            date: '',
            from_location: '',
            type_of_transfer: ''
        }]);
    };


    const deleteTransportation = (index) => {
        const updatedTransportations = transportations.filter((_, i) => i !== index);
        setTransportations(updatedTransportations);
    };


    const updateTransportation = (index, field, value) => {
        const updatedTransportations = [...transportations];
        updatedTransportations[index][field] = value;
        setTransportations(updatedTransportations);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();


        if (!vNo) {
            alert('Please fill Voucher No');
            return;
        }

        if (!departureDate || !arrivalDate || !returnDate) {
            alert('Please fill all flight dates');
            return;
        }

        if (selectedMautamerIds.length === 0) {
            alert('Please select at least one Mautamer');
            return;
        }

        setLoading(true);

        try {
            const voucherData = {
                vNo: vNo,
                agentName: userName,
                groupName: groupName,


                mautamer_ids: selectedMautamerIds,


                flight_info: {
                    departure_date: departureDate,
                    arrival_date: arrivalDate,
                    sector_from: sectorFrom,
                    sector_to: sectorTo,
                    depart_time: departTime || '00:00:00',
                    arrival_time: arrivalTime || '00:00:00',
                    departure_flight_no: departureFlightNo,
                    departure_flight: departureFlight,
                    departure_pnr: departurePnr,
                    nights: nights,
                    return_date: returnDate,
                    return_time: returnTime || '00:00:00',
                    return_flight_no: returnFlightNo,
                    return_flight: returnFlight,
                    return_sector_from: returnSectorFrom,
                    return_sector_to: returnSectorTo,
                    return_pnr: returnPnr,
                    shirka: shirka,
                    iata: iata,
                    service_no: serviceNo
                },

                hotels: hotels.filter(hotel => hotel.city && hotel.hotel_name),


                transportations: transportations.filter(transport =>
                    transport.date && transport.from_location
                )
            };

            console.log('Submitting voucher:', voucherData);

            const response = await axios.post(
                'http://127.0.0.1:5000/vouchers/',
                voucherData,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            console.log('Response:', response.data);
            alert('Voucher created successfully!');


            navigate('/homepage');

        } catch (error) {
            console.error('Error creating voucher:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                alert(`Error: ${JSON.stringify(error.response.data)}`);
            } else {
                alert('Failed to create voucher. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Header />

            <div className="container">

                <section className="section">
                    <h2 className="section-title">Voucher Information</h2>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="vNo">Voucher No *</label>
                            <input
                                type="text"
                                id="vNo"
                                placeholder="Voucher No"
                                value={vNo}
                                onChange={(e) => setVNo(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="groupName">Group Name</label>
                            <input
                                type="text"
                                id="groupName"
                                placeholder="Group Name"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                            />
                        </div>
                    </div>
                </section>


                <section className="section">
                    <h2 className="section-title">Flight Information</h2>

                    <div className="subsection-title">Departure</div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="depart-date">Depart Date *</label>
                            <input
                                type="date"
                                id="depart-date"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="arrival-date">Arrival Date *</label>
                            <input
                                type="date"
                                id="arrival-date"
                                value={arrivalDate}
                                onChange={(e) => setArrivalDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="depart-time">Depart Time</label>
                            <input
                                type="time"
                                id="depart-time"
                                value={departTime}
                                onChange={(e) => setDepartTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="arrival-time">Arrival Time</label>
                            <input
                                type="time"
                                id="arrival-time"
                                value={arrivalTime}
                                onChange={(e) => setArrivalTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pnr-no-1">PNR No</label>
                            <input
                                type="text"
                                id="pnr-no-1"
                                placeholder="PNR No"
                                value={departurePnr}
                                onChange={(e) => setDeparturePnr(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="sector-from">Sector From</label>
                            <input
                                type="text"
                                id="sector-from"
                                placeholder="Sector From"
                                value={sectorFrom}
                                onChange={(e) => setSectorFrom(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sector-to">Sector To</label>
                            <input
                                type="text"
                                id="sector-to"
                                placeholder="Sector To"
                                value={sectorTo}
                                onChange={(e) => setSectorTo(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="flight-no">Flight No</label>
                            <input
                                type="text"
                                id="flight-no"
                                placeholder="Flight No"
                                value={departureFlightNo}
                                onChange={(e) => setDepartureFlightNo(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="flight">Flight</label>
                            <input
                                type="text"
                                id="flight"
                                placeholder="Flight"
                                value={departureFlight}
                                onChange={(e) => setDepartureFlight(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="subsection-title">Return</div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="return-date">Return Date *</label>
                            <input
                                type="date"
                                id="return-date"
                                value={returnDate}
                                onChange={(e) => setReturnDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="return-time">Return Time</label>
                            <input
                                type="time"
                                id="return-time"
                                value={returnTime}
                                onChange={(e) => setReturnTime(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="return-sector-from">Return Sector From</label>
                            <input
                                type="text"
                                id="return-sector-from"
                                placeholder="Return Sector From"
                                value={returnSectorFrom}
                                onChange={(e) => setReturnSectorFrom(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="return-sector-to">Return Sector To</label>
                            <input
                                type="text"
                                id="return-sector-to"
                                placeholder="Return Sector To"
                                value={returnSectorTo}
                                onChange={(e) => setReturnSectorTo(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="pnr-no-2">PNR No</label>
                            <input
                                type="text"
                                id="pnr-no-2"
                                placeholder="PNR No"
                                value={returnPnr}
                                onChange={(e) => setReturnPnr(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="return-flight-no">Flight No</label>
                            <input
                                type="text"
                                id="return-flight-no"
                                placeholder="Flight No"
                                value={returnFlightNo}
                                onChange={(e) => setReturnFlightNo(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="return-flight">Flight</label>
                            <input
                                type="text"
                                id="return-flight"
                                placeholder="Flight"
                                value={returnFlight}
                                onChange={(e) => setReturnFlight(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <button
                            type="button"
                            className="btn-count-nights"
                            onClick={calculateNights}
                        >
                            COUNT NIGHTS
                        </button>
                        <input
                            type="text"
                            className="nights-input"
                            value={nights}
                            readOnly
                        />
                    </div>

                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="shirka">Shirka</label>
                            <input
                                type="text"
                                id="shirka"
                                placeholder="Shirka"
                                value={shirka}
                                onChange={(e) => setShirka(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="iata">IATA</label>
                            <input
                                type="text"
                                id="iata"
                                placeholder="IATA"
                                value={iata}
                                onChange={(e) => setIata(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="service-no">Service No</label>
                            <input
                                type="text"
                                id="service-no"
                                placeholder="Service No"
                                value={serviceNo}
                                onChange={(e) => setServiceNo(e.target.value)}
                            />
                        </div>
                    </div>
                </section>

                <section className="section">
                    <h2 className="section-title">Select Mautamers *</h2>

                    {loadingMautamers ? (
                        <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
                            Loading mautamers...
                        </p>
                    ) : availableMautamers.length === 0 ? (
                        <div style={{
                            padding: '30px',
                            textAlign: 'center',
                            background: '#fff3cd',
                            border: '1px solid #ffc107',
                            borderRadius: '8px',
                            marginBottom: '20px'
                        }}>
                            <p style={{ color: '#856404', fontWeight: '500', marginBottom: '8px' }}>
                                No mautamers available
                            </p>
                            <p style={{ color: '#856404', fontSize: '14px' }}>
                                Please contact admin to upload mautamers for your account.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="section-header" style={{ marginBottom: '15px' }}>
                                <button
                                    type="button"
                                    className="btn-add-new"
                                    onClick={selectAllMautamers}
                                >
                                    {selectedMautamerIds.length === availableMautamers.length
                                        ? 'DESELECT ALL'
                                        : 'SELECT ALL'}
                                </button>
                                <span style={{ color: '#666', fontSize: '14px' }}>
                                    {selectedMautamerIds.length} of {availableMautamers.length} selected
                                </span>
                            </div>

                            <div className="mautamer-list">
                                {availableMautamers.map((mautamer) => (
                                    <div
                                        key={mautamer.id}
                                        className={`mautamer-item ${selectedMautamerIds.includes(mautamer.id) ? 'selected' : ''
                                            }`}
                                        onClick={() => toggleMautamerSelection(mautamer.id)}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedMautamerIds.includes(mautamer.id)}
                                            onChange={() => toggleMautamerSelection(mautamer.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <div className="mautamer-info">
                                            <strong>{mautamer.pax_name}</strong>
                                            <span className="passport-no">Passport: {mautamer.passport}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </section>


                <section className="section">
                    <h2 className="section-title">Hotels Detail</h2>

                    <div className="section-header">
                        <button
                            type="button"
                            className="btn-add-new"
                            onClick={addNewHotel}
                        >
                            ADD NEW +
                        </button>
                    </div>

                    {hotels.map((hotel, index) => (
                        <div key={index} className="hotel-row">
                            <div className="form-group">
                                <label htmlFor={`hotel-head-${index}`}>Hotel Head</label>
                                <input
                                    type="text"
                                    id={`hotel-head-${index}`}
                                    placeholder="Hotel Head"
                                    value={hotel.hotel_head}
                                    onChange={(e) => updateHotel(index, 'hotel_head', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`city-${index}`}>City</label>
                                <input
                                    type="text"
                                    id={`city-${index}`}
                                    placeholder="City"
                                    value={hotel.city}
                                    onChange={(e) => updateHotel(index, 'city', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`checkin-${index}`}>CheckIn</label>
                                <input
                                    type="date"
                                    id={`checkin-${index}`}
                                    value={hotel.checking_date}
                                    onChange={(e) => updateHotel(index, 'checking_date', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`checkout-${index}`}>Check-Out</label>
                                <input
                                    type="date"
                                    id={`checkout-${index}`}
                                    value={hotel.checkout_date}
                                    onChange={(e) => updateHotel(index, 'checkout_date', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`nights-${index}`}>Nights</label>
                                <input
                                    type="number"
                                    id={`nights-${index}`}
                                    placeholder="Nights"
                                    value={hotel.nights}
                                    onChange={(e) => updateHotel(index, 'nights', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`hotel-${index}`}>Hotel</label>
                                <input
                                    type="text"
                                    id={`hotel-${index}`}
                                    placeholder="Hotel Name"
                                    value={hotel.hotel_name}
                                    onChange={(e) => updateHotel(index, 'hotel_name', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`room-type-${index}`}>Room Type</label>
                                <select
                                    id={`room-type-${index}`}
                                    value={hotel.room_type}
                                    onChange={(e) => updateHotel(index, 'room_type', e.target.value)}
                                >
                                    <option value="">Select Room Type</option>
                                    <option value="single">Single Room</option>
                                    <option value="double">Double Room</option>
                                    <option value="triple">Triple Room</option>
                                    <option value="quad">Quad Room</option>
                                    <option value="family">Family Room</option>
                                </select>
                            </div>

                            {hotels.length > 1 && (
                                <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={() => deleteHotel(index)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}
                </section>


                <section className="section">
                    <h2 className="section-title">Transportation Detail</h2>

                    <div className="section-header-right">
                        <button
                            type="button"
                            className="btn-add-new"
                            onClick={addNewTransportation}
                        >
                            ADD NEW +
                        </button>
                    </div>

                    {transportations.map((transport, index) => (
                        <div key={index} className="transport-row">
                            <div className="form-group">
                                <label htmlFor={`transport-date-${index}`}>Date</label>
                                <input
                                    type="date"
                                    id={`transport-date-${index}`}
                                    value={transport.date}
                                    onChange={(e) => updateTransportation(index, 'date', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`transport-from-${index}`}>From</label>
                                <input
                                    type="text"
                                    id={`transport-from-${index}`}
                                    placeholder="From Location"
                                    value={transport.from_location}
                                    onChange={(e) => updateTransportation(index, 'from_location', e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor={`transport-type-${index}`}>Type of Transfer</label>
                                <select
                                    id={`transport-type-${index}`}
                                    value={transport.type_of_transfer}
                                    onChange={(e) => updateTransportation(index, 'type_of_transfer', e.target.value)}
                                >
                                    <option value="">Select Type</option>
                                    <option value="bus">Bus</option>
                                    <option value="car">Car</option>
                                    <option value="van">Van</option>
                                    <option value="taxi">Taxi</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {transportations.length > 1 && (
                                <button
                                    type="button"
                                    className="btn-delete"
                                    onClick={() => deleteTransportation(index)}
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                                    </svg>
                                </button>
                            )}
                        </div>
                    ))}

                    <div className="form-group-full">
                        <label htmlFor="remarks">Remarks</label>
                        <textarea
                            id="remarks"
                            rows="3"
                            placeholder="Remarks"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="submit-container">
                        <button
                            className="btn-submit"
                            onClick={handleSubmit}
                            disabled={loading || availableMautamers.length === 0}
                        >
                            {loading ? 'SUBMITTING...' : 'SUBMIT'}
                        </button>
                    </div>
                </section>
            </div>
        </>
    );
}