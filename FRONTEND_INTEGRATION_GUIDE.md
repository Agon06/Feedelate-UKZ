# Frontend API Integration - Pas Refaktorimit

## 📋 API Endpoints të Unifikuara

Këto janë endpoints-et e **reja dhe të unifikuara** që frontend duhet të përdorë.

---

## 🔗 Endpoints për Profesor

### 1. Dashboard - Të Gjitha Vitet Akademike
```javascript
// GET /profesor/:id/dashboard
const response = await fetch(`/api/profesor/${profesorId}/dashboard`);
const data = await response.json();

// Response:
{
  profesor: {
    id: 1,
    emri: "Test",
    mbiemri: "Profesor",
    fullName: "Test Profesor"
  },
  years: [
    {
      id: "1",
      label: "Viti I",
      semesters: [1, 2],
      totalSubjects: 5,
      electiveSubjects: 0
    },
    // ...
  ]
}
```

---

### 2. Merr Lëndët për një Vit Akademik
```javascript
// GET /profesor/:id/lendet/:yearId
const response = await fetch(`/api/profesor/${profesorId}/lendet/1`);
const data = await response.json();

// Response:
{
  profesor: { ... },
  year: { id: "1", title: "Viti I" },
  semesters: [
    {
      id: 1,
      name: "Semestri 1",
      subjects: [
        { id: 1, name: "Algoritmet dhe Strukturat e të Dhënave", isElective: false },
        { id: 2, name: "Programimi OOP", isElective: false }
      ]
    },
    // ...
  ],
  electives: [
    { id: 3, name: "Inteligjenca Artificiale", semester: 4 }
  ]
}
```

---

### 3. Merr Të Gjitha Idetë për Lëndën
```javascript
// GET /profesor/:id/idet?lendaId=1
const response = await fetch(`/api/profesor/${profesorId}/idet?lendaId=1`);
const ideas = await response.json();

// Response:
[
  {
    id: 1,
    title: "Algoritmi i Sortimit të Shpejtë",
    shorthand: "quicksort",
    subject: { id: 1, name: "Algoritmet" },
    type: "student",
    studentName: "Arben Shala",
    createdAt: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    title: "Përforcimi i Algoritmi të Bashkimit",
    shorthand: "mergesort",
    subject: { id: 1, name: "Algoritmet" },
    type: "profesor",
    studentName: null,
    createdAt: "2024-01-14T14:20:00Z"
  },
  // ...
]
```

**Për renderim në React:**
```jsx
const idesByType = {
  student: ideas.filter(i => i.type === 'student'),
  profesor: ideas.filter(i => i.type === 'profesor')
};

return (
  <>
    <h3>Idetë e Studentëve</h3>
    {idesByType.student.map(idea => (
      <div key={idea.id}>
        <strong>{idea.title}</strong> - nga {idea.studentName}
      </div>
    ))}
    
    <h3>Idetë e Profesorit</h3>
    {idesByType.profesor.map(idea => (
      <div key={idea.id}>
        <strong>{idea.title}</strong>
      </div>
    ))}
  </>
);
```

---

### 4. Shto Ide për Profesorin
```javascript
// POST /profesor/:id/idet
const response = await fetch(`/api/profesor/${profesorId}/idet`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lendaId: 1,
    titulli: "Inovacion në Cloud Computing",
    shkurtesa: "cloud-innov"
  })
});

const newIdea = await response.json();
// Response:
{
  id: 100,
  title: "Inovacion në Cloud Computing",
  shorthand: "cloud-innov",
  subject: { id: 1, name: "Algoritmet" },
  createdAt: "2024-01-20T12:00:00Z"
}
```

---

### 5. Ngarko Dorezim (Template ose Ide)
```javascript
// POST /profesor/:id/dorezime
const formData = new FormData();
formData.append('file', file); // File object
formData.append('lendaId', 1);
formData.append('isShabllon', true); // Nëse është template

const response = await fetch(`/api/profesor/${profesorId}/dorezime`, {
  method: 'POST',
  body: formData
});

const result = await response.json();
// Response:
{
  id: 50,
  fileName: "Shabllon-Detyrë.docx",
  filePath: "uploads/dorezime/dorezim-1234567890-987654321.docx",
  isShabllon: true,
  createdAt: "2024-01-20T14:30:00Z"
}
```

---

### 6. Merr Dorezimeat e Studentëve për Vlerësim
```javascript
// GET /profesor/:id/dorezime-studentesh/:lendaId
const response = await fetch(`/api/profesor/${profesorId}/dorezime-studentesh/1`);
const data = await response.json();

// Response:
{
  lenda: { id: 1, name: "Algoritmet dhe Strukturat e të Dhënave" },
  submissions: [
    {
      id: 1,
      student: {
        id: 5,
        emri: "Arben",
        mbiemri: "Shala",
        fullName: "Arben Shala"
      },
      fileName: "Dorezim-Arben-Shala.docx",
      fileDorezimi: "uploads/dorezime/dorezim-1234567890.docx",
      fileUrl: "/uploads/dorezime/dorezim-1234567890.docx",
      createdAt: "2024-01-18T15:45:00Z"
    },
    // ...
  ]
}
```

**React component për shfaqje:**
```jsx
function DorezimStudentesh({ profesorId, lendaId }) {
  const [submissions, setSubmissions] = useState([]);
  
  useEffect(() => {
    fetch(`/api/profesor/${profesorId}/dorezime-studentesh/${lendaId}`)
      .then(r => r.json())
      .then(data => setSubmissions(data.submissions));
  }, [profesorId, lendaId]);
  
  return (
    <div>
      {submissions.map(sub => (
        <div key={sub.id}>
          <strong>{sub.student.fullName}</strong>
          <a href={sub.fileUrl} download>{sub.fileName}</a>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔗 Endpoints për Student

### 1. Merr Lëndët e Disponueshme
```javascript
// GET /student/:id/lendet
const response = await fetch(`/api/student/${studentId}/lendet`);
const lendet = await response.json();

// Response:
[
  { id: 1, name: "Algoritmet", profesor: { id: 1, name: "Test Profesor" } },
  { id: 2, name: "OOP", profesor: { id: 1, name: "Test Profesor" } }
]
```

---

### 2. Shto Idea
```javascript
// POST /student/:id/idete
const response = await fetch(`/api/student/${studentId}/idete`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    lendaId: 1,
    titulli: "Algoritmi i Sortimit të Shpejtë",
    shkurtesa: "quicksort"
  })
});

const newIdea = await response.json();
```

---

### 3. Ngarko Dorezim të Idese
```javascript
// POST /student/:id/dorezime-ideje
const formData = new FormData();
formData.append('file', file);
formData.append('ideaId', 1);

const response = await fetch(`/api/student/${studentId}/dorezime-ideje`, {
  method: 'POST',
  body: formData
});

const result = await response.json();
```

---

## 🔄 Migrimi i Frontend Services

### Hera e Vjetër (Me Duplikate)
```javascript
// services/profesorApi.js - STARI QASJE
export const getProfessorSubjects = (id) => {
  // Kërkonte në lendetp
  return fetch(`/api/profesor/${id}/lendetp`)
    .then(r => r.json());
};

export const getProfessorIdeas = (id) => {
  // Kërkonte në idetep
  return fetch(`/api/profesor/${id}/idetep`)
    .then(r => r.json());
};
```

### Rruga e Re (Unifikuar) ✨
```javascript
// services/profesorApi.js - RI-QASJA
export const getProfessorDashboard = (id) => {
  return fetch(`/api/profesor/${id}/dashboard`)
    .then(r => r.json());
};

export const getProfessorSubjectsForYear = (id, yearId) => {
  return fetch(`/api/profesor/${id}/lendet/${yearId}`)
    .then(r => r.json());
};

export const getAllIdeasForSubject = (id, lendaId) => {
  return fetch(`/api/profesor/${id}/idet?lendaId=${lendaId}`)
    .then(r => r.json());
};

export const getStudentSubmissionsForReview = (id, lendaId) => {
  return fetch(`/api/profesor/${id}/dorezime-studentesh/${lendaId}`)
    .then(r => r.json());
};
```

---

## 💡 Shembull i React Komponent të Plotë

```jsx
import React, { useState, useEffect } from 'react';

function ProfesorIdePanel({ profesorId, lendaId }) {
  const [ideas, setIdeas] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newShorthand, setNewShorthand] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadIdeas();
  }, [lendaId]);

  const loadIdeas = async () => {
    try {
      const response = await fetch(
        `/api/profesor/${profesorId}/idet?lendaId=${lendaId}`
      );
      const data = await response.json();
      setIdeas(data);
    } catch (error) {
      console.error('Error loading ideas:', error);
    }
  };

  const handleAddIdea = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newShorthand.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/profesor/${profesorId}/idet`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lendaId,
            titulli: newTitle,
            shkurtesa: newShorthand
          })
        }
      );
      const newIdea = await response.json();
      setIdeas([newIdea, ...ideas]);
      setNewTitle('');
      setNewShorthand('');
    } catch (error) {
      console.error('Error adding idea:', error);
    } finally {
      setLoading(false);
    }
  };

  const studentIdeas = ideas.filter(i => i.type === 'student');
  const profesorIdeas = ideas.filter(i => i.type === 'profesor');

  return (
    <div className="ideas-panel">
      <h2>Idetë për Lëndën</h2>

      {/* Forma për shtimin e ide të re */}
      <form onSubmit={handleAddIdea}>
        <input
          type="text"
          placeholder="Titulli i idese"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Shkurtesa (p.sh., quicksort)"
          value={newShorthand}
          onChange={(e) => setNewShorthand(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Duke shtuar...' : 'Shto Ide'}
        </button>
      </form>

      {/* Idetë e Studentëve */}
      <div>
        <h3>Idetë e Studentëve ({studentIdeas.length})</h3>
        {studentIdeas.length === 0 ? (
          <p>Nuk ka idetë nga studentët</p>
        ) : (
          studentIdeas.map(idea => (
            <div key={idea.id} className="idea-card">
              <strong>{idea.title}</strong>
              <p>Nga: {idea.studentName}</p>
              <small>{new Date(idea.createdAt).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>

      {/* Idetë e Profesorit */}
      <div>
        <h3>Idetë e Profesorit ({profesorIdeas.length})</h3>
        {profesorIdeas.length === 0 ? (
          <p>Nuk ka idetë</p>
        ) : (
          profesorIdeas.map(idea => (
            <div key={idea.id} className="idea-card">
              <strong>{idea.title}</strong>
              <small>{new Date(idea.createdAt).toLocaleDateString()}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProfesorIdePanel;
```

---

## 🧪 Testing me Postman

### Test 1: Dashboard
```
GET http://localhost:5000/api/profesor/1/dashboard
```

### Test 2: Merr Lëndët
```
GET http://localhost:5000/api/profesor/1/lendet/1
```

### Test 3: Merr Idetë
```
GET http://localhost:5000/api/profesor/1/idet?lendaId=1
```

### Test 4: Shto Ide
```
POST http://localhost:5000/api/profesor/1/idet
Content-Type: application/json

{
  "lendaId": 1,
  "titulli": "Idea Testimi",
  "shkurtesa": "test-idea"
}
```

### Test 5: Merr Dorezimeat e Studentëve
```
GET http://localhost:5000/api/profesor/1/dorezime-studentesh/1
```

---

## 🎯 Checklist i Përditësimit të Frontend-it

- [ ] Përditëso **profesorApi.js** - Hiq idetep dhe lendetp, përdor idet dhe lendet
- [ ] Përditëso **ProfesorDashboard.jsx** - Merr dashboard të unifikuar
- [ ] Përditëso **idetep.jsx** - Merr idetë nga `/idet` endpoint
- [ ] Përditëso **lendetp.jsx** - Merr lëndë nga `/lendet` endpoint
- [ ] Test në browser - Sigurohu se profesori dhe studenti shohin të njëjtat të dhëna
- [ ] Hiq API calls të vjetra të `_p` endpoints

---

**Përfundim**: Frontend duhet të kërkojë nëpër tabelat e unifikuara, jo nëpër tabela të duplikuara. Tani profesori dhe studenti komunikojnë përmes të njëjtave endpoints! 🎉
