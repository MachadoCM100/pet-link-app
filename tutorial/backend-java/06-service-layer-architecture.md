# Service Layer Architecture (Java/Spring Boot)

This section describes the service layer in the Java/Spring Boot PetLink backend, mapping to the original C# services.

## Key Points
- Use `@Service` for business logic classes.
- Inject services using `@Autowired` or constructor injection.
- Keep controllers thin; put business logic in services.

## Example
```java
@Service
public class PetService {
    // ... business logic
}
```

## Notes
- Use interfaces for service contracts if needed.
- Map to C#'s `IPetService`, `PetService`, etc.

See the migration guide for mapping from C# services.

