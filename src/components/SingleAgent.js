import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import './CdrReport.css';
import * as XLSX from 'xlsx';
import 'font-awesome/css/font-awesome.min.css';
import Header from './Header';
import Footer from './Footer';

const AgentDetailPage = () => {
    const { agentName } = useParams();
    const [cdrData, setCdrData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('00:00');
    const [endTime, setEndTime] = useState('23:59');
    const [selectedCallType, setSelectedCallType] = useState('all');
    const [selectedDisposition, setSelectedDisposition] = useState('all');
    const [showDateSelector, setShowDateSelector] = useState(true);
    const [noDataMessage, setNoDataMessage] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedRecording, setSelectedRecording] = useState('');
    const [managerId, setManagerId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedManagerId = localStorage.getItem('manager_id');
        if (storedManagerId) {
            setManagerId(storedManagerId);
        }
    }, []);

    const fetchCdrData = async () => {
        if (!managerId) {
            setError('Manager ID is missing');
            return;
        }

        if (!startDate || !endDate || !startTime || !endTime) {
            setError('Please select both start and end dates.');
            return;
        }

        setLoading(true);
        setError('');
        setNoDataMessage('');

        try {
            const response = await axios.get(
                `http://localhost:7700/api/cdr/${agentName}`,
                {
                    params: {
                        startDate,
                        endDate,
                        startTime,
                        endTime,
                        calltype: selectedCallType === 'all' ? undefined : selectedCallType,
                        agentDisposition: selectedDisposition === 'all' ? undefined : selectedDisposition,
                    },
                }
            );

            if (Array.isArray(response.data.cdr_data) && response.data.cdr_data.length > 0) {
                setCdrData(response.data.cdr_data);
                setShowDateSelector(false);
            } else {
                setNoDataMessage('No data available');
                setCdrData([]);
            }
        } catch (err) {
            console.error('Error fetching CDR data:', err);
            setError('Failed to fetch CDR data');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) {
            return ' ';
        }
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const downloadExcel = () => {
        const headers = [
            'S.N.', 'Call Date/Time', 'Call-Type', 'Customer-Number',
            'Agent', 'Agent-Dial-Start', 'Agent-Answered-At', 'Agent-Disconnected-At', 'Agent-Duration', 'Customer-Duration',
            'Customer-Dial-Start', 'Customer-Answered-At', 'Customer-Disconnected-At', 'Agent-Disposition',
            'Customer-Disposition', 'Recording...', 'API-Response'
        ];
        const dataWithHeaders = cdrData.map((cdr, index) => ({
            'S.N.': index + 1,
            'Call Date/Time': formatDate(cdr.call_datetime),
            'Call-Type': cdr.calltype,
            'Customer-Number': cdr.custphone,
            'Agent': cdr.agent,
            'Agent-Dial-Start': formatDate(cdr.agent_dial_start),
            'Agent-Answered-At': formatDate(cdr.agent_answered_at),
            'Agent-Disconnected-At': formatDate(cdr.agent_disconnected_at),
            'Agent-Duration': cdr.agent_duration,
            'Customer-Duration': cdr.customer_duration,
            'Customer-Dial-Start': formatDate(cdr.customer_dial_start),
            'Customer-Answered-At': formatDate(cdr.customer_answered_at),
            'Customer-Disconnected-At': formatDate(cdr.customer_disconnected_at),
            'Agent-Disposition': cdr.agent_disposition,
            'Customer-Disposition': cdr.customer_disposition,
            'Recording...': cdr.recording_file,
            'API-Response': cdr.api_response

        }));
        const sheetData = [headers, ...dataWithHeaders.map(row => Object.values(row))];
        const ws = XLSX.utils.aoa_to_sheet(sheetData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'CDR Data');
        XLSX.writeFile(wb, 'CDR_Report.xlsx');
    };

    const handleBack = () => {
        setCdrData([]);
        setShowDateSelector(true);
        setNoDataMessage('');
    };

    const handleRecordingClick = (recordingUrl) => {
        setSelectedRecording(recordingUrl);
        setModalOpen(true);
    };

    const handleDownload = () => {
        if (selectedRecording) {
            const link = document.createElement('a');
            link.href = selectedRecording;
            link.download = selectedRecording.split('/').pop();
            link.click();
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleBackAgents = () => {
        navigate(-1)
    }

    return (
        <div>
            <Header />
            <div className="CdrReportPage">
                <h1 className="singleAgent_heading">CDR Report for {agentName}</h1>
                {cdrData.length > 0 && (
                    <div className="total-records_container">
                        <p className="total_records">Total Records: {cdrData.length}</p>
                    </div>
                )}

                {showDateSelector && (
                    <div className="date-input-container">
                        <div className='select_start_date'>
                            <div className='label_container'>
                                <label className='select_type'>Start Date:</label>
                                <input
                                    className='select_option'
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <input
                                    className='select_time'
                                    type="time"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className='select_type'>End Date:</label>
                                <input
                                    className='select_option'
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <input
                                    className='select_time'
                                    type="time"
                                    value={endTime}
                                    onChange={(e) => setEndTime(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <div className='label_container'>
                                <label className='select_type'>Call Type:</label>
                                <select
                                    value={selectedCallType}
                                    onChange={(e) => setSelectedCallType(e.target.value)}
                                    className='select_option'>
                                    <option value="all">All</option>
                                    <option value="Incomming Call">Incomming Call</option>
                                    <option value="outbound">Outbound</option>
                                </select>
                            </div>

                            <div>
                                <label className='select_type'>Call Status:</label>
                                <select
                                    value={selectedDisposition}
                                    onChange={(e) => setSelectedDisposition(e.target.value)}
                                    className='select_option'>
                                    <option value="all">All</option>
                                    <option value="ANSWERED">Answered</option>
                                    <option value="NO ANSWER">No Answer</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {!loading && !cdrData.length && !noDataMessage && (
                    <div>
                        <button className='cdr_back_dwldbtn_back' onClick={handleBackAgents}>Back</button>
                        <button onClick={fetchCdrData} disabled={loading} className='cdr_back_dwldbtn'>
                            {loading ? 'Loading...' : 'Get Data'}
                        </button>
                    </div>
                )}

                {error && <p className="error-message">{error}</p>}

                {noDataMessage && (
                    <div>
                        <p className="no_data_message">{noDataMessage}</p>
                        <button onClick={handleBack} className='cdr_back_dwldbtn'>Back</button>
                    </div>
                )}

                {cdrData.length > 0 && (
                    <div className="buttons-container">
                        <button onClick={handleBack} className='cdr_back_dwldbtn'>Back</button>
                        <button onClick={downloadExcel} className='cdr_back_dwldbtn'>Download</button>
                    </div>
                )}

                {cdrData.length > 0 && (
                    <table className={modalOpen ? 'blurred' : 'cdr_table'} >
                        <thead>
                            <tr>
                                <th>S.N.</th>
                                <th>Call Date/Time</th>
                                <th>Call-Type</th>
                                <th>Customer-Number</th>
                                <th>Agent</th>
                                <th>Agent-Dial-Start</th>
                                <th>Agent-Answered-At</th>
                                <th>Agent-Disconnected-At</th>
                                <th>Agent-Duration</th>
                                <th>Customer-Duration</th>
                                <th>Customer-Dial-Start</th>
                                <th>Customer-Answered-At</th>
                                <th>Customer-Disconnected-At</th>
                                <th>Agent-Disposition</th>
                                <th>Customer-Disposition</th>
                                <th>Recording...</th>
                                <th>API-Response</th>

                            </tr>
                        </thead>
                        <tbody className='cdr_tbody'>
                            {cdrData.map((cdr, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{formatDate(cdr.call_datetime)}</td>
                                    <td>{cdr.calltype}</td>
                                    <td>{cdr.custphone}</td>
                                    <td>{cdr.agent}</td>
                                    <td>{formatDate(cdr.agent_dial_start)}</td>
                                    <td>{formatDate(cdr.agent_answered_at)}</td>
                                    <td>{formatDate(cdr.agent_disconnected_at)}</td>
                                    <td>{cdr.agent_duration}</td>
                                    <td>{cdr.customer_duration}</td>
                                    <td>{formatDate(cdr.customer_dial_start)}</td>
                                    <td>{formatDate(cdr.customer_answered_at)}</td>
                                    <td>{formatDate(cdr.customer_disconnected_at)}</td>
                                    <td>{cdr.agent_disposition}</td>
                                    <td>{cdr.customer_disposition}</td>
                                    <td onClick={() => handleRecordingClick(cdr.recording_file)} className='custom_recording'>
                                        {cdr.recording_file}
                                    </td>
                                    <td>{cdr.api_response}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {modalOpen && (
                <div className="modal" onClick={handleCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <span className="close-btn" onClick={() => setModalOpen(false)}>
                            &times;
                        </span>
                        <span className='close_x_btn' onClick={handleCloseModal}>
                            <i className="fas fa-close"></i>
                        </span>
                        <h3 className='model_heading'>Recording...</h3>
                        <audio controls>
                            <source src={selectedRecording} type="audio/mpeg" />
                            Your browser does not support the audio element.
                        </audio>
                        <button onClick={handleDownload} className="download_btn">
                            <i className="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default AgentDetailPage;
