// merr dhe shfaq te dhenat e studentit nga API
import React, { useState, useEffect } from 'react';
import { getStudentProfile } from '../services/studentApi';

const StudentProfile = () => {
    const student = JSON.parse(localStorage.getItem('student') || '{}');
    if (!student.id) {
      window.location.href = '/';
      return null;
    }
    const STUDENT_ID = student.id; // Në të ardhmen mund të vijë nga sesioni i autentikimit
    const [studentData, setStudentData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudentData = async () => {
            try {
                const data = await getStudentProfile(STUDENT_ID);
                setStudentData(data);
            } catch (err) {
                setError(err?.message ?? 'Nuk u lexuan të dhënat e studentit.');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentData();
    }, [STUDENT_ID]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Student Profile</h1>
            <p><strong>Emri:</strong> {studentData.emri}</p>
            <p><strong>Mbiemri:</strong> {studentData.mbiemri}</p>
            <p><strong>Email:</strong> {studentData.email}</p>
            <p><strong>Nr ID Card:</strong> {studentData.nrIdCard}</p>
        </div>
    );
};

export default StudentProfile;