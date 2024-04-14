import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; // Import your Login component
import Register from './pages/Register';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Add other routes here, e.g., */}
        <Route path="/register" element={<Register />} />  
      </Routes>
    </Router>
  );
}

export default App;