# Authentication & JWT (Java/Spring Boot)

This section covers implementing JWT authentication in the Java/Spring Boot PetLink backend, mirroring the C#/.NET approach.

## Key Steps
1. Add dependencies: `spring-boot-starter-security`, `jjwt` or `spring-boot-starter-oauth2-resource-server`.
2. Configure JWT secret in `application.properties`.
3. Create a filter to validate JWT tokens.
4. Secure endpoints using `@PreAuthorize` or security config.
5. Issue JWT tokens on login.

## Example Config
```properties
# application.properties
jwt.secret=your-secret-key
jwt.expiration=3600000
```

## Example Security Config
```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {
    // ... configure authentication manager, JWT filter, etc.
}
```

## Notes
- Use `@CrossOrigin` for CORS.
- Use `@ControllerAdvice` for error handling.
- Use `@Value` to inject config values.

See the migration guide for mapping from C# JWT setup.
# API Structure (Java/Spring Boot)

This section describes the recommended structure for the PetLink backend in Java using Spring Boot, mapping each part to the original C#/.NET structure.

## Recommended Structure

- `controller/` — REST controllers (maps to C# Controllers)
- `service/` — Business logic (maps to C# Services)
- `model/` — Data models and DTOs (maps to C# Models)
- `config/` — Configuration classes (maps to appsettings.json, Startup)
- `exception/` — Exception handling (maps to Middleware/Filters)
- `repository/` — Data access (if needed)

## Example Directory Layout

```
com.petlink
├── PetLinkApplication.java
├── config
├── controller
├── exception
├── model
├── repository
├── service
```

## Notes
- Use `@RestController` for controllers.
- Use `@Service` for business logic.
- Use `@ControllerAdvice` for global exception handling.
- Use `application.properties` or `application.yml` for configuration.

See the migration guide for detailed mapping.

