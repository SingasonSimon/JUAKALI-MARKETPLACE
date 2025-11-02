# Juakali Marketplace

A full-stack web application designed to empower informal sector workers, commonly known as "Juakali" artisans, and connect them with clients seeking everyday services in African communities. These services include lawn mowing, barbershop and salon services, carpet and sofa cleaning, pool maintenance, and other on-demand domestic and commercial tasks.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)
![Django](https://img.shields.io/badge/django-5.2.7-green.svg)

## 📋 Table of Contents

- [Overview](#overview)
- [Background](#background)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Development Methodology](#development-methodology)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

The Juakali Marketplace addresses a critical gap in access, visibility, and digital organization within the informal sector by leveraging modern web technologies. The platform enables service seekers to discover, compare, and book trusted local service providers while giving artisans a digital platform to showcase their services, manage bookings, and expand their client base.

### Problem Statement

The informal sector (Juakali sector) has high skill levels but low system organization. Current service interactions are handled informally through unstructured and unreliable communication methods, leading to:

- **Lack of visibility**: Service providers struggle to reach a larger consumer base
- **Inefficient bookings**: Customers face difficulty identifying, comparing, and booking artisans
- **No service records**: Absence of tracking, reviews, or accountability mechanisms
- **Limited scalability**: Reliance on word-of-mouth and local relationships

### Solution

The Juakali Marketplace provides a centralized platform where:
- Service providers can list services, manage bookings, and track statistics
- Service seekers can search, filter, and book services efficiently
- Both parties benefit from structured interactions and booking workflows
- Category management helps organize services by type

## 🌟 Features

### For Service Seekers (SEEKER Role)

- **Browse & Search Services**: Advanced search with filters by category, price range, and keywords
- **Book Services**: Schedule appointments with time restrictions (8:00 AM - 5:00 PM)
- **Manage Bookings**: View, track, and manage all bookings with status updates
- **Personalized Dashboard**: Statistics and quick access to services and bookings
- **Service Discovery**: Paginated listings with category filtering

### For Service Providers (PROVIDER Role)

- **Service Management**: Create, edit, and delete service listings with descriptions and pricing
- **Category Management**: Organize services with custom categories (create, edit, delete)
- **Booking Management**: View and update booking statuses (Pending → Confirmed → Completed/Cancelled)
- **Analytics Dashboard**: Track total services, bookings, and status-based statistics
- **Multi-tab Interface**: Separate views for services, bookings, categories, and reviews
- **Review Management**: View and respond to reviews from service seekers

### For Administrators (ADMIN Role)

- **User Management**: View, activate/deactivate, edit, and delete users across the platform
- **Service Oversight**: Full CRUD operations on all services (create, edit, delete)
- **Category Management**: Create, edit, and delete categories system-wide
- **Booking Management**: View and manage all bookings with status updates
- **Complaint Resolution**: Review, respond to, and resolve user complaints
- **Review Moderation**: View, edit, and delete reviews across the platform
- **Analytics Dashboard**: Comprehensive platform statistics (users, services, bookings, reviews)
- **Reports System**: Generate detailed reports on user activity, service performance, and booking analytics with CSV export
- **Audit Logs**: Track all admin actions for transparency and accountability
- **Django Admin Integration**: Access admin dashboard via frontend while authenticated through Django admin

### General Features

- **Firebase Authentication**: Secure user registration and login with email/password
- **Django Admin Session Support**: Django admin users can access frontend admin dashboard
- **Role-Based Access Control**: Separate dashboards and permissions for different user types
- **Reviews & Ratings**: Service seekers can rate and review services; providers can view feedback
- **Complaints System**: Users can file complaints; admins can review and resolve them
- **Email Notifications**: Configurable email notifications for bookings, reviews, and complaints (Gmail SMTP supported)
- **Responsive Design**: Fully responsive UI optimized for desktop, tablet, and mobile devices
- **Dark Mode Theme**: Consistent modern dark theme throughout the application
- **Real-time Updates**: Instant UI updates when data changes with auto-refresh capabilities
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Skeleton loaders and loading indicators for better UX
- **Toast Notifications**: Success, error, and info notifications for user actions
- **Smart Navigation**: Back navigation preserves browser history; logged-in users redirected to dashboard

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library with hooks and context API
- **React Router DOM 7.9.5** - Client-side routing and navigation
- **Tailwind CSS 3.4.14** - Utility-first CSS framework for rapid UI development
- **Framer Motion 12.23.24** - Animation library for smooth transitions
- **Heroicons 2.2.0** - Icon library for consistent iconography
- **Axios 1.13.1** - HTTP client for API communication
- **Firebase 12.5.0** - Authentication service
- **Vite 7.1.7** - Modern build tool and development server
- **Montserrat Font** - Google Fonts integration for typography

### Backend
- **Django 5.2.7** - Python web framework
- **Django REST Framework 3.16.1** - RESTful API development
- **Firebase Admin SDK 7.1.0** - Server-side Firebase integration for authentication
- **django-cors-headers 4.9.0** - CORS middleware for cross-origin requests
- **python-dotenv 1.0.0** - Environment variable management
- **SQLite** - Default database (easily switchable to PostgreSQL for production)
- **Email Support** - SMTP email configuration with Gmail support

### Development Approach
- **Agile-Scrum Methodology** - Iterative development with sprints
- **Component-Based Architecture** - Reusable React components
- **RESTful API Design** - Standard API endpoints for CRUD operations

## 📁 Project Structure

```
JUAKALI MARKETPLACE/
├── backend/                    # Django REST API
│   ├── api/                    # API app (users, authentication)
│   │   ├── authentication.py  # Firebase authentication middleware
│   │   ├── permissions.py     # Custom permission classes
│   │   ├── urls.py            # API URL routing
│   │   └── views.py           # API views (users, admin endpoints)
│   ├── services/              # Services app (services, bookings, categories, reviews, complaints)
│   │   ├── models.py          # Service, Category, Booking, Review, Complaint models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # Service, Booking, Category, Review, Complaint views
│   │   ├── urls.py            # Service-related URLs
│   │   └── permissions.py    # Provider, Seeker, Owner, Admin permissions
│   ├── core/                   # Django settings and configuration
│   │   ├── settings.py        # Django configuration
│   │   ├── email_utils.py    # Email notification utilities
│   │   ├── urls.py            # Main URL configuration
│   │   └── firebase-service-account.json  # Firebase credentials
│   ├── templates/              # Email templates
│   │   └── emails/            # HTML email templates for notifications
│   ├── users/                 # User models and serializers
│   │   ├── models.py          # CustomUser model with roles and email_notifications
│   │   ├── serializers.py    # User serialization
│   │   └── backends.py       # Custom email authentication backend
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js   # Axios configuration with interceptors
│   │   ├── components/        # Reusable React components
│   │   │   ├── DashboardLayout.jsx    # Main dashboard layout with sidebar
│   │   │   ├── AdminLayout.jsx       # Admin dashboard layout
│   │   │   ├── Navbar.jsx             # Public navigation bar (responsive)
│   │   │   ├── Footer.jsx             # Footer component
│   │   │   ├── FormInput.jsx         # Reusable form input
│   │   │   ├── LoadingButton.jsx     # Button with loading state
│   │   │   ├── LoadingSkeleton.jsx   # Skeleton loaders
│   │   │   ├── Pagination.jsx        # Pagination component
│   │   │   ├── ConfirmationDialog.jsx # Delete confirmation modals
│   │   │   ├── ErrorBoundary.jsx     # Error handling component
│   │   │   ├── ComplaintForm.jsx     # Complaint submission form
│   │   │   ├── ReviewForm.jsx         # Review submission form
│   │   │   ├── ReviewList.jsx         # Review display component
│   │   │   └── StarRating.jsx        # Star rating component
│   │   ├── context/           # React Context providers
│   │   │   ├── AuthContext.jsx      # Authentication state management
│   │   │   └── ToastContext.jsx     # Toast notification system
│   │   ├── hooks/
│   │   │   └── useDebounce.js       # Custom debounce hook
│   │   ├── pages/             # Page components
│   │   │   ├── Home.jsx              # Landing page with service listings
│   │   │   ├── Login.jsx             # User login page
│   │   │   ├── Register.jsx          # User registration page
│   │   │   ├── ServiceDetail.jsx     # Individual service details
│   │   │   ├── SeekerDashboard.jsx   # Seeker role dashboard
│   │   │   ├── ProviderDashboard.jsx # Provider role dashboard
│   │   │   ├── AdminDashboard.jsx     # Admin role dashboard
│   │   │   ├── AdminProfile.jsx      # Admin profile page
│   │   │   ├── AdminSettings.jsx     # Admin settings page
│   │   │   ├── DjangoAdminPage.jsx   # Django admin wrapper page
│   │   │   ├── Profile.jsx           # User profile page
│   │   │   ├── Settings.jsx          # User settings page
│   │   │   └── DashboardRedirect.jsx # Role-based dashboard routing
│   │   ├── services/          # API service functions
│   │   │   ├── authService.js        # Authentication API calls
│   │   │   ├── serviceService.js      # Service CRUD operations
│   │   │   ├── bookingService.js     # Booking management
│   │   │   ├── categoryService.js    # Category management
│   │   │   ├── userService.js        # User profile management
│   │   │   ├── reviewService.js      # Review management
│   │   │   ├── complaintService.js   # Complaint management
│   │   │   ├── adminService.js       # Admin API operations
│   │   │   └── djangoAdminService.js # Django admin API operations
│   │   ├── firebaseConfig.js  # Firebase configuration
│   │   ├── App.jsx            # Main App component with routing
│   │   └── index.css          # Global styles and Tailwind directives
│   ├── public/
│   │   └── icon.png           # Application logo
│   ├── package.json           # Node.js dependencies
│   └── vite.config.js         # Vite configuration
│
└── README.md                  # Project documentation
```

## 🚀 Installation

### Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **Firebase Project** (for authentication)
- **Git** (for version control)

## 🪟 Windows Setup Guide

If you're setting this up on a Windows computer, follow these steps carefully. I'll walk you through everything you need to get the project running on your machine.

### Before You Start

You'll need to have these programs installed on your computer:
- Python (version 3.10 or newer)
- Node.js (includes npm automatically)
- Git (optional, but helpful)

### Installing Python on Windows

1. **Download Python:**
   - Open your web browser and go to: https://www.python.org/downloads/
   - Click the big yellow "Download Python" button
   - The website will automatically detect you're on Windows and give you the right version

2. **Install Python:**
   - Run the downloaded installer (it will be named something like `python-3.12.x.exe`)
   - **Important:** On the first screen, check the box that says "Add Python to PATH" - this is crucial!
   - Click "Install Now"
   - Wait for the installation to finish

3. **Verify Python is installed:**
   - Press the Windows key and type "cmd" to open Command Prompt
   - Type this and press Enter:
     ```
     python --version
     ```
   - You should see something like "Python 3.12.x" - if you see an error, Python might not be added to your PATH

### Installing Node.js on Windows

1. **Download Node.js:**
   - Go to: https://nodejs.org/
   - You'll see two buttons - click the green one that says "LTS" (Long Term Support)
   - This downloads the installer

2. **Install Node.js:**
   - Run the installer you just downloaded
   - Just click "Next" through all the screens - the default options are fine
   - At the end, it will install everything automatically
   - You might need to restart your computer after this

3. **Verify Node.js is installed:**
   - Open Command Prompt again (close and reopen it after installing)
   - Type:
     ```
     node --version
     ```
   - You should see a version number like "v20.x.x"
   - Also check npm:
     ```
     npm --version
     ```
   - You should see another version number

### Installing Git on Windows (Optional)

If you don't have Git installed:

1. Go to: https://git-scm.com/download/win
2. Download the installer and run it
3. Click "Next" through all the screens - defaults are fine
4. This lets you use `git clone` commands

### Getting the Project Files

You can either:
- Download the project as a ZIP file and extract it, OR
- Use Git to clone it (if you installed Git)

**If using ZIP:**
- Extract the folder to somewhere easy to find, like your Desktop or Documents folder
- Remember where you put it!

**If using Git:**
- Open Command Prompt
- Navigate to where you want the project:
  ```
  cd Desktop
  ```
- Clone the repository https://github.com/SingasonSimon/JUAKALI-MARKETPLACE.git

### Setting Up the Backend

1. **Open Command Prompt:**
   - Press Windows key, type "cmd", press Enter

2. **Navigate to the backend folder:**
   - First, go to where your project is. For example:
     ```
     cd Desktop
     cd "JUAKALI MARKETPLACE"
     cd backend
     ```
   - Tip: If you're not sure where you are, type `cd` and then drag the folder from File Explorer into the Command Prompt window - it will paste the path automatically

3. **Create a Virtual Environment:**
   - This creates a special folder that keeps this project's Python packages separate from other projects
   - Type:
     ```
     python -m venv django_venv
     ```
   - Wait for it to finish - you'll see your prompt come back

4. **Activate the Virtual Environment:**
   - Every time you work on the backend, you need to activate this first
   - Type:
     ```
     django_venv\Scripts\activate
     ```
   - You should now see `(django_venv)` at the start of your command line - this means it's working!

5. **Install the Required Packages:**
   - Type:
     ```
     pip install -r requirements.txt
     ```
   - This downloads all the Python libraries the project needs
   - It might take a few minutes - just wait until it's done
   - Don't worry if you see some warnings in yellow - that's normal

6. **Set Up the Database:**
   - Type:
     ```
     python manage.py migrate
     ```
   - This creates all the database tables the app needs
   - You should see a list of migrations being applied

### Setting Up Firebase

Firebase is what handles user login and registration. You need to set this up before the app will work.

#### Creating a Firebase Project

1. Go to: https://console.firebase.google.com/
2. Sign in with your Google account
3. Click "Add Project" or "Create a Project"
4. Give it a name (like "Juakali Marketplace")
5. Click through the setup screens - you can disable Google Analytics if you want
6. Click "Create Project" and wait for it to finish

#### Getting Your Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Click "Project Settings"
3. Scroll down to the "Your apps" section
4. Click the web icon (looks like `</>`)
5. Give your app a nickname (like "Juakali Web")
6. Click "Register app"
7. You'll see a code block with your configuration - **copy these values!** They look like:
   ```
   apiKey: "AIzaSy..."
   authDomain: "your-project.firebaseapp.com"
   projectId: "your-project-id"
   storageBucket: "your-project.appspot.com"
   messagingSenderId: "123456789"
   appId: "1:123456789:web:abcdef"
   ```

#### Setting Up Backend Firebase

1. Still in Firebase Console, go to "Project Settings" → "Service Accounts" tab
2. Click "Generate New Private Key"
3. Click "Generate Key" in the popup
4. A JSON file will download - this is your service account key
5. Rename this file to: `firebase-service-account.json`
6. Move it to the `backend/core/` folder
   - You can do this by opening File Explorer, going to your project, then `backend/core/`
   - Just drag and drop the file there

#### Setting Up Frontend Firebase

1. Open File Explorer and navigate to your project's `frontend` folder
2. In the `frontend` folder, create a new file called `.env`
   - Right-click → New → Text Document
   - Name it exactly `.env` (including the dot at the start)
   - If Windows warns you about changing the extension, click "Yes"
3. Open `.env` in Notepad
4. Paste this, replacing the values with what you copied from Firebase:
   ```
   VITE_FIREBASE_API_KEY=paste_your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```
5. Save the file (Ctrl+S)

#### Enabling Email/Password Login

1. In Firebase Console, click "Authentication" in the left menu
2. Click "Get Started"
3. Click "Email/Password" from the list
4. Toggle the "Enable" switch to ON
5. Click "Save"

### Setting Up the Frontend

1. **Open a New Command Prompt Window:**
   - Keep your backend window open, but open a second Command Prompt for the frontend

2. **Navigate to the Frontend Folder:**
   ```
   cd Desktop
   cd "JUAKALI MARKETPLACE"
   cd frontend
   ```

3. **Install Node Packages:**
   ```
   npm install
   ```
   - This downloads all the JavaScript libraries the project needs
   - It might take a few minutes - you'll see lots of text scrolling
   - Wait until you see your prompt again (no errors)

### Running the Project

You need to run both the backend and frontend at the same time, so you'll need two Command Prompt windows.

#### Starting the Backend Server

1. In your first Command Prompt window (the one in the `backend` folder)
2. Make sure you see `(django_venv)` at the start - if not, activate it:
   ```
   django_venv\Scripts\activate
   ```
3. Start the server:
   ```
   python manage.py runserver
   ```
4. You should see:
   ```
   Starting development server at http://127.0.0.1:8000/
   ```
5. **Leave this window open!** The server needs to keep running

#### Starting the Frontend Server

1. In your second Command Prompt window (the one in the `frontend` folder)
2. Start the development server:
   ```
   npm run dev
   ```
3. Wait a moment - you'll see:
   ```
   VITE v7.1.7  ready in 500 ms
   ➜  Local:   http://localhost:5173/
   ```
4. **Leave this window open too!** The frontend server also needs to keep running

#### Opening the Application

1. Open your web browser (Chrome, Firefox, Edge, or any browser)
2. Go to: `http://localhost:5173`
3. You should see the Juakali Marketplace homepage!

### Common Issues and Fixes

**"python is not recognized" or "python: command not found"**
- Python might not be installed correctly, or it's not in your PATH
- Try using `py` instead of `python` (Windows Python Launcher)
- Or reinstall Python and make absolutely sure to check "Add Python to PATH"

**"npm is not recognized"**
- Node.js might not be installed, or you need to restart your computer
- Close and reopen Command Prompt
- If that doesn't work, reinstall Node.js

**"Port 8000 already in use" or "Port 5173 already in use"**
- Another program is using that port number
- For backend, you can use a different port:
  ```
  python manage.py runserver 8001
  ```
- For frontend, it will usually suggest an alternate port automatically

**Virtual environment won't activate**
- Make sure you're in the `backend` folder first
- Try typing the full path:
  ```
  .\django_venv\Scripts\activate
  ```
- If you're using PowerShell, you might need to run this first:
  ```
  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
  ```
  Then try activating again

**Can't find my `.env` file**
- Make sure it's named exactly `.env` (with the dot)
- Windows might hide files starting with dots - in File Explorer, go to View → Show → Hidden items
- Make sure it's in the `frontend` folder, not `backend`

**Firebase errors when trying to login**
- Double-check your `.env` file has the correct values
- Make sure there are no spaces around the `=` signs
- Make sure the file is saved
- Restart the frontend server after changing the `.env` file (close it with Ctrl+C and run `npm run dev` again)

**"Module not found" errors**
- You might not have installed all the packages
- For backend: Make sure the virtual environment is activated, then run `pip install -r requirements.txt` again
- For frontend: Run `npm install` again in the frontend folder

**Can't find the project folder in Command Prompt**
- Open File Explorer and navigate to your project folder
- Click in the address bar at the top and copy the path
- In Command Prompt, type `cd` followed by pasting the path:
  ```
  cd C:\Users\YourName\Desktop\JUAKALI MARKETPLACE
  ```

### Step 1: Clone the Repository

```bash
git clone https://github.com/SingasonSimon/JUAKALI-MARKETPLACE.git
cd "JUAKALI MARKETPLACE"
```

### Step 2: Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python3 -m venv django_venv

# Activate virtual environment
# On Linux/Mac:
source django_venv/bin/activate
# On Windows:
django_venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate

# (Optional) Create Django superuser for admin panel
python manage.py createsuperuser
```

### Step 3: Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install Node.js dependencies
npm install
```

## ⚙️ Configuration

### Firebase Setup

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable **Email/Password** authentication method

2. **Download Service Account Key**
   - Navigate to Project Settings → Service Accounts
   - Generate a new private key
   - Download the JSON file
   - Place it in `backend/core/firebase-service-account.json`

3. **Get Firebase Web App Configuration**
   - In Firebase Console, go to Project Settings → General
   - Scroll to "Your apps" section
   - Click the web icon (`</>`) to add a web app
   - Copy the Firebase configuration object

4. **Frontend Environment Variables**

   Create a `.env` file in the `frontend/` directory:

   ```env
   VITE_FIREBASE_API_KEY=your_api_key_here
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

5. **Backend Configuration**

   Ensure `backend/core/settings.py` points to your Firebase service account JSON file:

   ```python
   # In settings.py, the Firebase initialization should reference:
   # backend/core/firebase-service-account.json
   ```

6. **Email Configuration (Optional)**

   For email notifications, create a `.env` file in the `backend/` directory:

   ```env
   EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USE_TLS=True
   EMAIL_HOST_USER=your-email@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   DEFAULT_FROM_EMAIL=your-email@gmail.com
   ```

   **Note**: For Gmail, you'll need to generate an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password).

   If email is not configured, emails will be printed to the console (development mode).

## 🎮 Usage

### Starting the Development Servers

1. **Start Django Backend**

   ```bash
   cd backend
   source django_venv/bin/activate  # If using virtual environment
   python manage.py runserver
   ```

   The backend API will be available at `http://localhost:8000`

2. **Start React Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   The frontend will be available at `http://localhost:5173`

3. **Access the Application**

   Open your browser and navigate to `http://localhost:5173`

### User Registration and Roles

1. **Register a New User**
   - Click "Register" on the homepage
   - Fill in your details (first name, last name, email, password)
   - Select your role: **SEEKER** or **PROVIDER**
   - Complete registration

2. **Login**
   - Use your email and password to log in
   - You'll be redirected to your role-specific dashboard

3. **Role-Based Access**
   - **SEEKER**: Access to service browsing, booking, booking management, reviews, and complaints
   - **PROVIDER**: Access to service creation, category management, booking updates, and review viewing
   - **ADMIN**: Access to admin dashboard via Django admin login (`http://localhost:8000/admin/`) then navigate to `http://localhost:5173/admin`

## 📚 API Documentation

### Base URL
```
http://localhost:8000/api
```

### Authentication
All protected endpoints require Firebase authentication token in the Authorization header:
```
Authorization: Bearer <firebase_id_token>
```

### Endpoints

#### Services
- `GET /api/services/` - List all services (public)
- `POST /api/services/` - Create a service (Provider only)
- `GET /api/services/:id/` - Get service details (public)
- `PUT /api/services/:id/` - Update service (Owner only)
- `DELETE /api/services/:id/` - Delete service (Owner only)

#### Categories
- `GET /api/categories/` - List all categories (public)
- `POST /api/categories/` - Create category (Provider only)
- `GET /api/categories/:id/` - Get category details (public)
- `PUT /api/categories/:id/` - Update category (Provider only)
- `DELETE /api/categories/:id/` - Delete category (Provider only)

#### Bookings
- `GET /api/bookings/` - List user's bookings (Seeker/Provider/Admin)
  - Seekers see their own bookings
  - Providers see bookings for their services
  - Admins see all bookings
- `POST /api/bookings/` - Create booking (Seeker only)
  - Requires: `service` (ID), `booking_date` (ISO datetime)
  - Time must be between 8:00 AM - 5:00 PM
- `GET /api/bookings/:id/` - Get booking details
- `PUT /api/bookings/:id/` - Update booking status (Owner/Provider/Admin)
- `DELETE /api/bookings/:id/` - Cancel booking (Owner/Admin)

#### Reviews
- `GET /api/reviews/` - List reviews (public or filtered by service)
- `POST /api/reviews/` - Create review (Seeker only, one per service)
- `GET /api/reviews/:id/` - Get review details
- `PUT /api/reviews/:id/` - Update review (Owner/Admin)
- `DELETE /api/reviews/:id/` - Delete review (Owner/Admin)

#### Complaints
- `GET /api/complaints/` - List user's complaints (Seeker) or all complaints (Admin)
- `POST /api/complaints/` - Create complaint (Authenticated users)
- `GET /api/complaints/:id/` - Get complaint details
- `PUT /api/complaints/:id/` - Update complaint status and admin response (Admin only)
- `DELETE /api/complaints/:id/` - Delete complaint (Admin only)

#### Users
- `GET /api/users/me/` - Get current user details (authenticated)
- `PATCH /api/users/me/` - Update user profile and preferences (authenticated)
  - Supports updating: `first_name`, `last_name`, `email_notifications`

#### Admin Endpoints (Admin only)
- `GET /api/admin/users/` - List all users
- `GET /api/admin/users/:id/` - Get user details
- `PATCH /api/admin/users/:id/` - Update user (role, name, etc.)
- `DELETE /api/admin/users/:id/` - Delete user
- `POST /api/admin/users/:id/activate/` - Activate/deactivate user
- `GET /api/admin/analytics/` - Get platform analytics
- `GET /api/admin/reports/` - Generate reports (user_activity, service_performance, booking_analytics)
- `GET /api/admin/action-logs/` - View admin action audit logs

#### Django Admin Session (Django admin users)
- `GET /api/django-admin/session/` - Check Django admin session and get CSRF token
- `POST /api/django-admin/logout/` - Logout Django admin user

### Response Formats

**Success Response (200 OK):**
```json
{
  "id": 1,
  "title": "Lawn Mowing Service",
  "description": "Professional lawn care...",
  "price": "1500.00",
  "category": 1,
  "provider": 2,
  "created_at": "2025-01-15T10:30:00Z"
}
```

**Error Response (400/401/403/404):**
```json
{
  "detail": "Error message describing what went wrong"
}
```

## 🔐 User Roles and Permissions

### SEEKER Role
- ✅ Browse and search all services
- ✅ View service details
- ✅ Create bookings (8:00 AM - 5:00 PM time restriction)
- ✅ View own bookings
- ✅ Cancel own bookings
- ✅ Rate and review services (one review per service)
- ✅ File complaints
- ✅ View own complaints
- ✅ Update profile and settings
- ✅ Configure email notifications
- ❌ Cannot create or edit services
- ❌ Cannot manage categories
- ❌ Cannot view other users' bookings

### PROVIDER Role
- ✅ Create, edit, and delete own services
- ✅ Create, edit, and delete categories
- ✅ View bookings for own services
- ✅ Update booking statuses (Confirm, Complete, Cancel)
- ✅ View provider dashboard with statistics
- ✅ View reviews for own services
- ✅ Update profile and settings
- ✅ Configure email notifications
- ❌ Cannot book services
- ❌ Cannot view bookings for other providers' services
- ❌ Cannot create reviews

### ADMIN Role
- ✅ Full user management (view, edit, activate/deactivate, delete)
- ✅ Full service management (view, create, edit, delete all services)
- ✅ Full category management (view, create, edit, delete all categories)
- ✅ Full booking management (view, update, delete all bookings)
- ✅ Complaint resolution (view, respond, resolve complaints)
- ✅ Review moderation (view, edit, delete all reviews)
- ✅ Platform analytics dashboard
- ✅ Generate and export reports (CSV format)
- ✅ View audit logs of all admin actions
- ✅ Access via Django admin or frontend admin dashboard
- ✅ Configure email notifications

## 🎨 UI/UX Features

### Design Principles
- **Dark Mode First**: Consistent dark theme (gray-900 background, gray-800 cards)
- **Responsive Layout**: Mobile-first design with breakpoints for tablet and desktop
- **Smooth Animations**: Framer Motion for page transitions and component animations
- **Accessibility**: Proper ARIA labels, keyboard navigation support

### Key UI Components
- **Responsive Sidebar**: Collapsible navigation with icon-only mode on desktop
- **Toast Notifications**: Non-intrusive success/error/info messages
- **Loading States**: Skeleton loaders and loading buttons for better UX
- **Confirmation Dialogs**: Safe delete operations with confirmation
- **Pagination**: Efficient data pagination for large service lists
- **Form Validation**: Client-side validation with error messages

### Responsive Breakpoints
- **Mobile**: < 768px (Sidebar slides in/out)
- **Tablet**: 768px - 1023px
- **Desktop**: ≥ 1024px (Collapsible sidebar, full feature set)

## 🔒 Security Features

- **Firebase Authentication**: Secure email/password authentication with token-based sessions
- **Role-Based Access Control (RBAC)**: Permissions enforced at both frontend and backend
- **CORS Configuration**: Secure cross-origin resource sharing
- **Input Validation**: Client and server-side validation
- **Error Boundaries**: Graceful error handling to prevent crashes
- **Secure API Communication**: Axios interceptors for automatic token attachment

## 🧪 Development

### Development Methodology

This project follows the **Agile-Scrum methodology**:

- **Iterative Development**: Features delivered in sprints
- **User-Centric Design**: Continuous feedback integration
- **Component-Based Architecture**: Modular, reusable React components
- **RESTful API**: Standard HTTP methods and status codes

### Running Tests

```bash
# Backend tests
cd backend
python manage.py test

# Frontend linting
cd frontend
npm run lint
```

### Building for Production

```bash
# Frontend production build
cd frontend
npm run build

# Output will be in frontend/dist/
```

### Database Migrations

```bash
# Create new migration
cd backend
python manage.py makemigrations

# Apply migrations
python manage.py migrate
```

## 📊 System Architecture

### Three-Tier Architecture

```
┌─────────────────┐
│   React Frontend │  ← Presentation Layer
│   (Vite + React) │
└────────┬─────────┘
         │ HTTP/REST API
┌────────▼─────────┐
│ Django REST API  │  ← Application Layer
│   (Django 5.2.7) │
└────────┬─────────┘
         │ ORM
┌────────▼─────────┐
│   SQLite/PostgreSQL│  ← Data Layer
│   (via Django ORM)│
└──────────────────┘
```

### Authentication Flow

1. User registers/logs in via Firebase Authentication
2. Firebase returns ID token
3. Frontend stores token and includes it in API requests
4. Django backend verifies token using Firebase Admin SDK
5. Backend links Firebase user to Django CustomUser model
6. Role-based permissions are enforced on API endpoints

## 🌍 Target Audience

This platform is designed for:

- **Urban and Peri-Urban African Communities**: Areas with high informal sector activity
- **Service Seekers**: Residents needing reliable, affordable local services
- **Juakali Artisans**: Skilled workers in the informal sector seeking digital visibility
- **Service Types**: Lawn mowing, barbering, salon services, cleaning, pool maintenance, and similar on-demand services

## 🚧 Future Enhancements

Potential features for future development:

- **Payment Integration**: M-Pesa, Flutterwave, or other payment gateways
- **Geolocation Services**: Google Maps/Leaflet for location-based service discovery
- **Messaging System**: In-app communication between seekers and providers
- **Mobile Application**: Native iOS/Android apps
- **Advanced Analytics**: More detailed reporting and visualization for providers
- **Multi-language Support**: Local language options
- **Service Scheduling**: Advanced calendar integration with availability management
- **SMS Notifications**: SMS alerts in addition to email notifications
- **Push Notifications**: Browser push notifications for real-time updates
- **Service Images**: Upload and manage service images
- **Provider Verification**: Badge system for verified providers
- **Service Recommendations**: AI-powered service recommendations for seekers

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code Style Guidelines

- **Frontend**: Follow ESLint configuration, use functional components with hooks
- **Backend**: Follow PEP 8, Django coding standards
- **Components**: Keep components small, focused, and reusable
- **API**: Follow RESTful conventions, use appropriate HTTP methods

## 📄 License

This project is licensed under the MIT License.

## ✨ Recent Updates

### Implemented Features
- ✅ **Email Notifications**: Full email notification system with Gmail SMTP support
- ✅ **Reviews & Ratings**: Complete review system with star ratings
- ✅ **Complaints System**: User complaint filing and admin resolution workflow
- ✅ **Admin Dashboard**: Comprehensive admin interface with full CRUD operations
- ✅ **Analytics & Reports**: Platform analytics with CSV export functionality
- ✅ **Audit Logging**: Complete admin action tracking for transparency
- ✅ **Django Admin Integration**: Seamless frontend access for Django admin users
- ✅ **Smart Navigation**: Browser history-aware back navigation
- ✅ **Responsive Design**: Mobile-optimized navbar and hero section
- ✅ **Environment Variables**: Secure credential management with `.env` files

### Security & Performance
- ✅ **CSRF Protection**: Proper CSRF token handling for Django admin sessions
- ✅ **Session Management**: Secure session-based authentication for admin users
- ✅ **Auto-refresh**: Automatic data refresh for complaints and bookings
- ✅ **Error Handling**: Comprehensive error boundaries and user feedback

## 🙏 Acknowledgments

- **Firebase** for robust authentication services
- **Django REST Framework** for comprehensive API development
- **React Community** for excellent libraries and tools
- **Tailwind CSS** for rapid, utility-first UI development
- **Framer Motion** for smooth animations
- **Heroicons** for beautiful, consistent iconography
- **python-dotenv** for secure environment variable management

## 📞 Support

For issues, questions, or contributions:
- Open an issue in the repository
- Check existing documentation
- Review code comments for implementation details

---

**Built with ❤️ to digitally transform the informal service economy and connect skilled artisans with their communities**
