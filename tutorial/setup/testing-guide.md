# Testing Guide

## Overview

This guide covers testing strategies and tools for the PetLink application, including both manual testing procedures and automated testing approaches for the Angular frontend and .NET API backend.

## Manual Testing

### Application Flow Testing

#### 1. Authentication Testing

**Test Login Success**:

1. Start both backend and frontend applications
2. Navigate to `http://localhost:4200`
3. Verify redirect to login page
4. Enter credentials:
   - Username: `admin`
   - Password: `password`
5. Click login button
6. Verify:
   - No error messages
   - Redirect to pets page
   - JWT token stored in localStorage

**Test Login Failure**:

1. Navigate to login page
2. Enter invalid credentials:
   - Username: `wrong`
   - Password: `wrong`
3. Click login button
4. Verify:
   - Error message displayed
   - Remains on login page
   - No token in localStorage

#### 2. Navigation Testing

**Test Protected Route Access**:

1. Without authentication, try to access `http://localhost:4200/pets`
2. Verify redirect to login page
3. After authentication, verify access to pets page

**Test Route Guards**:

1. Login successfully
2. Navigate to pets page
3. Open developer tools
4. Clear localStorage (removes JWT token)
5. Try to refresh or navigate
6. Verify redirect to login

#### 3. API Integration Testing

**Test Pet Data Loading**:

1. Login successfully
2. Navigate to pets page
3. Open browser developer tools (F12)
4. Check Network tab
5. Verify:
   - GET request to `/api/pets`
   - Authorization header with Bearer token
   - 200 response with pet data
   - Data displayed in UI

### Browser Testing

#### Cross-Browser Compatibility

**Chrome**:

- Latest version recommended
- Best development tools support
- Full feature compatibility

**Firefox**:

- Test for compatibility differences
- Check console for any errors
- Verify all functionality works

**Edge**:

- Microsoft browser testing
- Windows environment validation

**Safari** (Mac only):

- WebKit rendering engine testing
- iOS compatibility verification

## API Testing

### REST Client Testing

#### Using VS Code REST Client Extension

Create a file `api-tests.http`:

```http
### Login Request
POST http://localhost:5000/auth/login
Content-Type: application/json

{
    "username": "admin",
    "password": "password"
}

### Get Pets (requires token from login)
GET http://localhost:5000/api/pets
Authorization: Bearer {{token}}
```

#### Using curl Commands

**Login Test**:

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'
```

**Get Pets Test**:

```bash
curl -X GET http://localhost:5000/api/pets \
  -H "Authorization: Bearer your-jwt-token-here"
```

#### Using Postman

**Setup Collection**:

1. Create new collection "PetLink API"
2. Add environment with `baseUrl` = `http://localhost:5000`

**Login Request**:

- Method: POST
- URL: `{{baseUrl}}/auth/login`
- Body (JSON):

```json
{
    "username": "admin",
    "password": "password"
}
```

**Get Pets Request**:

- Method: GET
- URL: `{{baseUrl}}/api/pets`
- Headers: `Authorization: Bearer {{token}}`

### Automated API Testing

#### Test Scripts for Postman

**Login Test Script**:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has token", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.token).to.be.a('string');
    pm.environment.set("token", jsonData.token);
});
```

**Get Pets Test Script**:

```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is array", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.be.an('array');
});

pm.test("Pets have required properties", function () {
    var jsonData = pm.response.json();
    jsonData.forEach(function(pet) {
        pm.expect(pet).to.have.property('id');
        pm.expect(pet).to.have.property('name');
        pm.expect(pet).to.have.property('type');
        pm.expect(pet).to.have.property('adopted');
    });
});
```

## Frontend Unit Testing (Angular)

### Angular Testing Setup

Angular CLI projects come with testing configured by default.

**Run Tests**:

```bash
cd petlink-ui
ng test
```

**Run Tests with Coverage**:

```bash
ng test --code-coverage
```

### Component Testing Examples

#### Login Component Test

```typescript
// login.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../core/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const authSpy = jasmine.createSpyObj('AuthService', ['login', 'storeToken']);
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    authService = TestBed.inject(AuthService) as jasmine.SpyObj<AuthService>;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should login successfully', () => {
    const mockResponse = { token: 'fake-jwt-token' };
    authService.login.and.returnValue(of(mockResponse));

    component.username = 'admin';
    component.password = 'password';
    component.login();

    expect(authService.login).toHaveBeenCalledWith('admin', 'password');
    expect(authService.storeToken).toHaveBeenCalledWith('fake-jwt-token');
    expect(router.navigate).toHaveBeenCalledWith(['/pets']);
  });
});
```

#### Service Testing

```typescript
// auth.service.spec.ts
import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should login user', () => {
    const mockResponse = { token: 'fake-token' };
    const username = 'admin';
    const password = 'password';

    service.login(username, password).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ username, password });
    req.flush(mockResponse);
  });

  it('should store token', () => {
    const token = 'test-token';
    spyOn(localStorage, 'setItem');

    service.storeToken(token);

    expect(localStorage.setItem).toHaveBeenCalledWith('jwtToken', token);
  });

  it('should check authentication', () => {
    spyOn(localStorage, 'getItem').and.returnValue('test-token');

    const result = service.isAuthenticated();

    expect(result).toBe(true);
  });
});
```

### End-to-End Testing (Angular)

#### Cypress Setup

**Install Cypress**:

```bash
npm install --save-dev cypress
```

**Cypress Configuration** (cypress.config.ts):

```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:4200',
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
```

#### E2E Test Examples

```typescript
// cypress/e2e/login.cy.ts
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should redirect to login page', () => {
    cy.url().should('include', '/login');
  });

  it('should login successfully with valid credentials', () => {
    cy.get('[data-cy="username"]').type('admin');
    cy.get('[data-cy="password"]').type('password');
    cy.get('[data-cy="login-button"]').click();

    cy.url().should('include', '/pets');
    cy.get('[data-cy="pet-list"]').should('be.visible');
  });

  it('should show error with invalid credentials', () => {
    cy.get('[data-cy="username"]').type('wrong');
    cy.get('[data-cy="password"]').type('wrong');
    cy.get('[data-cy="login-button"]').click();

    cy.get('[data-cy="error-message"]').should('be.visible');
    cy.url().should('include', '/login');
  });
});
```

## Backend Testing (.NET)

### Unit Testing Setup

**.NET projects include testing support by default**.

**Create Test Project**:

```bash
cd PetLink.API
dotnet new xunit -n PetLink.API.Tests
dotnet add PetLink.API.Tests/PetLink.API.Tests.csproj reference PetLink.API/PetLink.API.csproj
```

**Run Tests**:

```bash
dotnet test
```

### Controller Testing Examples

#### AuthController Tests

```csharp
// AuthControllerTests.cs
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace PetLink.API.Tests
{
    public class AuthControllerTests
    {
        private readonly AuthController _controller;

        public AuthControllerTests()
        {
            _controller = new AuthController();
        }

        [Fact]
        public void Login_ValidCredentials_ReturnsOkWithToken()
        {
            // Arrange
            var request = new LoginRequest
            {
                Username = "admin",
                Password = "password"
            };

            // Act
            var result = _controller.Login(request);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var response = okResult.Value;
            Assert.NotNull(response);
            
            // Check if response has token property
            var tokenProperty = response.GetType().GetProperty("token");
            Assert.NotNull(tokenProperty);
            Assert.NotNull(tokenProperty.GetValue(response));
        }

        [Fact]
        public void Login_InvalidCredentials_ReturnsUnauthorized()
        {
            // Arrange
            var request = new LoginRequest
            {
                Username = "wrong",
                Password = "wrong"
            };

            // Act
            var result = _controller.Login(request);

            // Assert
            Assert.IsType<UnauthorizedResult>(result);
        }
    }
}
```

#### PetsController Tests

```csharp
// PetsControllerTests.cs
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace PetLink.API.Tests
{
    public class PetsControllerTests
    {
        private readonly PetsController _controller;

        public PetsControllerTests()
        {
            _controller = new PetsController();
        }

        [Fact]
        public void GetPets_ReturnsOkWithPetArray()
        {
            // Act
            var result = _controller.GetPets();

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var pets = okResult.Value;
            Assert.NotNull(pets);
            
            // Verify it's an array
            Assert.IsAssignableFrom<Array>(pets);
        }
    }
}
```

### Integration Testing

#### API Integration Tests

```csharp
// IntegrationTests.cs
using Microsoft.AspNetCore.Mvc.Testing;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Xunit;

namespace PetLink.API.Tests
{
    public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly WebApplicationFactory<Program> _factory;
        private readonly HttpClient _client;

        public IntegrationTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task Login_ValidCredentials_ReturnsToken()
        {
            // Arrange
            var loginRequest = new
            {
                Username = "admin",
                Password = "password"
            };
            var json = JsonSerializer.Serialize(loginRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            // Act
            var response = await _client.PostAsync("/auth/login", content);

            // Assert
            response.EnsureSuccessStatusCode();
            var responseString = await response.Content.ReadAsStringAsync();
            Assert.Contains("token", responseString);
        }

        [Fact]
        public async Task GetPets_WithoutAuth_ReturnsUnauthorized()
        {
            // Act
            var response = await _client.GetAsync("/api/pets");

            // Assert
            Assert.Equal(System.Net.HttpStatusCode.Unauthorized, response.StatusCode);
        }
    }
}
```

## Performance Testing

### Load Testing with Artillery

**Install Artillery**:

```bash
npm install -g artillery
```

**Create Load Test** (load-test.yml):

```yaml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Login and get pets"
    flow:
      - post:
          url: "/auth/login"
          json:
            username: "admin"
            password: "password"
          capture:
            - json: "$.token"
              as: "token"
      - get:
          url: "/api/pets"
          headers:
            Authorization: "Bearer {{ token }}"
```

**Run Load Test**:

```bash
artillery run load-test.yml
```

## Automated Testing Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd petlink-ui
          npm install
      - name: Run tests
        run: |
          cd petlink-ui
          ng test --watch=false --browsers=ChromeHeadless

  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-dotnet@v1
        with:
          dotnet-version: '9.0.x'
      - name: Restore dependencies
        run: |
          cd PetLink.API
          dotnet restore
      - name: Run tests
        run: |
          cd PetLink.API
          dotnet test
```

## Test Data Management

### Mock Data for Testing

**Frontend Mock Service**:

```typescript
// mock-pet.service.ts
export class MockPetService {
  getPets(): Observable<Pet[]> {
    return of([
      { id: 1, name: 'Test Pet 1', type: 'Dog', adopted: false },
      { id: 2, name: 'Test Pet 2', type: 'Cat', adopted: true }
    ]);
  }
}
```

**Backend Test Data**:

```csharp
// TestData.cs
public static class TestData
{
    public static readonly Pet[] Pets = new[]
    {
        new Pet { Id = 1, Name = "Test Dog", Type = "Dog", Adopted = false },
        new Pet { Id = 2, Name = "Test Cat", Type = "Cat", Adopted = true }
    };
}
```

## Test Coverage

### Frontend Coverage

```bash
ng test --code-coverage
# Generates coverage report in coverage/ directory
```

### Backend Coverage

```bash
dotnet test --collect:"XPlat Code Coverage"
# Install reportgenerator for HTML reports
dotnet tool install -g dotnet-reportgenerator-globaltool
reportgenerator -reports:"coverage.xml" -targetdir:"coverage"
```

## Next Steps

After setting up testing:

1. **Implement Test-Driven Development**: Write tests before implementing features
2. **Set Up Continuous Integration**: Automate testing in your deployment pipeline
3. **Monitor Test Coverage**: Aim for high coverage percentages
4. **Regular Testing**: Run tests frequently during development

## Best Practices

1. **Test Pyramid**: Unit tests (many) > Integration tests (some) > E2E tests (few)
2. **Isolation**: Tests should not depend on each other
3. **Repeatability**: Tests should produce consistent results
4. **Fast Feedback**: Unit tests should run quickly
5. **Clear Names**: Test names should describe what they test
