import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './Login/Login';
import AdminDashboard from './Admin/AdminDashboard';
import ProfesorDashboard from './Profesor/ProfesorDashboard';
import StudentDashboard from './Student/StudentDashboard';
import Lendet from './Student/lendet';
import IdeaPage from './Student/Ide'; 
import DorezimPage from './Student/Dorezimi';
import StudentProfile from './Student/profile';
import Projekti from './Student/projekti';
import Feedback from './Student/feedback';






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
          <Route path="/" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/profesor" element={<ProfesorDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/lendet/:yearId" element={<Lendet />} />
          <Route path="/student/ide" element={<IdeaPage />} />
          <Route path="/student/dorezimi" element={<DorezimPage />} />
          <Route path="/student/profile" element={<StudentProfile />} /> 
          <Route path="/student/projekti" element={<Projekti />} />
          <Route path="/student/feedback" element={<Feedback />} />
    

        // ketu shtohen rruget e reja

        </Routes>
      </div>
    </Router>
  );
}

export default App;
