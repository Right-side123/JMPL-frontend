import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Agent.css';
import Header from './Header';
import Footer from './Footer';
import * as XLSX from 'xlsx';
const API_URL = process.env.REACT_APP_API_URL;

const AgentPage = () => {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');
  const [searchQuery, setSearchQuery] = useState('');

  const managerId = localStorage.getItem('manager_id');
  const navigate = useNavigate();


  useEffect(() => {
    const currentDate = new Date().toISOString().split('T')[0];
    setStartDate(currentDate);
    setEndDate(currentDate);
  }, []);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!managerId) {
        setError('Manager ID is missing');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/agents`);
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }

        const allAgents = await response.json();


        const formattedStartDate = `${startDate} ${startTime}`;
        const formattedEndDate = `${endDate} ${endTime}`;

        const callDataResponse = await fetch(`${API_URL}/agents?start_date=${formattedStartDate}&end_date=${formattedEndDate}`);
        if (!callDataResponse.ok) {
          throw new Error('Failed to fetch call data for the selected range');
        }

        const callData = await callDataResponse.json();

        const callDataMap = new Map();
        callData.agents.forEach(agent => {
          callDataMap.set(agent.agentmobile, agent);
        });

        const mergedAgents = allAgents.agents.map(agent => {
          const callStats = callDataMap.get(agent.agentmobile) || {};
          return {
            ...agent,
            totalCalls: callStats.totalCalls || 0,
            totalConnected: callStats.totalConnected || 0,
            totalNotConnected: callStats.totalNotConnected || 0,
            totaloutbound: callStats.totaloutbound || 0,
            totalincomming: callStats.totalincomming || 0,
            totalMissedOutbound: callStats.totalMissedOutbound || 0,
            totalAbandoned: callStats.totalAbandoned || 0,
          };
        });

        setAgents(mergedAgents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [managerId, startDate, endDate, startTime, endTime]);


  const handleAgentClick = (agentName) => {
    navigate(`/agent_details/${agentName}`);
  };

  const handleBackAgents = () => {
    navigate(-1);
  };

  const calculateTotals = (agents) => {
    let totalCalls = 0;
    let totalConnected = 0;
    let totalNotConnected = 0;
    let totalOutbound = 0;
    let totalIncomming = 0;
    let totalMissedOutbound = 0;
    let totalAbandoned = 0;


    agents.forEach(agent => {
      totalCalls += parseInt(agent.totalCalls) || 0;
      totalConnected += parseInt(agent.totalConnected) || 0;
      totalNotConnected += parseInt(agent.totalNotConnected) || 0;
      totalOutbound += parseInt(agent.totaloutbound) || 0;
      totalIncomming += parseInt(agent.totalincomming) || 0;
      totalMissedOutbound += parseInt(agent.totalMissedOutbound) || 0;
      totalAbandoned += parseInt(agent.totalAbandoned) || 0;
    });

    return {
      totalCalls,
      totalConnected,
      totalNotConnected,
      totalOutbound,
      totalIncomming,
      totalMissedOutbound,
      totalAbandoned,
    };
  };

  const filteredAgents = agents.filter(agent =>
    agent.agentname.toLowerCase().includes(searchQuery.toLowerCase()) ||
    agent.agentmobile.includes(searchQuery)
  );

  const totals = calculateTotals(filteredAgents);
  const safeNumber = (num) => (num !== undefined && num !== null ? Number(num) : 0);


  const downloadExcel = () => {

    const formattedStartDate = `${startDate} ${startTime}`;
    const formattedEndDate = `${endDate} ${endTime}`;

    const dateTimeRow = [`Selected Date-Time Range:`, `${formattedStartDate} to ${formattedEndDate}`];

    const headers = [
      'S.N.', 'Agent Name', 'Agent Mobile No', 'Status', 'Region',
      'Total Calls', 'Total Connected Calls', 'Total Not Connected Calls', 'Total Outbound Calls', 'Total Incomming Calls', 'Total Missed Outbound Calls',
      'Total Abandoned Calls'
    ];
    const dataWithHeaders = filteredAgents.map((agent, index) => ({
      'S.N.': index + 1,
      'Agent Name': agent.agentname,
      'Agent Mobile No': agent.agentmobile,
      'Status': agent.status,
      'Region': agent.region,
      'Total Calls': safeNumber(agent.totalCalls),
      'Total Connected Calls': safeNumber(agent.totalConnected),
      'Total Not Connected Calls': safeNumber(agent.totalNotConnected),
      'Total Outbound Calls': safeNumber(agent.totaloutbound),
      'Total Incomming Calls': safeNumber(agent.totalincomming),
      'Total Missed Outbound Calls': safeNumber(agent.totalMissedOutbound),
      'Total Abandoned Calls': safeNumber(agent.totalAbandoned)
    }));

    const totalRow = {
      'S.N.': 'Total',
      'Agent Name': '',
      'Agent Mobile No': '',
      'Status': '',
      'Region': '',
      'Total Calls': safeNumber(totals.totalCalls),
      'Total Connected Calls': safeNumber(totals.totalConnected),
      'Total Not Connected Calls': safeNumber(totals.totalNotConnected),
      'Total Outbound Calls': safeNumber(totals.totalOutbound),
      'Total Incomming Calls': safeNumber(totals.totalIncomming),
      'Total Missed Outbound Calls': safeNumber(totals.totalMissedOutbound),
      'Total Abandoned Calls': safeNumber(totals.totalAbandoned)
    };
    const sheetData = [dateTimeRow, headers, ...dataWithHeaders.map(row => Object.values(row)),
      Object.values(totalRow)];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CDR Data');
    XLSX.writeFile(wb, 'Agents..xlsx');
  };

  return (
    <div>
      <Header />

      <h2 className="agentpage_heading">Agents</h2>
      <div className='top_fields'>

        <div></div>
        <div className="filter-container">
          <label className='select_type'>Start Date:</label>
          <input
            className='select_option'
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <input
            className='select_option_time'
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
          <label className='select_type'>End Date:</label>
          <input className='select_option'
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <input
            className='select_option_time'
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />


          <label className='select_type'>Search:</label>
          <input
            className='searchbox'
            type="text"
            placeholder="Search by name or mobile"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />


        </div>

        <div className="buttons_container">
          <button className="agent_back" onClick={handleBackAgents}>Back</button>
          <button onClick={downloadExcel} className="agent_dwldbtn">Download</button>
        </div>
      </div>

      <div className="agent-container">
        <div className="agent-content">
          {loading ? (
            <p>Loading agents...</p>
          ) : error ? (
            <p>Error: {error}</p>
          ) : (
            <table className="agents-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Agent Name</th>
                  <th>Agent Mobile No</th>
                  <th>Status</th>
                  <th className="tdregion">Region</th>
                  <th>Total Calls</th>
                  <th>Total Connected</th>
                  <th>Total Not Connected</th>
                  <th>Total Outbound</th>
                  <th>Total Incomming</th>
                  <th>Total Missed Outbound</th>
                  <th>Total Abandoned</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgents.length > 0 ? (
                  filteredAgents.map((agent, index) => (
                    <tr key={agent.agentmobile} onClick={() => handleAgentClick(agent.agentmobile)} className="clickable-row">
                      <td>{index + 1}</td>
                      <td>{agent.agentname}</td>
                      <td>{agent.agentmobile}</td>
                      <td>{agent.status}</td>
                      <td className="tdregion">{agent.region}</td>
                      <td>{agent.totalCalls || 0}</td>
                      <td>{agent.totalConnected || 0}</td>
                      <td>{agent.totalNotConnected || 0}</td>
                      <td>{agent.totaloutbound || 0}</td>
                      <td>{agent.totalincomming || 0}</td>
                      <td>{agent.totalMissedOutbound || 0}</td>
                      <td>{agent.totalAbandoned || 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="12">No agents available.</td>
                  </tr>
                )}
                <tr>
                  <td colSpan="5"><strong>Total</strong></td>
                  <td>{totals.totalCalls}</td>
                  <td>{totals.totalConnected}</td>
                  <td>{totals.totalNotConnected}</td>
                  <td>{totals.totalOutbound}</td>
                  <td>{totals.totalIncomming}</td>
                  <td>{totals.totalMissedOutbound}</td>
                  <td>{totals.totalAbandoned}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AgentPage;
