# Migrating PetLink Backend from C# (.NET) to Java (Spring Boot)

This section guides you through transitioning the PetLink backend from C#/.NET to Java/Spring Boot, highlighting key parallelisms and differences. The goal is to keep the Angular frontend unchanged, ensuring seamless integration with the new Java backend.

## 1. Project Structure Comparison

| .NET (C#)                | Java (Spring Boot)           |
|--------------------------|------------------------------|
| Controllers/             | controller/                  |
| Services/                | service/                     |
| Models/                  | model/                       |
| Middleware/Filters/      | filter/, exception/handler/  |
| appsettings.json         | application.properties/yml   |
| Dependency Injection     | @Autowired/@Service          |
| Startup/Program.cs       | Application.java (main)      |

## 2. Key Concepts Mapping

| Concept                | C#/.NET Example                | Java/Spring Boot Example           |
|------------------------|--------------------------------|------------------------------------|
| Controller             | [ApiController]                | @RestController                    |
| Dependency Injection   | services.AddScoped<T, Impl>()  | @Service, @Autowired               |
| Model Validation       | [Required], [StringLength]     | @NotNull, @Size, @Valid            |
| Exception Handling     | Middleware, Filters            | @ControllerAdvice, @ExceptionHandler|
| JWT Auth               | AddJwtBearer                   | spring-boot-starter-oauth2-resource-server |
| Config                 | appsettings.json               | application.properties/yml         |
| CORS                   | builder.Services.AddCors       | @CrossOrigin, WebMvcConfigurer     |

## 3. Migration Steps

1. **Set up a new Spring Boot project** (Maven/Gradle, dependencies: web, security, validation, JWT, etc).
2. **Replicate models**: Convert C# models to Java POJOs with validation annotations.
3. **Controllers**: Map C# controllers to @RestController classes.
4. **Services**: Implement business logic in @Service classes.
5. **Validation**: Use javax.validation annotations and @Valid.
6. **Exception Handling**: Use @ControllerAdvice for global error handling.
7. **JWT Authentication**: Configure JWT filter and security config.
8. **CORS**: Configure allowed origins for Angular FE.
9. **Configuration**: Use application.properties/yml for settings.
10. **Testing**: Ensure endpoints and validation match the original API.

## 4. Additional Notes
- **DTOs**: Use DTOs for request/response as in C#.
- **Error Messages**: Centralize error messages in properties or config classes.
- **OpenAPI/Swagger**: Use springdoc-openapi for API docs.

---

**Next:** The old C# backend tutorial is now in the `tutorial/backend-old/` folder for reference.

