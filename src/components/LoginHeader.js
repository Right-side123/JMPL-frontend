import './Header.css';
import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import 'font-awesome/css/font-awesome.min.css';

import rightsideLogo from './Assets/rightsidelogo.svg';

const LoginHeader = () => {
    // const navigate = useNavigate();
    const [dateTime, setDateTime] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const date = new Date();

            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');

            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');


            const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

            setDateTime(formattedDate);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    //   const handleLogout = () => {
    //     localStorage.removeItem('access_token');
    //     localStorage.removeItem('manager_id');

    //     localStorage.setItem('logout_event', Date.now());
    //     navigate('/');
    //   };

    return (
        <header className="header">
            <div className="header_content">
                <div className='header_firstdivlogo'>
                    <NavLink to="https://www.rightside.co.in" target='blank' className="header_logo">
                        <img src={rightsideLogo} alt='rightside_logo' className='header_rightside_logo' />
                    </NavLink>

                    <span className='date_time'>
                        <i className="fas fa-clock"></i> {dateTime}
                    </span>
                </div>
            </div>
        </header>
    );
};

export default LoginHeader;
