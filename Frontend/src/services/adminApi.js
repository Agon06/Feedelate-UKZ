const API_BASE_URL = 'http://localhost:5000/api/admin';

// Get all subjects
export const getAllSubjects = async () => {
    try {
        const url = `${API_BASE_URL}/lendet/all`;
        console.log('Fetching subjects from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`API Error: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('Successfully fetched subjects:', data);
        return data;
    } catch (error) {
        console.error('Error fetching subjects:', error);
        throw error;
    }
};

// Create a new subject
export const registerSubject = async (subjectData) => {
    try {
        const url = `${API_BASE_URL}/lendet`;
        const payload = {
            emriLendes: subjectData.subjectName,
            viti: parseInt(subjectData.year.split('-')[1]),
            semestri: parseInt(subjectData.semester.split('-')[1]),
            isZgjedhore: subjectData.type === 'zgjedhore'
        };
        
        console.log('Registering subject to:', url);
        console.log('Payload:', payload);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`Failed to register subject: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Successfully registered subject:', data);
        return data;
    } catch (error) {
        console.error('Error registering subject:', error);
        throw error;
    }
};

// Get subjects by year
export const getSubjectsByYear = async (year) => {
    try {
        const url = `${API_BASE_URL}/lendet/by-year/${year}`;
        console.log('Fetching subjects by year from:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
            throw new Error(`Failed to fetch subjects for this year: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Successfully fetched subjects by year:', data);
        return data;
    } catch (error) {
        console.error('Error fetching subjects by year:', error);
        throw error;
    }
};
