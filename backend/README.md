# TripWise Backend - Complete Guide 🚀

Backend API for the TripWise travel planning and budget management application.

## 📋 Quick Summary

After analyzing your **entire frontend codebase**, here's what you need to build:

### Database: **PostgreSQL** ✅
- **4 core tables**: users, trips, expenses, refresh_tokens
- **2 optional tables**: destination_notes, budget_alerts
- Strong relationships, data integrity, perfect for financial data

### API: **~20 REST endpoints**
- Authentication (5): register, login, logout, refresh, onboarding
- Users (2): get profile, update profile  
- Trips (5): full CRUD operations
- Expenses (5): full CRUD operations
- Dashboard (2): statistics and analytics

### Tech Stack: **Java Spring Boot**
- Spring Boot 3.x + Spring Data JPA
- PostgreSQL with Hibernate
- JWT authentication
- BCrypt password hashing
- Swagger API documentation

---

## 📚 Complete Documentation

I've created **3 comprehensive guides** for you:

### 1. 📊 [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
- Complete PostgreSQL table designs
- All SQL CREATE statements
- Relationships & foreign keys
- Triggers for auto-calculations
- Why PostgreSQL over MongoDB

### 2. 🔌 [API_ENDPOINTS.md](./API_ENDPOINTS.md)
- All 20+ endpoint specifications
- Request/Response examples
- HTTP methods & status codes
- Query parameters
- Authentication headers

### 3. 🏗️ [SPRING_BOOT_STRUCTURE.md](./SPRING_BOOT_STRUCTURE.md)
- Complete project structure
- Maven dependencies (pom.xml)
- Application configuration
- Implementation phases (6 weeks)
- Security best practices

---

## 🎯 What Your Frontend Needs

Based on frontend code analysis:

### Core Features:
1. ✅ **User Authentication** - Register, Login, JWT tokens
2. ✅ **Trip Management** - CRUD operations with budget tracking
3. ✅ **Expense Tracking** - Multi-currency expense management
4. ✅ **Dashboard** - Statistics, charts, analytics
5. ✅ **Budget Calculations** - Auto-update spent/remaining amounts

### Optional Features:
- Destination notes (travel tips)
- Budget alerts (warnings at 75%+)
- Export to CSV
- Search & filter

---

## 🗄️ Database Tables (PostgreSQL)

### Core Tables (MUST HAVE):
```
1. users          → Authentication & profiles
2. trips          → Trip planning & budgets  
3. expenses       → Expense tracking
4. refresh_tokens → JWT token management
```

### Optional Tables:
```
5. destination_notes → Travel tips & notes
6. budget_alerts     → Alert preferences
```

### Key Relationships:
```
User (1) ──┐
           ├──→ Trips (many)
           │     └──→ Expenses (many)
           │     └──→ Notes (many)
           └──→ Refresh Tokens (many)
```

---

## 🚀 Tech Stack Recommendation

| Component | Technology | Why? |
|-----------|-----------|------|
| **Database** | PostgreSQL | Relational data, ACID, financial calculations |
| **Framework** | Spring Boot 3.x | Industry standard, robust, great docs |
| **ORM** | Spring Data JPA | Seamless PostgreSQL integration |
| **Auth** | JWT + BCrypt | Stateless, secure, scalable |
| **Docs** | Swagger/OpenAPI | Auto-generated API documentation |
| **Testing** | JUnit 5 + MockMvc | Comprehensive testing support |

### Why NOT MongoDB?
❌ Your data is highly relational (User → Trips → Expenses)  
❌ Financial data needs ACID transactions  
❌ Complex aggregations better in SQL  
❌ No schema flexibility needed  

---

## 📦 Maven Dependencies

```xml
<!-- Core Spring Boot -->
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-validation

<!-- Database -->
- postgresql

<!-- JWT Authentication -->
- jjwt-api (0.12.3)
- jjwt-impl
- jjwt-jackson

<!-- Utilities -->
- lombok (optional - reduces boilerplate)
- springdoc-openapi (Swagger docs)

<!-- Testing -->
- spring-boot-starter-test
- spring-security-test
```

See [SPRING_BOOT_STRUCTURE.md](./SPRING_BOOT_STRUCTURE.md) for complete pom.xml

---

## 🔧 Quick Start

### 1. Setup PostgreSQL
```bash
# Install PostgreSQL, then:
psql -U postgres
CREATE DATABASE tripwise_db;
\q
```

### 2. Create Spring Boot Project
- Use [Spring Initializr](https://start.spring.io)
- Or IntelliJ IDEA / VS Code Spring Boot extension
- Java 17+, Maven, Dependencies listed above

### 3. Configure application.properties
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/tripwise_db
spring.datasource.username=your_username
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

jwt.secret=your-secret-key-min-256-bits
jwt.expiration=3600000
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
```

Backend runs on: `http://localhost:8080`

### 5. Access API Docs
```
http://localhost:8080/swagger-ui.html
```

---

## ✅ Implementation Roadmap (6 Weeks)

### Week 1: Foundation
- [ ] Set up Spring Boot project
- [ ] Configure PostgreSQL connection
- [ ] Create entity classes (User, Trip, Expense)
- [ ] Create repository interfaces
- [ ] Set up Security & JWT config

### Week 2: Authentication
- [ ] Implement JWT token provider
- [ ] AuthService (register, login, refresh)
- [ ] AuthController endpoints
- [ ] Password hashing with BCrypt
- [ ] Test authentication flow

### Week 3-4: Core Features
- [ ] TripService & TripController (CRUD)
- [ ] ExpenseService & ExpenseController (CRUD)
- [ ] Auto-calculate budget trigger/listener
- [ ] Input validation (@Valid annotations)
- [ ] Test all endpoints

### Week 5: Dashboard & Enhancements
- [ ] Dashboard statistics endpoint
- [ ] Category breakdown calculations
- [ ] Search & filter endpoints
- [ ] Exception handling
- [ ] API documentation (Swagger)

### Week 6: Integration & Testing
- [ ] Connect frontend to backend
- [ ] CORS configuration
- [ ] End-to-end testing
- [ ] Bug fixes
- [ ] Deployment preparation

---

## 🔐 Security Checklist

- ✅ Hash passwords with BCrypt (NEVER plain text!)
- ✅ Implement JWT authentication
- ✅ Add CORS configuration for frontend
- ✅ Validate all inputs with @Valid
- ✅ Use HTTPS in production
- ✅ Don't expose stack traces to clients
- ✅ SQL injection: protected by JPA
- ✅ Rate limiting (optional)

---

## 📊 Key Backend Features

### 1. Auto-Budget Calculation
When expense added/updated/deleted:
- Automatically update trip's `spent_amount`
- Recalculate `remaining_budget`
- Use PostgreSQL trigger or JPA listeners

### 2. Multi-Currency Support
- Store original currency & amount
- Store converted amount in trip's currency
- Frontend can handle conversion rates

### 3. Data Validation
```java
@NotBlank(message = "Name is required")
@Email(message = "Invalid email format")
@Min(value = 0, message = "Budget must be positive")
@Future(message = "End date must be in future")
```

---

## 🎯 API Response Format

### Success:
```json
{
  "success": true,
  "message": "Optional message",
  "data": { /* response data */ }
}
```

### Error:
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "timestamp": "2026-01-23T10:00:00Z"
}
```

---

## 📁 Project Structure

```
backend/
├── src/main/java/com/tripwise/
│   ├── TripwiseApplication.java
│   ├── controller/     # REST endpoints
│   ├── service/        # Business logic
│   ├── repository/     # Database access
│   ├── entity/         # JPA entities
│   ├── dto/            # Request/Response
│   ├── security/       # JWT & Auth
│   ├── config/         # Configuration
│   └── exception/      # Error handling
├── src/main/resources/
│   └── application.properties
├── pom.xml
└── Documentation files (this folder)
```

---

## 📖 Reading Order

1. **Start here** ← You are here!
2. Read [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - Understand tables
3. Read [API_ENDPOINTS.md](./API_ENDPOINTS.md) - Know your endpoints
4. Read [SPRING_BOOT_STRUCTURE.md](./SPRING_BOOT_STRUCTURE.md) - Project setup
5. Create Spring Boot project
6. Start coding! 🚀

---

## 🤝 Frontend Integration

### CORS Configuration
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:5173")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowCredentials(true);
            }
        };
    }
}
```

### Frontend API Base URL
Update `frontend/src/lib/axios.ts`:
```typescript
const API_BASE_URL = 'http://localhost:8080/api';
```

---

## 🧪 Testing

### Unit Tests
```java
@SpringBootTest
class TripServiceTest {
    @Autowired
    private TripService tripService;
    
    @Test
    void testCreateTrip() {
        // Test trip creation logic
    }
}
```

### Integration Tests
```java
@WebMvcTest(TripController.class)
class TripControllerTest {
    @Autowired
    private MockMvc mockMvc;
    
    @Test
    void testGetTrips() throws Exception {
        mockMvc.perform(get("/api/trips"))
               .andExpect(status().isOk());
    }
}
```

---

## 📞 Need Help?

All documentation is ready:
- ✅ Database schema with SQL
- ✅ API endpoint specifications  
- ✅ Spring Boot project structure
- ✅ Dependencies & configuration
- ✅ Security best practices
- ✅ 6-week implementation plan

**Everything you need to build the backend is here! 🎉**

---

## 🎓 Resources

- [Spring Boot Official Docs](https://spring.io/projects/spring-boot)
- [Spring Data JPA Guide](https://spring.io/projects/spring-data-jpa)
- [JWT Introduction](https://jwt.io/introduction)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

**Ready to build? Start with Week 1 tasks above! 💪**
