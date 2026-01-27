# Error Handling & Validation (Java/Spring Boot)

This section covers error handling and validation in the Java/Spring Boot PetLink backend, mapping to the original C# approach.

## Error Handling
- Use `@ControllerAdvice` and `@ExceptionHandler` for global error handling.
- Return structured error responses (e.g., with error code/message).

## Validation
- Use javax.validation annotations (`@NotNull`, `@Size`, etc.).
- Use `@Valid` in controller method parameters.

## Example
```java
@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationException(MethodArgumentNotValidException ex) {
        // ... build error response
    }
}
```

See the migration guide for mapping from C# validation and exception handling.

