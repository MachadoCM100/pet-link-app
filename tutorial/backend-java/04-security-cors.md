# Security & CORS (Java/Spring Boot)

This section covers configuring CORS and security in the Java/Spring Boot PetLink backend.

## CORS
- Use `@CrossOrigin(origins = "http://localhost:4200")` on controllers or configure globally.
- For global config, implement `WebMvcConfigurer`.

## Example
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:4200")
            .allowedMethods("GET", "POST", "PUT", "DELETE")
            .allowedHeaders("*")
            .allowCredentials(true);
    }
}
```

## Security
- Use Spring Security for authentication/authorization.
- Secure endpoints as needed.

See the migration guide for mapping from C# CORS/security setup.
# Controllers & Endpoints (Java/Spring Boot)

This section explains how to implement REST controllers and endpoints in the Java/Spring Boot PetLink backend, mapping to the original C# controllers.

## Key Points
- Use `@RestController` for controllers.
- Use `@RequestMapping` or `@GetMapping`, `@PostMapping`, etc. for endpoints.
- Use `@RequestBody` for POST/PUT data, `@PathVariable` for URL params.
- Use `@Valid` for validation.

## Example
```java
@RestController
@RequestMapping("/api/pets")
public class PetController {
    // ... endpoint methods
}
```

## Notes
- Map endpoints to match the Angular frontend's expectations.
- Use DTOs for request/response bodies.

See the migration guide for mapping from C# controllers.

