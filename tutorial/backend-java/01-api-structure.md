# Configuration & Startup (Java/Spring Boot)

This section covers application configuration and startup in the Java/Spring Boot PetLink backend, mapping to the original C# setup.

## Configuration
- Use `application.properties` or `application.yml` for settings (e.g., JWT secret, DB config, error messages).
- Use `@Value` or `@ConfigurationProperties` to inject config values.

## Startup
- Main class: `PetLinkApplication.java` with `@SpringBootApplication`.
- Beans and services are auto-configured via annotations.

## Example
```java
@SpringBootApplication
public class PetLinkApplication {
    public static void main(String[] args) {
        SpringApplication.run(PetLinkApplication.class, args);
    }
}
```

See the migration guide for mapping from C# Program.cs and appsettings.json.