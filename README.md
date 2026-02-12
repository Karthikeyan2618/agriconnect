# 🌱 Agriconnect - Farm Management & Marketing Platform

Agriconnect is a modern web application designed to empower farmers and agricultural enthusiasts by providing a marketplace and management tools.

## 🚀 Technology Stack
- **Frontend**: React + Vite + Vanilla CSS (Modern Aesthetic)
- **Backend**: Django + Django REST Framework + Token Auth
- **Database**: SQLite3 (Local development)

---

## 🛠️ How to Start the Project

### 1. Backend (Django)
1. Open a terminal.
2. Navigate to `backend`:
   ```powershell
   cd backend
   ```
3. Activate the environment:
   ```powershell
   .\venv\Scripts\activate
   ```
4. Start the server:
   ```powershell
   python manage.py runserver
   ```
   *Access API at: `http://127.0.0.1:8000/api/`*

### 2. Frontend (React)
1. Open a second terminal.
2. Navigate to `frontend`:
   ```powershell
   cd frontend
   ```
3. Start the dev server:
   ```powershell
   npm run dev
   ```
   *Access Web App at: [http://localhost:5173/](http://localhost:5173/)*

---

## 🔑 Access & Credentials

### **User Accounts**
- **Admin Access**:
  - **URL**: `http://127.0.0.1:8000/admin/`
  - **Username**: `admin`
  - **Password**: `admin123`
- **Customer Access**: Use the **Signup** page on the frontend to create a new user or use the admin credentials to log in.

### **Test Data**
The project comes pre-seeded with:
- **Products**: Organic Tomatoes, Free Range Eggs, Sourdough Bread, Honey, and Goat Cheese.

---

## ✨ Features Implemented
- **Premium Design**: Glassmorphism, smooth gradients, and Outfit typography.
- **Authentication**: Functional Signup, Login, and Logout flows using DRF tokens.
- **Marketplace**: dynamic Product listing fetching from the backend API.
- **CORS Configured**: Secure communication between React and Django.
