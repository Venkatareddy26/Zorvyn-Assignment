# The Ledger - Finance Data Processing and Access Control Backend

A full-stack financial dashboard system with role-based access control, built to demonstrate backend architecture, API design, data modeling, and business logic implementation.

## 🎯 Project Overview

This project implements a complete finance management system with:
- **Backend**: Node.js + Express + TypeScript + PostgreSQL
- **Frontend**: React + TypeScript + Vite + TailwindCSS
- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Database**: PostgreSQL with proper indexing and constraints

## 🏗️ Architecture & Design Decisions

### Backend Structure
```
backend/
├── src/
│   ├── database/
│   │   ├── setup.ts      # Database initialization & connection pool
│   │   └── seed.ts       # Database seeding with sample data
│   ├── middleware/
│   │   ├── auth.ts       # JWT authentication middleware
│   │   ├── rbac.ts       # Role-based access control
│   │   ├── validate.ts   # Input validation rules
│   │   └── errorHandler.ts # Global error handling
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── records.routes.ts
│   │   └── dashboard.routes.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── records.service.ts
│   │   └── dashboard.service.ts
│   ├── types/
│   │   └── index.ts      # TypeScript type definitions
│   └── index.ts          # Application entry point
```

### Key Design Principles
1. **Separation of Concerns**: Routes → Services → Database layers
2. **Type Safety**: Full TypeScript implementation with strict types
3. **Security First**: Parameterized queries, JWT tokens, password hashing
4. **Middleware Pattern**: Authentication, authorization, and validation as reusable middleware
5. **Error Handling**: Centralized error handling with proper HTTP status codes

## ✅ Assignment Requirements Coverage

### 1. User and Role Management ✓
- **Implementation**: `backend/src/services/users.service.ts`
- **Features**:
  - Create, read, update, delete users
  - Three role types: `admin`, `analyst`, `viewer`
  - User status management: `active`, `inactive`
  - Role-based permissions enforced at API level

**Roles & Permissions**:
- **Admin**: Full access - create/edit/delete records, manage users
- **Analyst**: Read access to all records + insights/analytics
- **Viewer**: Read-only access to dashboard summaries

### 2. Financial Records Management ✓
- **Implementation**: `backend/src/services/records.service.ts`
- **Features**:
  - CRUD operations for financial records
  - Fields: amount, type (income/expense), category, date, notes, status
  - Soft delete functionality (is_deleted flag)
  - Advanced filtering: by type, category, date range, search text
  - Pagination support (page, limit)

### 3. Dashboard Summary APIs ✓
- **Implementation**: `backend/src/services/dashboard.service.ts`
- **Endpoints**:
  - `GET /api/dashboard/summary` - Total income, expenses, net balance, record count
  - `GET /api/dashboard/trends?period=weekly|monthly` - Time-based trends
  - `GET /api/dashboard/categories` - Category-wise totals
  - `GET /api/dashboard/recent?limit=5` - Recent activity feed

### 4. Access Control Logic ✓
- **Implementation**: `backend/src/middleware/rbac.ts`
- **Method**: Middleware-based authorization
- **Examples**:
  ```typescript
  router.post('/records', authenticate, authorize('admin'), createRecord);
  router.get('/insights', authenticate, authorize('admin', 'analyst'), getInsights);
  router.get('/dashboard', authenticate, getDashboard); // All authenticated users
  ```

### 5. Validation and Error Handling ✓
- **Implementation**: `backend/src/middleware/validate.ts` + `errorHandler.ts`
- **Features**:
  - Input validation using express-validator
  - Proper HTTP status codes (400, 401, 403, 404, 500)
  - Detailed error messages with field-level validation errors
  - Global error handler for unhandled exceptions

### 6. Data Persistence ✓
- **Database**: PostgreSQL
- **Schema Design**:
  ```sql
  users (
    id, name, email, password_hash, role, status, 
    avatar_url, created_at, updated_at
  )
  
  financial_records (
    id, user_id, amount, type, category, date, 
    notes, status, is_deleted, created_at, updated_at
  )
  ```
- **Indexes**: Optimized queries with indexes on frequently queried fields
- **Constraints**: CHECK constraints for enums, foreign keys, NOT NULL constraints

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- npm or yarn

### Backend Setup

1. **Install dependencies**:
```bash
cd backend
npm install
```

2. **Configure environment**:
Create `backend/.env` file:
```env
PORT=3001
JWT_SECRET=your-secret-key-change-in-production

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ledger_db
DB_USER=postgres
DB_PASSWORD=your-password
```

3. **Initialize database**:
```bash
# Create database and seed with sample data
npm run seed
```

4. **Start backend**:
```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

Backend will run on `http://localhost:3001`

### Frontend Setup

1. **Install dependencies**:
```bash
cd frontend
npm install
```

2. **Start frontend**:
```bash
# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

Frontend will run on `http://localhost:5173`

## 🔐 Authentication & Testing

### Sample User Credentials
All users have password: `password123`

| Email | Role | Status |
|-------|------|--------|
| thor47222@gmail.com | admin | active |
| s.chen@ledger.arch | analyst | active |
| e.mist@ledger.arch | analyst | active |
| m.thorne@partner.com | viewer | inactive |

### API Testing

**Login**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"thor47222@gmail.com","password":"password123"}'
```

**Get Dashboard Summary** (requires authentication):
```bash
curl http://localhost:3001/api/dashboard/summary \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Create Record** (admin only):
```bash
curl -X POST http://localhost:3001/api/records \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1500.00,
    "type": "income",
    "category": "Consulting",
    "date": "2024-12-01",
    "notes": "Client project payment",
    "status": "verified"
  }'
```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user profile

### Users (Admin only)
- `GET /api/users` - List all users with stats
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

### Financial Records
- `GET /api/records` - List records (with filters & pagination)
- `GET /api/records/categories` - Get unique categories
- `GET /api/records/:id` - Get record by ID
- `POST /api/records` - Create record (admin only)
- `PUT /api/records/:id` - Update record (admin only)
- `DELETE /api/records/:id` - Soft delete record (admin only)

### Dashboard
- `GET /api/dashboard/summary` - Financial summary
- `GET /api/dashboard/trends?period=weekly|monthly` - Trends
- `GET /api/dashboard/categories` - Category totals
- `GET /api/dashboard/recent?limit=5` - Recent activity

## 🎨 Frontend Features

- **Responsive Design**: Mobile-first with Material Design 3 principles
- **Role-Based UI**: Dynamic navigation based on user role
- **Real-time Updates**: Instant feedback on all operations
- **Data Visualization**: Charts using Recharts library
- **Form Validation**: Client-side validation with error messages
- **Protected Routes**: Route guards based on authentication and role

## 🔒 Security Features

1. **Password Security**: bcrypt hashing with salt rounds
2. **SQL Injection Prevention**: Parameterized queries throughout
3. **JWT Authentication**: Secure token-based auth with expiration
4. **CORS Protection**: Configured for specific origins
5. **Helmet.js**: Security headers (XSS, clickjacking, MIME sniffing)
6. **Input Validation**: Server-side validation on all inputs
7. **Role-Based Authorization**: Middleware-enforced permissions
8. **Rate Limiting**: Prevents brute force attacks (5 login attempts per 15 min)
9. **Request Size Limits**: 10MB limit to prevent DoS attacks
10. **Data Sanitization**: Protection against NoSQL injection and XSS
11. **Security Headers**: Additional headers (X-Frame-Options, CSP, etc.)

### 🛡️ Supply Chain Security - Axios Compromise Mitigation

**Critical Advisory**: On March 30, 2026, axios versions 1.14.1 and 0.30.4 were compromised with a malicious dependency (`plain-crypto-js@4.2.1`) that deployed a cross-platform RAT.

**This project is SECURE**:
- ✅ Uses **axios@1.14.0** (last safe version before compromise)
- ✅ No `plain-crypto-js` in dependency tree
- ✅ All dependencies verified via `npm audit`
- ✅ Package-lock.json committed for reproducible builds

**Compromised versions to avoid**:
- ❌ axios@1.14.1 (contains malicious plain-crypto-js@4.2.1)
- ❌ axios@0.30.4 (contains malicious plain-crypto-js@4.2.1)

**Verification**: Run `npm list axios` to confirm version 1.14.0 is installed.

## 🧪 Testing Scenarios

### Test Admin Access
1. Login as admin (thor47222@gmail.com)
2. Navigate to Settings → Create new user
3. Navigate to Ledger → Create new transaction
4. Edit/delete existing transactions

### Test Analyst Access
1. Login as analyst (s.chen@ledger.arch)
2. Access Dashboard and Insights pages
3. View all transactions in Ledger
4. Verify cannot create/edit/delete transactions
5. Verify cannot access Settings page

### Test Viewer Access
1. Login as viewer (m.thorne@partner.com)
2. Should see account inactive error
3. Admin must activate account first

## 📝 Assumptions & Trade-offs

### Assumptions
1. **Single Currency**: All amounts in USD
2. **Timezone**: Server timezone for date handling
3. **Soft Delete**: Records are marked deleted, not physically removed
4. **Avatar URLs**: External URLs for user avatars
5. **Password Policy**: Minimum 6 characters (can be enhanced)

### Trade-offs
1. **JWT Storage**: localStorage (consider httpOnly cookies for production)
2. **Refresh Tokens**: Not implemented (24h token expiration)
3. **File Uploads**: Not implemented (avatar URLs only)
4. **Audit Logging**: Basic timestamps (can add detailed audit trail)
5. **Rate Limiting**: Not implemented (recommended for production)

## 🚧 Future Enhancements

- [ ] Refresh token mechanism
- [ ] Email notifications
- [ ] Export to CSV/PDF
- [ ] Advanced analytics and reporting
- [ ] Multi-currency support
- [ ] Budget tracking and alerts
- [ ] Recurring transactions
- [ ] File attachments for receipts
- [ ] Comprehensive unit and integration tests
- [ ] API documentation with Swagger/OpenAPI

## 🛠️ Technologies Used

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Security**: bcryptjs, helmet, cors
- **Logging**: morgan

### Frontend
- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router v7
- **HTTP Client**: Axios
- **Charts**: Recharts

## 📄 License

This project is created for assessment purposes.

## 👤 Author

Built as a demonstration of backend development skills focusing on:
- Clean architecture and code organization
- RESTful API design
- Database modeling and optimization
- Security best practices
- Role-based access control
- Error handling and validation
- Full-stack integration

---

**Note**: This is a demonstration project. For production use, additional security measures, testing, and monitoring should be implemented.
