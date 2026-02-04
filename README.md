# TripWise - Travel Planning & Budget Management App

A full-stack travel planning and budget management application that helps you organize trips, track expenses, manage budgets, and collaborate with other travelers.

## Overview

TripWise is a comprehensive travel expense tracking system that allows users to:
- Create and manage trips with multi-currency support
- Track expenses with detailed categorization
- Collaborate with other travelers using role-based permissions (Owner/Editor/Viewer)
- Visualize spending patterns with charts and analytics
- Share trip budgets and manage member allocations

## Project Structure

```
tripwise/
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API service layer
│   │   ├── hooks/        # Custom React hooks
│   │   ├── context/      # React Context (Auth)
│   │   └── types/        # TypeScript type definitions
│   └── package.json
│
├── backend/              # Spring Boot REST API
│   ├── src/main/java/com/tripwise/
│   │   ├── controller/  # REST controllers
│   │   ├── service/     # Business logic
│   │   ├── repository/  # Data access layer
│   │   ├── entity/      # JPA entities
│   │   ├── dto/         # Data Transfer Objects
│   │   ├── security/    # JWT authentication
│   │   └── util/        # Helper utilities
│   ├── src/main/resources/
│   │   └── application.yml
│   └── pom.xml
│
├── docker-compose.yml    # Docker services configuration
└── README.md
```

## Getting Started

### Prerequisites

- **Docker & Docker Compose** (for backend + database)
- **Node.js 18+** (for frontend)
- **Java 17+** (if running backend without Docker)
- **PostgreSQL 16** (if running database without Docker)

### Quick Start with Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/snsyaqirah/tripwise.git
cd tripwise

# Start backend + database with Docker
docker-compose up -d

# Install frontend dependencies
cd frontend
npm install

# Start frontend development server
npm run dev
```

**Access the application:**
- Frontend: http://localhost:8081
- Backend API: http://localhost:8080
- Database: localhost:5432
 5
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui (Radix UI primitives)
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Date Handling**: date-fns
- **Testing**: Vitest + React Testing Library

### Backend
- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Database**: PostgreSQL 16
- **ORM**: Spring Data JPA (Hibernate)
- **Authentication**: JWT (JJWT 0.12.3)
- **Security**: Spring Security 6
- **Validation**: Hibernate Validator
- **Build Tool**: Maven
- **Utilities**: Lombok

### DevOps
- **Containerization**: Docker + Docker Compose
- **Database Management**: CloudBeaver (included in docker-compose)
# Run the application
./mvnw spring-boot:run
```

**Database Configuration:**
Create a PostgreSQL database and update `backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tripwise
    username: tripwise_user
    password: your_password
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:8081`

## Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
### Authentication & Authorization
- 🔐 User registration and login
- 🎫 JWT authentication with access & refresh tokens
- 🔒 Role-based access control (Owner/Editor/Viewer)
- 🛡️ Protected routes and API endpoints

### Trip Management
- ✈️ Create, update, and archive trips
- 🗺️ Multi-destination support with country selection
- 📅 Date range planning (start/end dates)
- 💰 Budget allocation (solo/shared/separated)
- 👥 Invite and manage trip members with permissions
- 📝 Destination notes and trip descriptions

### Expense Tracking
- 💵 Add, edit, and delete expenses
- 🏷️ Categorize expenses (Transport, Food, Accommodation, etc.)
- 💱 Multi-currency support with automatic conversion
- 📊 Real-time budget tracking and remaining balance
- 📈 Visual analytics with charts and graphs
- ⚠️ Budget alerts and overspending warnings

### Collaboration
- 👥 Multi-user trip sharing
- 🎭 Role-based permissions:
  - **Owner**: Full control (edit/delete/manage members)
  - **Editor**: Can add/edit expenses
  - Architecture

**Backend (3-Layer Architecture):**
```
Controller Layer → Service Layer → Repository Layer → Database
     ↓                  ↓                ↓
   REST API        Business Logic    Data Access
```

**Frontend (Component-Based):**
```
## Docker Services

The docker-compose.yml includes:

1. **Backend Service** - Spring Boot application on port 8080
2. **PostgreSQL** - Database on port 5432
3. **CloudBeaver** - Database management UI on port 8978

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop all services
docker-compose down

# Rebuild backend after code changes
docker-compose up -d --build backend
```

## Documentation

- [INTERVIEW_PREP.md](INTERVIEW_PREP.md) - Technical interview preparation
- [INTERVIEW_QUICK_REF.md](INTERVIEW_QUICK_REF.md) - Quick reference for interviews

## Testing

### Frontend Tests
```bash
cd frontend
npm run test        # Run tests
npm run test:ui     # Run with UI
npm run coverage    # Generate coverage report
```

### Backend Tests
```bash
cd backend
./mvnw test
```

## 🔧 Environment Variables

### Backend (application.yml)
```l
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/tripwise
    username: tripwise_user
    password: tripwise_password
  
jwt:
  secret: your-secret-key-here
  expiration: 900000        # 15 minutes
  refresh-expiration: 604800000  # 7 days
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:8080
```

## Deployment

This application is ready for deployment with Docker. Simply:

1. Set production environment variables
2. Build images: `docker-compose build`
3. Run containers: `docker-compose up -d`

For production, consider:
- Using environment-specific docker-compose files
- Setting up SSL/TLS certificates
- Configuring reverse proxy (nginx)
- Setting up CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Links

- **Repository**: https://github.com/snsyaqirah/tripwise
- **Live Demo**: Coming soon

## Author

**Siti Nur Syaqirah**
- GitHub: [@snsyaqirah](https://github.com/snsyaqirah)

## Acknowledgments

- Spring Boot for the robust backend framework
- React team for the excellent frontend library
- shadcn/ui for beautiful UI components
- PostgreSQL for reliable database
- Docker for containerization

---

**Built as a full-stack development showcase project**
- `DELETE /trips/{id}` - Archive trip

#### Expenses
- `GET /trips/{tripId}/expenses` - List trip expenses
- `POST /trips/{tripId}/expenses` - Add expense
- `PUT /expenses/{id}` - Update expense
- `DELETE /expenses/{id}` - Delete expense

#### Trip Members
- `GET /trips/{tripId}/members` - List trip members
- `POST /trips/{tripId}/members` - Add member
- `PUT /trips/{tripId}/members/{memberId}` - Update member role
- `DELETE /trips/{tripId}/members/{memberId}` - Remove member

### Database Schema

**Key Tables:**
- `users` - User accounts and authentication
- `trips` - Trip information with budgets
- `trip_members` - User-trip relationships with roles
- `expenses` - Expense records
- `trip_member_budgets` - Budget allocation per member
- `destination_notes` - Trip notes and planning

**Relationships:**
- One trip has many expenses (1:N)
- One trip has many members (N:M through trip_members)
- One user can have many trips (1:N as owner)
- One user can be member of many trips (N:M)

### Code Quality

#### Backend
- **Layered Architecture**: Separation of concerns (Controller/Service/Repository)
- **DTOs**: Separate request/response objects from entities
- **Validation**: Bean Validation with annotations
- **Security**: BCrypt password hashing, JWT tokens
- **Transactions**: @Transactional for data consistency
- **Error Handling**: Global exception handler

#### Frontend
- **TypeScript**: Full type safety
- **ESLint**: Code linting and formatting
- **Component Reusability**: Modular, composable components
- **Custom Hooks**: Shared logic extraction
- **Service Layer**: API calls abstracted from components
- **Context API**: Global state management (auth)tion

### User Experience
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Modern, clean UI with Tailwind CSS
- ⚡ Fast performance with React + Vite
- 🌙 Smooth animations with Framer Motion
- 🔍 Search and filter capabilities
- Coming soon...

## 🎯 Features

- 🗺️ Trip planning and management
- 💰 Budget tracking and expense management
- 📊 Visual charts and analytics
- 💱 Multi-currency support
- 📝 Destination notes
- 🌍 Travel portfolio with maps and timeline
- 🔔 Budget alerts and notifications
- 📤 Export functionality
- 🔐 Authentication and protected routes
- 📱 Responsive design

## 📝 Development

### Frontend Development

See [frontend/README.md](frontend/README.md) for detailed frontend documentation.

### Code Style

- ESLint for code linting
- TypeScript for type safety
- Component-based architecture
- Custom hooks for reusable logic

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is part of the Lovable platform.

## 🔗 Links

- **Repository**: https://github.com/snsyaqirah/tripwise
- **Lovable Project**: [Your Lovable Project URL]
