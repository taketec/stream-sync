import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login'; // Import your Login component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Add other routes here, e.g., */}
        {/* <Route path="/" element={<Home />} />  */}
      </Routes>
    </Router>
  );
}

export default App;