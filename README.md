# Django + React JWT Authentication Project

A full-stack web application with Django REST API backend and React frontend, featuring user registration, login, and JWT-based authentication.

## 🚀 Features

- User Registration and Login
- JWT Token Authentication
- Protected Routes
- Django REST API Backend
- Token Refresh Mechanism

## 🛠️ Tech Stack

**Backend:**
- Django 4.x
- Django REST Framework
- djangorestframework-simplejwt
- Django CORS Headers

**Frontend:**
- React 18+
- React Router DOM
- Axios
- React Context API

## 📋 Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- Git

## 🔧 Installation & Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd your-project-name
```

### 2. Backend Setup (Django)

#### Create and Activate Virtual Environment
```bash
# Create virtual environment
python -m venv env

# Activate virtual environment
# On Windows:
env\Scripts\activate
# On macOS/Linux:
source env/bin/activate
```

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

#### Database Setup
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser  # Optional: create admin user
```

#### Start Backend Server
```bash
python manage.py runserver
```
Backend will run on `http://127.0.0.1:8000/`

### 3. Frontend Setup (React)

#### Navigate to Frontend Directory
```bash
cd frontend
```

#### Install Dependencies
```bash
npm install
```

#### Environment Configuration
Create a `.env` file in the frontend directory:
```env
REACT_APP_API_URL=http://127.0.0.1:8000
```

#### Start Frontend Server
```bash
npm start
```
Frontend will run on `http://localhost:3000/`


## 📁 Project Structure

```
project-root/
├── backend/
│   ├── backend/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── authentication/
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   └── Profile.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── package-lock.json
├── env/
├── .gitignore
└── README.md
```

## 🔄 Frontend Authentication Flow

1. User registers/logs in
2. JWT tokens stored in localStorage
3. Axios interceptor adds token to requests
4. Protected routes check authentication status
5. Token automatically refreshed when expired

## 🐛 Troubleshooting

### Common Issues

**CORS Errors:**
- Ensure `django-cors-headers` is installed
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in Django settings

**Token Expired:**
- Implement token refresh logic in frontend
- Check token expiration time in Django settings

**Database Errors:**
- Run migrations: `python manage.py migrate`
- Check database connection settings


