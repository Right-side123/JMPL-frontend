import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import Header from './Header';
import './Dashboard.css';
import 'font-awesome/css/font-awesome.min.css';
import agentimg from './Assets/Agent-PNG.png';
import cdrimg from './Assets/cdr.png';
import connectedimg from './Assets/connt.png';
import notconnectedimg from './Assets/notConnect.png';
import incomingimg from './Assets/incoming.png';
import outgoingimg from './Assets/outgoing.png';
import missedoutgoingimg from './Assets/outgoing-missed-call.png';
import missedimg from './Assets/missedcall.webp';
import Footer from './Footer';

const Dashboard = () => {

  const [agents, setAgents] = useState([]);
  const [totalCdr, setTotalCdrCount] = useState([]);
  const [connectedCalls, setConnectedCalls] = useState([]);
  const [notConnectedCalls, setNotConnectedCalls] = useState([]);
  const [totalInbound, setTotalInbound] = useState([]);
  const [outgoingCalls, setOutgoingCalls] = useState([]);
  const [failedCalls, setFailedCalls] = useState([]);
  const [missedCalls, setMissedCalls] = useState([]);
  const managerId = localStorage.getItem('manager_id');

  useEffect(() => {
    const fetchAgents = async () => {
      if (!managerId) {
        // setError('Manager ID is missing');
        // setLoading(false);
        return;
      }
      try {
        const response = await fetch('http://localhost:7700/api/agents');
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        const data = await response.json();
        setAgents(data.agents);
      } catch (err) {
        // setError(err.message);
      } finally {
        // setLoading(false);
      }
    };

    fetchAgents();
  });



  // Fetch Total CDR Count
  useEffect(() => {
    const fetchTotalCdrCount = async () => {
      if (!managerId) return;

      try {
        const response = await fetch('http://localhost:7700/api/totalcdr');
        if (!response.ok) {
          throw new Error('Failed to fetch total CDR count');
        }
        const data = await response.json();
        setTotalCdrCount(data.total_cdr_count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotalCdrCount();
  });


  // Fetch total inbound 

  useEffect(() => {
    const fetchTotalCdrCount = async () => {
      if (!managerId) return;

      try {
        const response = await fetch('http://localhost:7700/api/totalinbound');
        if (!response.ok) {
          throw new Error('Failed to fetch total CDR count');
        }
        const data = await response.json();
        setTotalInbound(data.total_cdr_count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotalCdrCount();
  });


  useEffect(() => {
    const fetchTotalCdrCount = async () => {
      if (!managerId) return;

      try {
        const response = await fetch('http://localhost:7700/api/totaloutbound');
        if (!response.ok) {
          throw new Error('Failed to fetch total CDR count');
        }
        const data = await response.json();
        setOutgoingCalls(data.total_cdr_count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotalCdrCount();
  });


  useEffect(() => {
    const fetchTotalCdrCount = async () => {
      if (!managerId) return;

      try {
        const response = await fetch('http://localhost:7700/api/totalconnected');
        if (!response.ok) {
          throw new Error('Failed to fetch total CDR count');
        }
        const data = await response.json();
        setConnectedCalls(data.total_cdr_count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotalCdrCount();
  });


  useEffect(() => {
    const fetchTotalCdrCount = async () => {
      if (!managerId) return;

      try {
        const response = await fetch('http://localhost:7700/api/totalnotconnected');
        if (!response.ok) {
          throw new Error('Failed to fetch total CDR count');
        }
        const data = await response.json();
        setNotConnectedCalls(data.total_cdr_count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotalCdrCount();
  });


  useEffect(() => {
    const fetchTotalCdrCount = async () => {
      if (!managerId) return;

      try {
        const response = await fetch('http://localhost:7700/api/totalmissedoutbound/');
        if (!response.ok) {
          throw new Error('Failed to fetch total CDR count');
        }
        const data = await response.json();
        setFailedCalls(data.total_cdr_count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotalCdrCount();
  });


  useEffect(() => {
    const fetchTotalCdrCount = async () => {
      if (!managerId) return;

      try {
        const response = await fetch('http://localhost:7700/api/totalmissed');
        if (!response.ok) {
          throw new Error('Failed to fetch total CDR count');
        }
        const data = await response.json();
        setMissedCalls(data.total_cdr_count);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTotalCdrCount();
  }, [managerId]);


  return (
    <div>
      <div className='container_Scroll'>
        <div>
          <Header />
          <div className="dashboard-container">
            <div className="dashboard-content">
              <h1 className="dashboard_heading">Your complete contact&nbsp;center solution</h1>

              <div className="card-container">
                <NavLink to="/agents" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container'>
                      <span className='card_heading'>Agents</span>
                      <img src={agentimg} alt='agent' className='agentpng' />
                    </div>
                    <p>Total agents: {agents.length}</p>
                    <button className="dashboard-button">View Agent</button>
                  </div>
                </NavLink>
                <NavLink to="/cdr_report" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container_cdr'>
                      <span className='card_heading'>Custom CDR</span>
                      <img src={cdrimg} alt='cdr' className='cdr_png' />
                    </div>
                    <p>Total CDR: {totalCdr}</p>

                    <button className="dashboard-button">View CDR</button>

                  </div>
                </NavLink>
                <NavLink to="/connected_calls" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container_connected'>
                      <span className='card_heading'>Connected Calls</span>
                      <img src={connectedimg} alt='connected' className='cdrpng' />
                    </div>
                    <p>Total connected call's: {connectedCalls} </p>

                    <button className="dashboard-button">Click here</button>

                  </div>
                </NavLink>
                <NavLink to="/notConnected_calls" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container_connected'>
                      <span className='card_heading'>Not Connected Calls</span>
                      <img src={notconnectedimg} alt='notconnected' className='cdrpng' />
                    </div>
                    <p>Total not connected call's: {notConnectedCalls}</p>

                    <button className="dashboard-button">Click here</button>

                  </div>
                </NavLink>
                <NavLink to="/inbound_calls" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container_incoming'>
                      <span className='card_heading'>Incoming Calls</span>
                      <img src={incomingimg} alt='incoming' className='incomingpng' />
                    </div>
                    {/* <h3>Incoming Calls</h3> */}
                    <p>Total incoming call's: {totalInbound}</p>

                    <button className="dashboard-button">View Calls</button>

                  </div>
                </NavLink>
                <NavLink to="/outbound_calls" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container_incoming'>
                      <span className='card_heading'>Outgoing Calls</span>
                      <img src={outgoingimg} alt='outgoing' className='incomingpng' />
                    </div>
                    {/* <h3>Outgoing Calls</h3> */}
                    <p>Total outgoing call's: {outgoingCalls}</p>

                    <button className="dashboard-button">View Calls</button>

                  </div>
                </NavLink>
                <NavLink to="/missed_calls" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container_failed'>
                      <span className='card_heading'>Missed Calls</span>
                      <img src={missedimg} alt='failed' className='failedpng' />
                    </div>
                    {/* <h3>Failed Calls</h3> */}
                    <p>Total missed call's: {missedCalls}</p>

                    <button className="dashboard-button">View Calls</button>

                  </div>
                </NavLink>
                <NavLink to="/Missed_Outbound_calls" target="_blank" className="navlink_link">
                  <div className="card">
                    <div className='heading_container_connected'>
                      <span className='card_heading'>Missed Outgoing Calls</span>
                      <img src={missedoutgoingimg} alt='failed' className='failedpng' />
                    </div>
                    {/* <h3>Failed Calls</h3> */}
                    <p>Total failed call's: {failedCalls}</p>

                    <button className="dashboard-button">View Calls</button>

                  </div>
                </NavLink>

              </div>
              {/* <div className='failed_card_container'>
               
              </div> */}

            </div>
          </div>
        </div>

      </div>
      <Footer />
    </div>
  );
};

export default Dashboard;
