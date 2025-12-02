import { useState, useEffect } from 'react';

const StudentDashboard = () => {
  const [studentet, setStudentet] = useState([]);

  useEffect(() => {
    // Fetch studentet from API
    // fetch('http://localhost:5000/api/studentet')
    //   .then(res => res.json())
    //   .then(data => setStudentet(data));
  }, []);

  return (
    <div className="student-dashboard">
      <h1>Student Dashboard</h1>
      <p>Mirë se vini në panelin E AV..</p>
    </div>
  );
};

export default StudentDashboard;
