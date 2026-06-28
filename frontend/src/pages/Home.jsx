import React from "react";   
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">

      <motion.div
        className="home-header"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1>
          TELEMEDICINE APPLICATION FOR <br />
          <span>ACCESSIBLE HEALTHCARE IN RURAL AREAS</span>
        </h1>

        <p>
          Consult verified doctors, book appointments instantly,
          and receive healthcare services remotely.
        </p>
      </motion.div>

      
      <div className="role-section">
        
        <motion.div className="role-card patient" whileHover={{ scale: 1.03 }}>
          <h2>For Patients</h2>
          <p>Book appointments and consult doctors online.</p>

          <div className="btn-group">
            <Link to="/patient/login" className="btn primary">
              Patient Login
            </Link>

            <Link to="/patient/register" className="btn outline">
              Patient Register
            </Link>
          </div>
        </motion.div>

        
        <motion.div className="role-card doctor" whileHover={{ scale: 1.03 }}>
          <h2>For Doctors</h2>
          <p>Manage appointments and provide consultations.</p>

          <div className="btn-group">
            <Link to="/doctor/login" className="btn primary">
              Doctor Login
            </Link>

            <Link to="/doctor/register" className="btn outline">
              Doctor Register
            </Link>
          </div>
        </motion.div>

      </div>

      
      <motion.div
        className="appointment-box"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <h3>⚡ Fast Appointment Booking</h3>
        <p> Search → Book → Consult with Specialist Doctors </p>
      </motion.div>

     
      <div className="admin-access">
        <Link to="/admin/login">Admin Access</Link>
      </div>

    </div>
  );
};

export default Home;
