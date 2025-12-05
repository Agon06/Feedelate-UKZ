import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Login from './Login/Login';
import AdminDashboard from './Admin/AdminDashboard';
import ProfesorDashboard from './Profesor/ProfesorDashboard';
import StudentDashboard from './Student/StudentDashboard';


function App() {
  return (
    <Router>
      <div className="App">
        {/* <nav>
          <ul>
            <li><Link to="/">Login</Link></li>
            <li><Link to="/admin">Admin</Link></li>
            <li><Link to="/profesor">Profesor</Link></li>
            <li><Link to="/student">Student</Link></li>
          </ul>
        </nav> */}

        <Routes>
          {/* For testing on the `test` branch we show the Student dashboard at root
              so you can view student UI without logging in. */}
          <Route path="/" element={<StudentDashboard />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profesor" element={<ProfesorDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
