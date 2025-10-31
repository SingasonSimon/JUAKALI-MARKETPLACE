# Juakali Marketplace

A modern, full-stack marketplace platform connecting service seekers with skilled service providers. Built with React and Django REST Framework, featuring Firebase authentication, real-time booking management, and an intuitive user interface.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.10+-blue.svg)
![React](https://img.shields.io/badge/react-19.1.1-blue.svg)
![Django](https://img.shields.io/badge/django-5.2.7-green.svg)

## 🌟 Features

### For Service Seekers
- **Browse Services**: Search and filter services by category, price range, and keywords
- **Book Services**: Schedule appointments with service providers (8:00 AM - 5:00 PM)
- **Manage Bookings**: View, track, and manage all your bookings in one place
- **Dashboard**: Access personalized dashboard with booking statistics and service discovery

### For Service Providers
- **Service Management**: Create, edit, and delete your service listings
- **Category Management**: Organize services with custom categories
- **Booking Management**: View and update booking statuses (Pending, Confirmed, Completed, Cancelled)
- **Analytics**: Track service and booking statistics on your dashboard

### General Features
- **Firebase Authentication**: Secure user authentication and authorization
- **Responsive Design**: Fully responsive UI that works on all devices
- **Dark Mode**: Modern dark theme throughout the application
- **Real-time Updates**: Instant updates when bookings or services change
- **Role-based Access**: Separate dashboards for Seekers and Providers

## 🛠️ Tech Stack

### Frontend
- **React 19.1.1** - UI library
- **React Router DOM 7.9.5** - Client-side routing
- **Tailwind CSS 3.4.14** - Utility-first CSS framework
- **Framer Motion 12.23.24** - Animation library
- **Heroicons** - Icon library
- **Axios 1.13.1** - HTTP client
- **Firebase 12.5.0** - Authentication
- **Vite 7.1.7** - Build tool

### Backend
- **Django 5.2.7** - Web framework
- **Django REST Framework 3.16.1** - RESTful API
- **Firebase Admin SDK 7.1.0** - Server-side Firebase integration
- **SQLite** - Database (default, easily switchable to PostgreSQL)

### Font
- **Montserrat** - Primary font family

## 📁 Project Structure

```
JUAKALI MARKETPLACE/
├── backend/                 # Django REST API
│   ├── api/                 # API app (users, authentication)
│   ├── services/            # Services app (services, bookings, categories)
│   ├── users/               # User models and serializers
│   ├── core/                # Django settings and configuration
│   ├── manage.py
│   └── requirements.txt
│
├── frontend/                # React application
│   ├── src/
│   │   ├── api/             # API client configuration
│   │   ├── components/      # Reusable React components
│   │   ├── context/         # React Context providers
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   └── App.jsx          # Main App component
│   ├── public/
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** and **npm** (for frontend)
- **Firebase Project** (for authentication)
- **Git** (for cloning the repository)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "JUAKALI MARKETPLACE"
   ```

2. **Backend Setup**

   ```bash
   # Navigate to backend directory
   cd backend

   # Create virtual environment (optional but recommended)
   python3 -m venv django_venv
   source django_venv/bin/activate  # On Windows: django_venv\Scripts\activate

   # Install dependencies
   pip install -r requirements.txt

   # Run migrations
   python manage.py migrate

   # Create superuser (optional, for Django admin)
   python manage.py createsuperuser
   ```

3. **Frontend Setup**

   ```bash
   # Navigate to frontend directory
   cd frontend

   # Install dependencies
   npm install
   ```

### Environment Configuration

1. **Firebase Setup**
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password)
   - Download your Firebase service account key JSON file
   - Place it in `backend/core/firebase-service-account.json`

2. **Frontend Environment Variables**

   Create a `.env` file in the `frontend/` directory:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

   You can find these values in your Firebase project settings.

3. **Backend Configuration**

   Update `backend/core/settings.py` to point to your Firebase service account JSON file if you placed it in a different location.

### Running the Application

1. **Start the Django Backend**

   ```bash
   cd backend
   source django_venv/bin/activate  # If using virtual environment
   python manage.py runserver
   ```

   Backend will run on `http://localhost:8000`

2. **Start the React Frontend**

   ```bash
   cd frontend
   npm run dev
   ```

   Frontend will run on `http://localhost:5173`

3. **Access the Application**

   Open your browser and navigate to `http://localhost:5173`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register/` - Register a new user
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout

### Services
- `GET /api/services/` - List all services (public)
- `POST /api/services/` - Create a service (Provider only)
- `GET /api/services/:id/` - Get service details
- `PUT /api/services/:id/` - Update service (Owner only)
- `DELETE /api/services/:id/` - Delete service (Owner only)

### Categories
- `GET /api/categories/` - List all categories (public)
- `POST /api/categories/` - Create category (Provider only)
- `GET /api/categories/:id/` - Get category details
- `PUT /api/categories/:id/` - Update category (Provider only)
- `DELETE /api/categories/:id/` - Delete category (Provider only)

### Bookings
- `GET /api/bookings/` - List user's bookings (Seeker/Provider)
- `POST /api/bookings/` - Create booking (Seeker only)
- `GET /api/bookings/:id/` - Get booking details
- `PUT /api/bookings/:id/` - Update booking status (Provider/Seeker)
- `DELETE /api/bookings/:id/` - Cancel booking

### Users
- `GET /api/users/me/` - Get current user details
- `PATCH /api/users/me/` - Update user profile

## 👥 User Roles

### SEEKER
- Browse and search services
- Book services (8:00 AM - 5:00 PM)
- Manage personal bookings
- View booking history

### PROVIDER
- Create and manage service listings
- Manage categories
- View and update booking statuses
- Access provider dashboard with statistics

## 🎨 UI Features

- **Responsive Sidebar**: Collapsible sidebar with smooth animations
- **Dark Mode**: Consistent dark theme throughout
- **Smooth Animations**: Framer Motion powered transitions
- **Loading States**: Skeleton loaders and loading buttons
- **Toast Notifications**: User-friendly success/error messages
- **Error Boundaries**: Graceful error handling
- **Pagination**: Efficient data pagination for services

## 🔒 Security Features

- Firebase Authentication for secure user management
- Role-based access control (RBAC)
- Protected API endpoints
- CORS configuration for secure API access
- Input validation and sanitization

## 📱 Responsive Design

The application is fully responsive and works seamlessly on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (< 768px)

## 🧪 Development

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
# Frontend build
cd frontend
npm run build

# The build artifacts will be in the `dist/` directory
```

## 📝 Code Style

- **Frontend**: ESLint configuration included
- **Backend**: Follows Django and PEP 8 conventions
- **Components**: Reusable, modular components
- **API**: RESTful API design principles

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Firebase for authentication services
- Django REST Framework for robust API development
- React community for excellent libraries
- Tailwind CSS for rapid UI development

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for connecting service providers and seekers**
