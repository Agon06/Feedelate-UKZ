# Feedelate Backend

Backend API i ndërtuar me Node.js, Express, TypeScript dhe TypeORM.

## Teknologjitë e përdorura

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Typed JavaScript
- **TypeORM** - ORM për databazë
- **MySQL** - Databaza

## Instalimi

1. Instalo varësitë:
```bash
npm install
```

2. Konfiguro `.env` file:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=feedelate
```

3. Krijo databazën në MySQL:
```sql
CREATE DATABASE feedelate;
```

## Ekzekutimi

### Development mode
```bash
npm run dev
```

### Production build
```bash
npm run build
npm start
```

## Struktura e projektit

```
Backend/
├── src/
│   ├── entities/       # TypeORM entities
│   ├── routes/         # API routes
│   ├── data-source.ts  # Database configuration
│   └── index.ts        # Entry point
├── .env
├── tsconfig.json
└── package.json
```

## API Endpoints

- `GET /` - Welcome message
- `GET /api/users` - Merr të gjithë përdoruesit
- `GET /api/users/:id` - Merr përdorues sipas ID
- `POST /api/users` - Krijo përdorues të ri
- `PUT /api/users/:id` - Përditëso përdorues
- `DELETE /api/users/:id` - Fshi përdorues
