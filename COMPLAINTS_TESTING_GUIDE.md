# Complaints Feature - Testing Guide

## Overview
The complaints system allows users to report issues related to services, bookings, user behavior, platform issues, or other concerns. Admins can review and respond to complaints.

## How Complaints Work

### Complaint Types
- **SERVICE_ISSUE**: Issues with a specific service
- **BOOKING_ISSUE**: Problems with a booking
- **USER_BEHAVIOR**: Reports about user behavior
- **PLATFORM_ISSUE**: Technical/platform problems
- **OTHER**: Any other type of complaint

### Complaint Statuses
- **PENDING**: New complaint, awaiting review
- **IN_REVIEW**: Admin is reviewing the complaint
- **RESOLVED**: Complaint has been resolved
- **DISMISSED**: Complaint was dismissed

### Complaint Fields
- `user`: The user who created the complaint (auto-set)
- `service`: Optional - related service (if applicable)
- `booking`: Optional - related booking (if applicable)
- `complaint_type`: Type of complaint (required)
- `description`: Details of the complaint (required)
- `status`: Current status (default: PENDING, admin-only to change)
- `admin_response`: Admin's response (admin-only)
- `created_at`: When complaint was created
- `resolved_at`: When complaint was resolved (auto-set when status = RESOLVED)

## API Endpoints

### Create Complaint (POST)
```
POST /api/complaints/
Headers:
  Authorization: Bearer <firebase_token>
Body:
{
  "complaint_type": "SERVICE_ISSUE",
  "description": "The service provider didn't show up",
  "service": 1,  // Optional - service ID
  "booking": 2    // Optional - booking ID
}
```

### List Complaints (GET)
```
GET /api/complaints/
Headers:
  Authorization: Bearer <firebase_token>
```
- Regular users see only their own complaints
- Admins see all complaints

### Get Complaint Details (GET)
```
GET /api/complaints/{id}/
Headers:
  Authorization: Bearer <firebase_token>
```

### Update Complaint (PATCH/PUT) - Admin Only
```
PATCH /api/complaints/{id}/
Headers:
  Authorization: Bearer <firebase_token>
Body:
{
  "status": "RESOLVED",
  "admin_response": "We've addressed your concern..."
}
```

### Delete Complaint (DELETE) - Admin Only
```
DELETE /api/complaints/{id}/
Headers:
  Authorization: Bearer <firebase_token>
```

## Testing Methods

### Method 1: Using cURL/Postman

#### Step 1: Create a Complaint
```bash
# First, get your Firebase token (login via frontend and check localStorage)
# Then create a complaint:

curl -X POST http://localhost:8000/api/complaints/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "complaint_type": "SERVICE_ISSUE",
    "description": "The service provider was late and didn't complete the work properly",
    "service": 1
  }'
```

#### Step 2: List Your Complaints
```bash
curl -X GET http://localhost:8000/api/complaints/ \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

#### Step 3: Admin Updates Complaint
```bash
# Login as admin, then:
curl -X PATCH http://localhost:8000/api/complaints/1/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_FIREBASE_TOKEN" \
  -d '{
    "status": "IN_REVIEW",
    "admin_response": "We are investigating this issue."
  }'
```

### Method 2: Using Django Admin Panel

1. **Login to Django Admin**: `http://localhost:8000/admin/`
2. **Navigate to**: Services → Complaints
3. **Create a complaint manually** or view existing ones
4. **Edit status and admin_response** directly in the admin panel

### Method 3: Using Browser Console (JavaScript)

1. **Login to the frontend** (`http://localhost:5173/login`)
2. **Open browser console** (F12)
3. **Run this code**:
```javascript
// Get your Firebase token
const token = localStorage.getItem('firebaseIdToken');

// Create a complaint
fetch('http://localhost:8000/api/complaints/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    complaint_type: 'SERVICE_ISSUE',
    description: 'Test complaint from browser console',
    service: 1  // Use an existing service ID
  })
})
.then(res => res.json())
.then(data => console.log('Complaint created:', data))
.catch(err => console.error('Error:', err));

// List your complaints
fetch('http://localhost:8000/api/complaints/', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(res => res.json())
.then(data => console.log('My complaints:', data));
```

### Method 4: Using Python Django Shell

```python
# Run: python manage.py shell
from users.models import CustomUser
from services.models import Complaint, Service

# Get a user (seeker or provider)
user = CustomUser.objects.filter(role='SEEKER').first()

# Get a service (optional)
service = Service.objects.first()

# Create a complaint
complaint = Complaint.objects.create(
    user=user,
    service=service,
    complaint_type='SERVICE_ISSUE',
    description='Test complaint created via Django shell'
)

print(f"Created complaint: {complaint}")
print(f"Status: {complaint.status}")
```

## Admin Dashboard Testing

### View Complaints as Admin
1. **Login as admin**: `http://localhost:5173/admin` (Django admin session)
2. **Navigate to**: Complaints tab
3. **View all complaints** in the table
4. **Click "Edit"** on any complaint to:
   - Change status (PENDING → IN_REVIEW → RESOLVED)
   - Add admin response
   - View complaint details

### Test Complaint Workflow
1. **Create a complaint** (using any method above)
2. **Login as admin** → Go to Complaints tab
3. **Click "Edit"** on the complaint
4. **Change status** to "IN_REVIEW"
5. **Add admin response**: "We are looking into this..."
6. **Save** → Status updates
7. **Change status** to "RESOLVED"
8. **Save** → `resolved_at` timestamp is automatically set

## Testing Scenarios

### Scenario 1: User Creates Complaint About Service
1. User books a service
2. Service has an issue
3. User creates complaint with `complaint_type: "SERVICE_ISSUE"` and `service: <service_id>`
4. Admin reviews and responds

### Scenario 2: User Creates Complaint About Booking
1. User has a booking
2. Booking has an issue
3. User creates complaint with `complaint_type: "BOOKING_ISSUE"` and `booking: <booking_id>`
4. Admin reviews and responds

### Scenario 3: User Reports Platform Issue
1. User encounters a bug
2. User creates complaint with `complaint_type: "PLATFORM_ISSUE"`
3. Admin reviews and resolves

### Scenario 4: Admin Updates Complaint Status
1. Admin views complaint (status: PENDING)
2. Admin changes status to IN_REVIEW
3. Admin adds response
4. Admin changes status to RESOLVED
5. System auto-sets `resolved_at` timestamp

## Frontend UI

Currently, **only admins can view and manage complaints** via the Admin Dashboard (`/admin` → Complaints tab).

**Note**: There's no frontend UI for regular users to create complaints yet. Users can create complaints via:
- API calls (Postman, cURL, browser console)
- Django admin panel
- Django shell

## Quick Test Checklist

- [ ] Create complaint via API
- [ ] List complaints (user sees only their own)
- [ ] Admin sees all complaints
- [ ] Admin updates complaint status
- [ ] Admin adds response
- [ ] Status change to RESOLVED sets `resolved_at`
- [ ] Admin can view complaint details
- Permission check: Users can only see their own complaints
- Permission check: Only admins can update/delete complaints

## Example Test Data

```json
{
  "complaint_type": "SERVICE_ISSUE",
  "description": "The service provider didn't show up for the scheduled appointment. I waited for 2 hours.",
  "service": 1
}
```

```json
{
  "complaint_type": "BOOKING_ISSUE",
  "description": "I was charged twice for the same booking.",
  "booking": 1
}
```

```json
{
  "complaint_type": "PLATFORM_ISSUE",
  "description": "The search function is not working properly on mobile devices."
}
```

```json
{
  "complaint_type": "USER_BEHAVIOR",
  "description": "A user sent inappropriate messages through the platform."
}
```

