import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import LogiFleetLogo from '../assets/LogiFLeet_logo.png';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const isAuthenticated = !!user.token;
  const isLoginPage = location.pathname === '/login';
  const isRegisterPage = location.pathname === '/register';

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const renderNavLinks = () => {
    if (isLoginPage || isRegisterPage) {
      return null; // No buttons on login/register pages
    }

    if (isAuthenticated) {
      return (
        <div className="navbar-links">
          <button 
            onClick={handleLogout}
            className="nav-link btn btn-secondary"
          >
            Logout
          </button>
        </div>
      );
    }

    return (
      <div className="navbar-links">
        <Link to="/login" className="nav-link btn btn-primary">Sign In</Link>
      </div>
    );
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="navbar-brand">
          <img src={LogiFleetLogo} alt="LogiFleet" className="navbar-logo" />
        </Link>
        {renderNavLinks()}
      </div>
    </nav>
  );
};

export default Navbar; 