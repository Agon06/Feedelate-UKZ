import { useState, useEffect } from 'react';

const ProfesorDashboard = () => {
  const [profesoret, setProfesoret] = useState([]);

  useEffect(() => {
    // Fetch profesoret from API
    // fetch('http://localhost:5000/api/profesoret')
    //   .then(res => res.json())
    //   .then(data => setProfesoret(data));
  }, []);

  return (
    <div className="profesor-dashboard">
      <h1>Profesor Dashboard</h1>
      <p>Mirë se vini në panelin e profesorit</p>
    </div>
  );
};

export default ProfesorDashboard;
