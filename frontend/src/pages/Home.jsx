// Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

// Import images
import homePanel from '../assets/home_panel.png';
import controlDeliveries from '../assets/control_deliveries_remotely.png';
import combineOrders from '../assets/combine_orders.png';
import trackOrders from '../assets/track_orders.png';

const Home = () => (
  <div className="home-container">
    {/* Hero Section */}
    <section className="hero-section">
      <div className="hero-content">
        <h1 style={{ fontSize: '30px', fontWeight: '700' }}>Your Partner For Fleet Management!</h1>
        <p style={{ fontSize: '18px' }} className="hero-description">
          Streamline your delivery operations, schedule deliveries,optimize routes, and boost efficiency with our fleet managemnet system. Book and control HMV orders on the go.
        </p>
        <Link to="/login" className="btn btn-primary get-started-btn">
          Get Started
        </Link>
      </div>
      <img src={homePanel} alt="LogiFleet Dashboard" />
      {/* <div className="hero-image">
        
      </div> */}
    </section>

    {/* Features Section */}
    <section className="features-section">
      <h2 style={{ fontSize: '25px', fontWeight: '700' }}>Our Features</h2>
      <div className="feature-cards">
        <div className="feature-card">
          <div className="feature-image">
            <img src={controlDeliveries} alt="Control Deliveries" />
          </div>
          <div className="feature-content">
            <h3>Control Deliveries Remotely</h3>
            <p>Manage and monitor your delivery fleet in real-time from anywhere. Update routes, assign tasks, and respond to changes instantly.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-image">
            <img src={combineOrders} alt="Combine Orders" />
          </div>
          <div className="feature-content">
            <h3>Combine Orders</h3>
            <p>Optimize delivery efficiency by intelligently combining multiple orders into smart delivery routes, reducing costs and saving time.</p>
          </div>
        </div>

        <div className="feature-card">
          <div className="feature-image">
            <img src={trackOrders} alt="Track Orders" />
          </div>
          <div className="feature-content">
            <h3>Track Orders</h3>
            <p>Get real-time visibility of all your deliveries with precise tracking, status updates, and estimated arrival times.</p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Home;
