// merr dhe shfaq te dhenat e profesorit nga API
import React, { useState, useEffect } from 'react';
import { getProfesorProfile } from '../services/profesorApi';

const Profilep = () => {
    const PROFESOR_ID = 1; // Në të ardhmen mund të vijë nga sesioni i autentikimit
    const [profesorData, setProfesorData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProfesorData = async () => {
            try {
                const data = await getProfesorProfile(PROFESOR_ID);
                setProfesorData(data);
            } catch (err) {
                setError(err?.message ?? 'Nuk u lexuan të dhënat e profesorit.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfesorData();
    }, [PROFESOR_ID]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div>
            <h1>Profili i Profesorit</h1>
            <p><strong>Emri:</strong> {profesorData.emri}</p>
            <p><strong>Mbiemri:</strong> {profesorData.mbiemri}</p>
            <p><strong>Email:</strong> {profesorData.email}</p>
            <p><strong>Departamenti:</strong> {profesorData.departamenti}</p>
            <p><strong>Grada:</strong> {profesorData.grada}</p>
            <p><strong>Telefoni:</strong> {profesorData.telefoni}</p>
        </div>
    );
};

export default Profilep;
