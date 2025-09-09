# Employee Management System

This repository contains **Backend (Django + DRF)** and **Frontend (React + TypeScript)** for a dynamic Employee Management System.

-------------------------------------------
BACKEND (Django + DRF)
-------------------------------------------

A Django REST Framework backend with JWT auth, profile management, dynamic Form Templates, and Employee CRUD backed by JSON fields.

## Tech Stack
- Django 4 / DRF
- SimpleJWT (access/refresh tokens)
- drf-yasg (Swagger)
- django-cors-headers
- SQLite (default)

## Quickstart

```bash
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

## Endpoints

### Auth & Profile (/api/admin/)
- POST `/register/` → create user
- POST `/login/` → JWT tokens
- POST `/refresh/` → refresh token
- GET `/profile/` → view
- PUT `/profile/` → update `{ phone, avatar }`
- PUT `/change-password/`

### Forms (/api/forms/)
- CRUD for form templates with schema JSON

### Employees (/api/employees/)
- CRUD for employees with dynamic fields keyed by label
- Supports soft delete `/soft-delete/`
- Supports search by query params using labels


-------------------------------------------
FRONTEND (React + TS)
-------------------------------------------

A modern React UI for authentication, dynamic form builder, and employee CRUD powered by the Django backend.

## Tech Stack
- React + TypeScript
- React Router
- Axios (JWT with interceptors)
- TailwindCSS
- @dnd-kit for drag & drop
- lucide-react icons

## Quickstart

```bash
npm install
cp .env.example .env
npm run dev
```

### .env Example
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

## Routes
- `/login`, `/register`
- `/profile`
- `/` → dashboard
- `/forms` → form builder
- `/employees` → list
- `/employees/create`
- `/employees/edit/:id`

## Notes
- Use `/api/admin/...` endpoints for auth.
- Employee `data` must be keyed by **field labels**.
- Profile update backend only supports `{ phone, avatar }` unless extended.

-------------------------------------------
