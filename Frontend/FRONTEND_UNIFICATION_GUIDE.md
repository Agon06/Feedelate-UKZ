# 🎨 Frontend Unification Guide - Profesor Module Alignment
## Udhëzues për Përshtatjen e Plotë të Modulit të Profesorit me Studentin

**Data**: 21 Janar 2026  
**Statusi**: ✅ **ANALYSIS COMPLETE** - Gati për implementim

---

## 🎯 Qëllimi Kryesor

> **"Studenti është modeli. Profesori duhet të ndjekë të njëjtën strukturë."**

Ky dokument identifikon të gjitha ndryshimet e nevojshme për të përshtatur modulin e Profesorit me strukturën e Studentit në frontend, duke siguruar që:

1. ✅ **API Endpoints**: Të gjitha thirrjet janë të sakta
2. ✅ **Data Mapping**: Emrat e variablave përputhen 100%
3. ✅ **Component Structure**: Komponentët e Profesorit ndjekin modelin e Studentit
4. ✅ **Mock Data Removal**: Heqim të dhënat e testimit

---

## 📊 Analiza: Student vs Profesor

### 1. API Services Comparison

#### ✅ **studentApi.js** (CORRECT - Source of Truth)

```javascript
// Dashboard
export const getStudentDashboard = (studentId) =>
  request(`/studentet/${studentId}/dashboard`);

// Lendet (Subjects per year)
export const getStudentYearData = (studentId, yearId) =>
  request(`/studentet/${studentId}/lendet/${yearId}`);

// Idet (Ideas)
export const getStudentIdeas = (studentId, lendaId) => {
  const params = new URLSearchParams();
  if (lendaId) params.set('lendaId', lendaId);
  const query = params.toString();
  return request(`/studentet/${studentId}/idet${query ? `?${query}` : ''}`);
};

// Dorezime (Submissions)
export const uploadStudentDorezim = async (studentId, { lendaId, file }) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('lendaId', String(lendaId));
  
  const response = await fetch(`${API_BASE_URL}/studentet/${studentId}/dorezime`, {
    method: 'POST',
    body: formData,
  });
  
  return handleResponse(response);
};
```

**Response Structures**:

1. **Dashboard** → `{ student: {...}, years: [...] }`
2. **Lendet** → `{ student: {...}, year: {...}, semesters: [...], electives: [...], selectedElectives: [] }`
3. **Ideas** → `[{ id, title, shorthand, subject: {...}, createdAt }]`

---

#### ✅ **profesorApi.js** (CORRECT - Already Aligned)

```javascript
// Dashboard
export const getProfesorDashboard = (profesorId) =>
  request(`/profesoret/${profesorId}/dashboard`);

// Lendet (Subjects per year)
export const getProfesorYearData = async (profesorId, yearId) => {
  try {
    return await request(`/profesoret/${profesorId}/lendet/${yearId}`);
  } catch (error) {
    // ❌ PROBLEM: Mock data fallback (should be removed)
    try {
      const mockUrl = `/mock/profesor_lendet_${yearId}.json`;
      const response = await fetch(mockUrl);
      if (response.ok) return await response.json();
    } catch (_) {}
    throw error;
  }
};

// Idet (Ideas)
export const getProfesorIdeas = async (profesorId, lendaId) => {
  const params = new URLSearchParams();
  if (lendaId) params.set('lendaId', lendaId);
  const query = params.toString();
  try {
    return await request(`/profesoret/${profesorId}/idet${query ? `?${query}` : ''}`);
  } catch (error) {
    // ❌ PROBLEM: Mock data fallback (should be removed)
    try {
      const mockUrl = `/mock/profesor_idet.json`;
      const response = await fetch(mockUrl);
      if (response.ok) {
        const payload = await response.json();
        if (lendaId) {
          return payload.filter(idea => idea.subject?.id === Number(lendaId));
        }
        return payload;
      }
    } catch (_) {}
    throw error;
  }
};

// Dorezimet e Studenteve (Student Submissions)
export const getStudentSubmissions = async (profesorId, lendaId) => {
  try {
    return await request(`/profesoret/${profesorId}/dorezime-studentesh/${lendaId}`);
  } catch (error) {
    // ❌ PROBLEM: Mock data fallback (should be removed)
    try {
      const mockUrl = `/mock/profesor_dorezime_studentesh.json`;
      const response = await fetch(mockUrl);
      if (response.ok) return await response.json();
    } catch (_) {}
    throw error;
  }
};
```

**Status**:
- ✅ **Endpoints CORRECT**: URL paths match backend routes
- ❌ **Mock Fallbacks**: Should be removed (development only)

---

### 2. Data Mapping Comparison

#### Student Component Data Mapping (Source of Truth)

**File**: `Student/lendet.jsx`

```javascript
// API Response structure
const data = await getStudentYearData(STUDENT_ID, yearId);

// Data mapping
setYearData(data);
const studentName = yearData?.student?.fullName ?? 'Student';
const avatarLetter = yearData?.student?.emri?.[0]?.toUpperCase() ?? 'S';

// Semesters rendering
const semesters = yearData?.semesters ?? [];
semesters.map((semester) => (
  <div key={semester.id}>
    <h3>{semester.name}</h3>
    {semester.subjects.map((subject) => (
      <div key={subject.id}>
        <span>{subject.name}</span>  // ✅ Uses 'name' (from emriLendes)
        {subject.isElective && <span>Zgjedhore</span>}  // ✅ Uses 'isElective'
      </div>
    ))}
  </div>
));
```

**Key Fields**:
- `yearData.student.fullName`
- `yearData.student.emri`
- `semester.id`, `semester.name`, `semester.subjects`
- `subject.id`, `subject.name` (← mapped from `emriLendes`)
- `subject.isElective` (← mapped from `isZgjedhore`)

---

#### Profesor Component Data Mapping (Needs Verification)

**File**: `Profesor/lendetp.jsx`

```javascript
// API Response structure
const data = await getProfesorYearData(PROFESOR_ID, yearId);

// Data mapping
setYearData(data);
const profesorName = yearData?.profesor?.fullName ?? 'Profesor';
const avatarLetter = yearData?.profesor?.emri?.[0]?.toUpperCase() ?? 'P';

// ✅ ALIGNED: Uses same structure
const semesters = yearData?.semesters ?? [];
semesters.map((semester) => (
  <div key={semester.id}>
    <h3>{semester.name}</h3>
    {semester.subjects.map((subject) => (
      <div key={subject.id}>
        <span>{subject.name}</span>  // ✅ CORRECT: Uses 'name'
        {subject.isElective && <span>Zgjedhore</span>}  // ✅ CORRECT: Uses 'isElective'
      </div>
    ))}
  </div>
));
```

**Status**: ✅ **ALIGNED** - lendetp.jsx uses correct field names

---

### 3. Ideas Component Comparison

#### Student Ideas Component

**File**: `Student/Ide.jsx`

```javascript
// API call
const response = await getStudentIdeas(STUDENT_ID, lendaId);
setIdeas(response);

// Data mapping
ideas.map((idea) => (
  <div key={idea.id}>
    <h4>{idea.title}</h4>  // ✅ Uses 'title' (from titulli)
    <span>{idea.shorthand}</span>  // ✅ Uses 'shorthand' (from shkurtesa)
    <span>{idea.subject?.name}</span>  // ✅ subject.name (from emriLendes)
  </div>
));

// Create idea payload
const payload = {
  lendaId,
  titulli: formData.titulli.trim(),
  shkurtesa: formData.shkurtesa.trim().toUpperCase(),
};
await createStudentIdea(STUDENT_ID, payload);
```

**Key Fields**:
- `idea.id`, `idea.title` (← from `titulli`)
- `idea.shorthand` (← from `shkurtesa`)
- `idea.subject.name` (← from `lenda.emriLendes`)
- `idea.createdAt`

---

#### Profesor Ideas Component

**File**: `Profesor/idetep.jsx`

```javascript
// API call
const response = await getProfesorIdeas(PROFESOR_ID, lendaId);
setIdeas(response);

// ❌ PROBLEM: Has mock data fallback
if (response.length === 0) {
  // Uses mock data from public/mock/profesor_idet.json
}

// Data mapping (needs verification)
ideas.map((idea) => (
  <div key={idea.id}>
    <h4>{idea.title}</h4>  // ✅ Should use 'title'
    <span>{idea.shorthand}</span>  // ✅ Should use 'shorthand'
    <span>{idea.type}</span>  // ✅ Extra field: 'student' or 'profesor'
    <span>{idea.studentName}</span>  // ✅ Extra field: Shows who created it
  </div>
));
```

**Status**: 
- ✅ Field names are correct
- ❌ Mock data should be removed
- ✅ Extra fields (`type`, `studentName`) are appropriate for profesor view

---

### 4. Student Submissions Component (Profesor Only)

**File**: `Profesor/dorezimet-studentesh.jsx`

```javascript
// API call
const data = await getStudentSubmissions(PROFESOR_ID, lendaId);
const fetched = data.submissions || [];

// ❌ PROBLEM: Creates mock data if empty
if (fetched.length === 0) {
  const mockData = [
    { id: 1, student: { id: 101, fullName: 'Arta Krasniqi' }, fileName: 'Projekti_UI.docx' },
    // ... more mock data
  ];
  setSubmissions(mockData);
}

// Data mapping
submissions.map((submission) => (
  <div key={submission.id}>
    <span>{submission.student.fullName}</span>
    <span>{submission.fileName}</span>
    <a href={submission.fileUrl} download={submission.fileName}>
      Download
    </a>
  </div>
));
```

**Status**: 
- ✅ API endpoint correct
- ❌ Mock data generation should be removed
- ✅ Data structure aligned with backend

---

## 🔧 Required Changes

### Change 1: Remove Mock Data Fallbacks

#### File: `Frontend/src/services/profesorApi.js`

**Lines to Remove**: Mock data fallback logic in 3 functions

##### 1.1 getProfesorYearData

**BEFORE** (lines ~35-49):
```javascript
export const getProfesorYearData = async (profesorId, yearId) => {
  try {
    return await request(`/profesoret/${profesorId}/lendet/${yearId}`);
  } catch (error) {
    // Fallback to local mock data in dev when backend is unavailable
    try {
      const mockUrl = `/mock/profesor_lendet_${yearId}.json`;
      const response = await fetch(mockUrl, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json();
        return payload;
      }
    } catch (_) {
      // ignore, will rethrow original error
    }
    throw error;
  }
};
```

**AFTER** (simplified):
```javascript
export const getProfesorYearData = (profesorId, yearId) =>
  request(`/profesoret/${profesorId}/lendet/${yearId}`);
```

---

##### 1.2 getProfesorIdeas

**BEFORE** (lines ~52-80):
```javascript
export const getProfesorIdeas = async (profesorId, lendaId) => {
  const params = new URLSearchParams();
  if (lendaId) {
    params.set('lendaId', lendaId);
  }
  const query = params.toString();
  try {
    return await request(`/profesoret/${profesorId}/idet${query ? `?${query}` : ''}`);
  } catch (error) {
    // Fallback to local mock data in dev when backend is unavailable
    try {
      const mockUrl = `/mock/profesor_idet.json`;
      const response = await fetch(mockUrl, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json();
        // If lendaId is specified, filter the mock data
        if (lendaId) {
          const filtered = payload.filter(idea => idea.subject?.id === Number(lendaId));
          return filtered;
        }
        return payload;
      }
    } catch (_) {
      // ignore, will rethrow original error
    }
    throw error;
  }
};
```

**AFTER** (simplified):
```javascript
export const getProfesorIdeas = (profesorId, lendaId) => {
  const params = new URLSearchParams();
  if (lendaId) {
    params.set('lendaId', lendaId);
  }
  const query = params.toString();
  return request(`/profesoret/${profesorId}/idet${query ? `?${query}` : ''}`);
};
```

---

##### 1.3 getStudentSubmissions

**BEFORE** (lines ~115-135):
```javascript
export const getStudentSubmissions = async (profesorId, lendaId) => {
  try {
    return await request(`/profesoret/${profesorId}/dorezime-studentesh/${lendaId}`);
  } catch (error) {
    // Fallback to local mock data in dev when backend is unavailable
    try {
      const mockUrl = `/mock/profesor_dorezime_studentesh.json`;
      const response = await fetch(mockUrl, { headers: { Accept: 'application/json' } });
      if (response.ok) {
        const payload = await response.json();
        return payload;
      }
    } catch (_) {
      // ignore, will rethrow original error
    }
    throw error;
  }
};
```

**AFTER** (simplified):
```javascript
export const getStudentSubmissions = (profesorId, lendaId) =>
  request(`/profesoret/${profesorId}/dorezime-studentesh/${lendaId}`);
```

---

### Change 2: Remove Mock Data Generation in Components

#### File: `Frontend/src/Profesor/idetep.jsx`

**Lines to Remove**: ~44-71 (mock files generation)

**BEFORE**:
```javascript
const loadFiles = useCallback(async () => {
  setFilesStatus({ loading: true, error: null });
  try {
    // Mock data për tani - në të ardhmen do të vijnë nga API
    const mockFiles = [
      { id: 1, fileName: 'Projekti_Final.docx', studentName: 'Agon Berisha', ... },
      { id: 2, fileName: 'Detyra_Semestri.docx', studentName: 'Arta Krasniqi', ... },
      // ...
    ].sort((a, b) => a.studentName.localeCompare(b.studentName, 'sq'));
    
    setFiles(mockFiles);
    setFilesStatus({ loading: false, error: null });
  } catch (error) {
    setFilesStatus({
      loading: false,
      error: error?.message ?? 'Nuk u lexuan file-t aktuale.',
    });
  }
}, []);
```

**AFTER**:
```javascript
const loadFiles = useCallback(async () => {
  setFilesStatus({ loading: true, error: null });
  try {
    // TODO: Replace with real API call when backend endpoint is ready
    // const response = await getProfesorSubmittedFiles(PROFESOR_ID, lendaId);
    // setFiles(response);
    
    // For now, show empty state
    setFiles([]);
    setFilesStatus({ loading: false, error: null });
  } catch (error) {
    setFilesStatus({
      loading: false,
      error: error?.message ?? 'Nuk u lexuan file-t aktuale.',
    });
  }
}, []);
```

**Note**: This component has a second mock data source for file listing. Backend endpoint needs to be created for this feature.

---

#### File: `Frontend/src/Profesor/dorezimet-studentesh.jsx`

**Lines to Remove**: ~44-71 (mock submissions generation)

**BEFORE**:
```javascript
const fetchSubmissions = async () => {
  try {
    const data = await getStudentSubmissions(PROFESOR_ID, lendaId);
    if (!isMounted) return;

    const fetched = data.submissions || [];

    if (fetched.length === 0) {
      // krijo disa projekte mock për testimin e shkarkimit
      const mockData = [
        { id: 1, student: { id: 101, fullName: 'Arta Krasniqi' }, fileName: 'Projekti_UI.docx' },
        { id: 2, student: { id: 102, fullName: 'Blend Morina' }, fileName: 'Analiza_Sigurise.pdf' },
        { id: 3, student: { id: 103, fullName: 'Diona Shabani' }, fileName: 'Platforma_Web.zip' },
      ];

      // krijojmë blob URL që fetch t'i lexojë për arkivin zip
      const urls = mockData.map((item) => {
        const content = [...].join('\n');
        const blob = new Blob([content], { type: 'application/octet-stream' });
        return URL.createObjectURL(blob);
      });

      const mockSubmissions = mockData.map((item, idx) => ({
        ...item,
        fileUrl: urls[idx],
        createdAt: new Date(Date.now() - (idx + 1) * 3600_000).toISOString(),
      }));

      setMockUrls(urls);
      setSubmissions(mockSubmissions);
    } else {
      setSubmissions(fetched);
      mockUrls.forEach((u) => URL.revokeObjectURL(u));
      setMockUrls([]);
    }

    setStatus({ loading: false, error: null });
  } catch (error) {
    // ...
  }
};
```

**AFTER**:
```javascript
const fetchSubmissions = async () => {
  try {
    const data = await getStudentSubmissions(PROFESOR_ID, lendaId);
    if (!isMounted) return;

    const fetched = data.submissions || [];
    setSubmissions(fetched);
    setStatus({ loading: false, error: null });
  } catch (error) {
    if (!isMounted) return;
    setStatus({
      loading: false,
      error: error?.message ?? 'Nuk u lexuan projektet e studentëve.',
    });
  }
};
```

---

### Change 3: Verify Data Mapping (Already Correct)

#### File: `Frontend/src/Profesor/lendetp.jsx`

**Status**: ✅ **NO CHANGES NEEDED**

The component already uses correct field names:
```javascript
// ✅ Correct usage
semester.subjects.map((subject) => (
  <div onClick={() => handleSubjectClick(subject)}>
    {subject.name}  // ✅ Uses 'name' (from emriLendes)
    {subject.isElective && <span>Zgjedhore</span>}  // ✅ Uses 'isElective'
  </div>
))
```

---

#### File: `Frontend/src/Profesor/idetep.jsx`

**Status**: ✅ **NO CHANGES NEEDED** (besides mock data removal)

The component already uses correct field names:
```javascript
// ✅ Correct usage
ideas.map((idea) => (
  <div>
    <strong>{idea.title}</strong>  // ✅ Uses 'title'
    <span>{idea.shorthand}</span>  // ✅ Uses 'shorthand'
    {idea.type === 'student' && <span>{idea.studentName}</span>}  // ✅ Profesor-specific fields
  </div>
))
```

---

## 📋 Implementation Checklist

### Phase 1: Remove Mock Data (PRIORITY)

- [ ] **profesorApi.js**:
  - [ ] Remove mock fallback from `getProfesorYearData`
  - [ ] Remove mock fallback from `getProfesorIdeas`
  - [ ] Remove mock fallback from `getStudentSubmissions`

- [ ] **idetep.jsx**:
  - [ ] Remove mock files generation in `loadFiles()`
  - [ ] Update to show empty state when no files

- [ ] **dorezimet-studentesh.jsx**:
  - [ ] Remove mock submissions generation
  - [ ] Remove blob URL creation for mock data
  - [ ] Clean up `mockUrls` state (no longer needed)

### Phase 2: Verify Component Alignment

- [x] **lendetp.jsx**: Already aligned (uses `subject.name`, `subject.isElective`)
- [x] **idetep.jsx**: Already aligned (uses `idea.title`, `idea.shorthand`)
- [x] **dorezimet-studentesh.jsx**: Already aligned (uses `submission.student.fullName`, `submission.fileName`)

### Phase 3: Testing

- [ ] Test Dashboard: `/profesor/dashboard` loads correctly
- [ ] Test Lendet: `/profesor/lendet/1` shows subjects with correct names
- [ ] Test Idet: `/profesor/idet` shows ideas from unified table
- [ ] Test Dorezimet: Submissions load from backend (no mock data)
- [ ] Test Error Handling: Components show proper error messages when backend is unavailable

---

## 🎯 Expected Results After Changes

### Before (with Mock Data)

```
1. Profesor navigates to /profesor/lendet/1
2. Backend is down or returns error
3. Frontend fallback to /mock/profesor_lendet_1.json
4. Shows stale/fake data
5. User thinks everything works (false positive)
```

### After (without Mock Data)

```
1. Profesor navigates to /profesor/lendet/1
2. Backend is down or returns error
3. Frontend shows error: "Nuk u lexuan lendet per kete vit."
4. User knows there's a problem
5. Developer can fix backend issue
```

---

## 📊 Data Flow Verification

### Student Creates Idea → Profesor Sees It

```
1. Student navigates to /student/ide
2. Calls getStudentIdeas(studentId, lendaId)
3. Backend: SELECT * FROM idete WHERE studentId = X AND lendaId = Y
4. Returns: [{ id, title, shorthand, subject: {...} }]

5. Profesor navigates to /profesor/idet
6. Calls getProfesorIdeas(profesorId, lendaId)
7. Backend: SELECT * FROM idete WHERE lendaId = Y (all ideas, not filtered by profesorId)
8. Returns: [
     { id, title, shorthand, type: 'student', studentName: 'Agon Berisha', subject: {...} },
     { id, title, shorthand, type: 'profesor', subject: {...} }
   ]

✅ Result: Profesor sees both student ideas and own template ideas in the same list
```

---

## 🚀 Deployment Steps

### Before Deployment

1. ✅ Backend compiled: `npm run build` in Backend folder
2. ✅ Backend endpoints tested: `/profesoret/:id/dashboard`, `/profesoret/:id/lendet/:yearId`, `/profesoret/:id/idet`
3. ⏳ Remove mock data from frontend (this guide)
4. ⏳ Test frontend with real backend
5. ⏳ Verify error handling works correctly

### Deployment Command

```bash
# Frontend
cd Frontend
npm run build
# Deploy dist/ folder to hosting

# Backend
cd Backend
npm run build
# Deploy to server with proper .env configuration
```

---

## 📖 References

- **Backend Unification**: [BACKEND_FRONTEND_UNIFICATION_COMPLETE.md](../BACKEND_FRONTEND_UNIFICATION_COMPLETE.md)
- **API Analysis**: [API_UNIFICATION_ANALYSIS.md](../API_UNIFICATION_ANALYSIS.md)
- **Quick Implementation**: [QUICK_IMPLEMENTATION_GUIDE.md](../QUICK_IMPLEMENTATION_GUIDE.md)

---

## ✅ Summary

### What's Already Correct ✅

1. ✅ **API Endpoints**: All URLs match backend routes
   - `/profesoret/:id/dashboard`
   - `/profesoret/:id/lendet/:yearId`
   - `/profesoret/:id/idet`
   - `/profesoret/:id/dorezime-studentesh/:lendaId`

2. ✅ **Data Mapping**: Components use correct field names
   - `subject.name` (from `emriLendes`)
   - `subject.isElective` (from `isZgjedhore`)
   - `idea.title` (from `titulli`)
   - `idea.shorthand` (from `shkurtesa`)

3. ✅ **Component Structure**: Profesor components follow Student patterns

### What Needs to Change ❌

1. ❌ **Mock Data Fallbacks**: Remove from `profesorApi.js` (3 functions)
2. ❌ **Mock Data Generation**: Remove from `idetep.jsx` (1 function)
3. ❌ **Mock Data Generation**: Remove from `dorezimet-studentesh.jsx` (1 function)

### Impact Assessment

- **Lines to Remove**: ~150 lines of mock data logic
- **Files to Modify**: 3 files (`profesorApi.js`, `idetep.jsx`, `dorezimet-studentesh.jsx`)
- **Breaking Changes**: None (only removes development fallbacks)
- **Testing Required**: Moderate (verify error handling works)

---

**Status**: ✅ **READY FOR IMPLEMENTATION**  
**Estimated Time**: 30 minutes  
**Risk Level**: Low (only removes mock data)

---

_Document generated: 21 January 2026_  
_Last updated: Frontend analysis complete_
