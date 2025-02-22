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

  const managerId = localStorage.getItem('manager_id');
  const navigate = useNavigate();



  useEffect(() => {
    const fetchAgents = async () => {
      if (!managerId) {
        setError('Manager ID is missing');
        setLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/agents/`);

        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }

        const data = await response.json();
        const sortedAgents = data.agents.sort((a, b) => {
          return a.agent - b.agent;
        });

        setAgents(sortedAgents);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [managerId]);

  const handleAgentClick = (agentName) => {
    navigate(`/agent_details/${agentName}`);
  };

  const handleBackAgents = () => {
    navigate(-1)
  }

  const calculateTotals = () => {
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

  const totals = calculateTotals();


  const downloadExcel = () => {
    const headers = [
      'S.N.', 'Agent Name', 'Agent Mobile No', 'Status', 'Region',
      'Total Calls', 'Total Connected Calls', 'Total Not Connected Calls', 'Total Outbound Calls', 'Total Incomming Calls', 'Total Missed Outbound Calls',
      'Total Abandoned Calls'
    ];
    const dataWithHeaders = agents.map((agent, index) => ({
      'S.N.': index + 1,
      'Agent Name': agent.agentname,
      'Agent Mobile No': agent.agentmobile,
      'Status': agent.status,
      'Region': agent.region,
      'Total Calls': agent.totalCalls,
      'Total Connected Calls': agent.totalConnected || 0,
      'Total Not Connected Calls': agent.totalNotConnected,
      'Total Outbound Calls': agent.totaloutbound,
      'Total Incomming Calls': agent.totalincomming,
      'Total Missed Outbound Calls': agent.totalMissedOutbound,
      'Total Abandoned Calls': agent.totalAbandoned

    }));

    const totalRow = {
      'S.N.': 'Total',
      'Agent Name': '',
      'Agent Mobile No': '',
      'Status': '',
      'Region': '',
      'Total Calls': totals.totalCalls,
      'Total Connected Calls': totals.totalConnected,
      'Total Not Connected Calls': totals.totalNotConnected,
      'Total Outbound Calls': totals.totalOutbound,
      'Total Incomming Calls': totals.totalIncomming,
      'Total Missed Outbound Calls': totals.totalMissedOutbound,
      'Total Abandoned Calls': totals.totalAbandoned
    };
    const sheetData = [headers, ...dataWithHeaders.map(row => Object.values(row)),
      Object.values(totalRow)];
    const ws = XLSX.utils.aoa_to_sheet(sheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'CDR Data');
    XLSX.writeFile(wb, 'Agents..xlsx');
  };


  return (
    <div>
      <Header />

      <h2 className='agentpage_heading'>Agents</h2>
      <div className='buttons_container'>
        <button className='agent_back' onClick={handleBackAgents}>Back</button>
        <button onClick={downloadExcel} className='agent_dwldbtn'>Download</button>

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
                  <th className='tdregion'>Region</th>
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
                {agents.length > 0 ? (
                  agents.map((agent, index) => (
                    <tr key={agent.agent} onClick={() => handleAgentClick(agent.agentmobile)} className="clickable-row">
                      <td>{index + 1}</td>
                      <td>{agent.agentname}</td>
                      <td>{agent.agentmobile}</td>
                      <td>{agent.status}</td>
                      <td className='tdregion'>{agent.region}</td>
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
