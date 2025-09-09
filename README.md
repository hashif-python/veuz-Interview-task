# Employee Management System

This repository contains the **Backend (Django + DRF)** and **Frontend (React + TypeScript)** for a dynamic Employee Management System.

---
## 📌 Backend (Django + DRF)

The backend provides authentication (JWT), profile management, dynamic form templates, and employee CRUD functionality using JSON fields.

### ⚙️ Tech Stack
- Django 4 / Django REST Framework
- SimpleJWT (access/refresh token authentication)
- django-cors-headers
- SQLite (default, can be swapped with Postgres)

### 🚀 Quickstart

```bash
# 1. Create & activate virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Apply migrations
python manage.py makemigrations
python manage.py migrate

# 4. (Optional) Create superuser
python manage.py createsuperuser

# 5. Run the development server
python manage.py runserver
```

### 🔗 Endpoints

#### Auth & Profile (`/api/admin/`)
- **POST** `/register/` → Register a new user
- **POST** `/login/` → Obtain JWT access & refresh tokens
- **POST** `/refresh/` → Refresh access token
- **GET** `/profile/` → Retrieve profile
- **PUT** `/profile/` → Update `{ phone, avatar }`
- **PUT** `/change-password/` → Change password

#### Forms (`/api/forms/`)
- Full CRUD for dynamic form templates  
- Schema stored as JSON

#### Employees (`/api/employees/`)
- Full CRUD for employees with **dynamic fields** keyed by **field label**
- Supports **soft delete** `/soft-delete/`
- Supports **search by query params** using labels  
  Example:  
  ```
  GET /api/employees/?Full%20Name=John&Department=Sales
  ```

---
## 🎨 Frontend (React + TypeScript)

The frontend provides a modern UI for authentication, form builder, and employee management.

### ⚙️ Tech Stack
- React + TypeScript
- React Router
- Axios (with JWT interceptors)
- TailwindCSS
- @dnd-kit (drag & drop for form builder)
- lucide-react icons

### 🚀 Quickstart

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Run the dev server
npm run dev
```

### ⚙️ .env Example
```
VITE_API_BASE_URL=http://127.0.0.1:8000
```

### 🔗 Routes
- `/login` → Login page
- `/register` → Registration page
- `/profile` → Profile settings
- `/` → Dashboard
- `/forms` → Dynamic form builder
- `/employees` → Employee listing
- `/employees/create` → Create employee
- `/employees/edit/:id` → Edit employee

### 📝 Notes
- Use `/api/admin/...` endpoints for authentication.
- Employee `data` payload must be keyed by **form field labels**.
- Profile update supports `{ phone, avatar }` unless extended in backend.

---
## ✅ Summary

- **Backend**: Django REST Framework with JWT auth, forms, and employee APIs.  
- **Frontend**: React + TypeScript with Tailwind, dynamic form builder, and employee CRUD.  
- **Next Steps**: Extend profile update fields, add Postgres/JSONB support for advanced search, and improve dashboard analytics.

