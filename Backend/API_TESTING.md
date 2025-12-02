# API Testing me cURL

## 1. Testo API Welcome Message
```powershell
curl http://localhost:5000/
```

## 2. Merr të gjithë përdoruesit (GET)
```powershell
curl http://localhost:5000/api/users
```

## 3. Krijo një përdorues të ri (POST)
```powershell
curl -X POST http://localhost:5000/api/users -H "Content-Type: application/json" -d '{\"name\": \"Test User\", \"email\": \"test@example.com\", \"password\": \"password123\"}'
```

Ose me Invoke-WebRequest (PowerShell native):
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/users -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"name": "Test User", "email": "test@example.com", "password": "password123"}'
```

## 4. Merr përdorues sipas ID (GET)
```powershell
curl http://localhost:5000/api/users/1
```

## 5. Përditëso përdorues (PUT)
```powershell
curl -X PUT http://localhost:5000/api/users/1 -H "Content-Type: application/json" -d '{\"name\": \"Updated User\", \"email\": \"updated@example.com\"}'
```

Ose me Invoke-WebRequest:
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/users/1 -Method PUT -Headers @{"Content-Type"="application/json"} -Body '{"name": "Updated User", "email": "updated@example.com"}'
```

## 6. Fshi përdorues (DELETE)
```powershell
curl -X DELETE http://localhost:5000/api/users/1
```

Ose me Invoke-WebRequest:
```powershell
Invoke-WebRequest -Uri http://localhost:5000/api/users/1 -Method DELETE
```

---

## Hapat para testimit:

1. **Nise serverin:**
```powershell
cd Backend
npm run dev
```

2. **Sigurohu që databaza është e konfiguruar:**
   - Krijo databazën `feedelate` në MySQL
   - Kontrollo `.env` file-in për kredencialet e sakta

3. **Testo API endpoint-et** sipas komandave më lart
