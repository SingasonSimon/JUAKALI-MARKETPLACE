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
- **Multi-tab Interface**: Separate views for services, bookings, and categories

### General Features

- **Firebase Authentication**: Secure user registration and login with email/password
- **Role-Based Access Control**: Separate dashboards and permissions for different user types
- **Responsive Design**: Fully responsive UI optimized for desktop, tablet, and mobile devices
- **Dark Mode Theme**: Consistent modern dark theme throughout the application
- **Real-time Updates**: Instant UI updates when data changes
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Loading States**: Skeleton loaders and loading indicators for better UX
- **Toast Notifications**: Success, error, and info notifications for user actions

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
- **SQLite** - Default database (easily switchable to PostgreSQL for production)

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
│   ├── services/              # Services app (services, bookings, categories)
│   │   ├── models.py          # Service, Category, Booking models
│   │   ├── serializers.py     # DRF serializers
│   │   ├── views.py           # Service, Booking, Category views
│   │   ├── urls.py            # Service-related URLs
│   │   └── permissions.py    # Provider, Seeker, Owner permissions
│   ├── users/                 # User models and serializers
│   │   ├── models.py          # CustomUser model with roles
│   │   └── serializers.py    # User serialization
│   ├── core/                   # Django settings and configuration
│   │   ├── settings.py        # Django configuration
│   │   ├── urls.py            # Main URL configuration
│   │   └── firebase-service-account.json  # Firebase credentials
│   ├── manage.py              # Django management script
│   └── requirements.txt       # Python dependencies
│
├── frontend/                  # React application
│   ├── src/
│   │   ├── api/
│   │   │   └── apiClient.js   # Axios configuration with interceptors
│   │   ├── components/        # Reusable React components
│   │   │   ├── DashboardLayout.jsx    # Main dashboard layout with sidebar
│   │   │   ├── Navbar.jsx             # Public navigation bar
│   │   │   ├── Footer.jsx             # Footer component
│   │   │   ├── FormInput.jsx         # Reusable form input
│   │   │   ├── LoadingButton.jsx     # Button with loading state
│   │   │   ├── LoadingSkeleton.jsx   # Skeleton loaders
│   │   │   ├── Pagination.jsx        # Pagination component
│   │   │   ├── ConfirmationDialog.jsx # Delete confirmation modals
│   │   │   └── ErrorBoundary.jsx     # Error handling component
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
│   │   │   ├── Profile.jsx           # User profile page
│   │   │   ├── Settings.jsx          # User settings page
│   │   │   └── DashboardRedirect.jsx # Role-based dashboard routing
│   │   ├── services/          # API service functions
│   │   │   ├── authService.js        # Authentication API calls
│   │   │   ├── serviceService.js      # Service CRUD operations
│   │   │   ├── bookingService.js     # Booking management
│   │   │   ├── categoryService.js    # Category management
│   │   │   └── userService.js        # User profile management
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

### Step 1: Clone the Repository

```bash
git clone <repository-url>
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
   - **SEEKER**: Access to service browsing, booking, and booking management
   - **PROVIDER**: Access to service creation, category management, and booking updates

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
- `GET /api/bookings/` - List user's bookings (Seeker/Provider)
  - Seekers see their own bookings
  - Providers see bookings for their services
- `POST /api/bookings/` - Create booking (Seeker only)
  - Requires: `service` (ID), `booking_date` (ISO datetime)
  - Time must be between 8:00 AM - 5:00 PM
- `GET /api/bookings/:id/` - Get booking details
- `PUT /api/bookings/:id/` - Update booking status
- `DELETE /api/bookings/:id/` - Cancel booking

#### Users
- `GET /api/users/me/` - Get current user details (authenticated)
- `PATCH /api/users/me/` - Update user profile (authenticated)

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
- ✅ Update profile and settings
- ❌ Cannot create or edit services
- ❌ Cannot manage categories
- ❌ Cannot view other users' bookings

### PROVIDER Role
- ✅ Create, edit, and delete own services
- ✅ Create, edit, and delete categories
- ✅ View bookings for own services
- ✅ Update booking statuses (Confirm, Complete, Cancel)
- ✅ View provider dashboard with statistics
- ✅ Update profile and settings
- ❌ Cannot book services
- ❌ Cannot view bookings for other providers' services

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
- **Review and Rating System**: User feedback and reputation tracking
- **Messaging System**: In-app communication between seekers and providers
- **Mobile Application**: Native iOS/Android apps
- **Analytics Dashboard**: Advanced reporting for providers
- **Multi-language Support**: Local language options
- **Service Scheduling**: Advanced calendar integration
- **Notification System**: Email and SMS notifications for bookings

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

## 🙏 Acknowledgments

- **Firebase** for robust authentication services
- **Django REST Framework** for comprehensive API development
- **React Community** for excellent libraries and tools
- **Tailwind CSS** for rapid, utility-first UI development
- **Framer Motion** for smooth animations
- **Heroicons** for beautiful, consistent iconography

## 📞 Support

For issues, questions, or contributions:
- Open an issue in the repository
- Check existing documentation
- Review code comments for implementation details

---

**Built with ❤️ to digitally transform the informal service economy and connect skilled artisans with their communities**
