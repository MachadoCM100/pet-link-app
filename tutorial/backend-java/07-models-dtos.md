# Models & DTOs (Java/Spring Boot)

This section covers defining models and DTOs in the Java/Spring Boot PetLink backend, mapping to the original C# models.

## Key Points
- Use POJOs (Plain Old Java Objects) for models and DTOs.
- Use validation annotations: `@NotNull`, `@Size`, etc.
- Use separate DTOs for requests and responses if needed.

## Example
```java
public class PetDto {
    @NotNull
    private String name;
    // ... other fields, getters/setters
}
```

## Notes
- Map C# models to Java classes.
- Use `@Valid` in controllers to trigger validation.

See the migration guide for mapping from C# models/DTOs.

