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
import DorzimiProjektit from './Student/dorzimiProjektit';

// Profesor imports
import Lendetp from './Profesor/lendetp';
import Idetep from './Profesor/idetep';
import Dorezimip from './Profesor/dorezimip';
import Profilep from './Profesor/profilep';
import Projektip from './Profesor/projektip';
import Feedbackp from './Profesor/feedback';
import DoreziметStudentesh from './Profesor/dorezimet-studentesh';




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

          {/* Profesor routes */}
          <Route path="/profesor" element={<ProfesorDashboard />} />
          <Route path="/profesor/dashboard" element={<ProfesorDashboard />} />
          <Route path="/profesor/lendet/:yearId" element={<Lendetp />} />
          <Route path="/profesor/idete" element={<Idetep />} />
          <Route path="/profesor/dorezimi" element={<Dorezimip />} />
          <Route path="/profesor/dorezimet-studentesh" element={<DoreziметStudentesh />} />
          <Route path="/profesor/profile" element={<Profilep />} />
          <Route path="/profesor/projekti" element={<Projektip />} />
          <Route path="/profesor/feedback" element={<Feedbackp />} />

          {/* Student routes */}
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/lendet/:yearId" element={<Lendet />} />
          <Route path="/student/ide" element={<IdeaPage />} />
          <Route path="/student/dorezimi" element={<DorezimPage />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/projekti" element={<Projekti />} />
          <Route path="/student/feedback" element={<Feedback />} />

          <Route path="/student/dorzimiProjektit" element={<DorzimiProjektit />} />


        // ketu shtohen rruget e reja



        </Routes>
      </div>
    </Router>
  );
}

export default App;
