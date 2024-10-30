import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; // Import your Login component
//import Register from './pages/Register';
import Room from './pages/Room';

function App() {
  return (
    <Router>
      <Routes>
        <Route 
            path="/login" 
            element={<Login />} />
        {/* Add other routes here, e.g., */}
        {/* <Route 
            path="/register" 
            element={<Register />} />   */}
        <Route 
            path="/room/:roomId" 
            element={<Room />}
        />  
        
        <Route
            exact
            path="/"
            element={<Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;