# Development Environment Setup

## Prerequisites

Before you can run the PetLink application, you need to install the required development tools and frameworks.

## Required Software

### 1. .NET 9.0 SDK

**Download**: [https://dotnet.microsoft.com/download/dotnet/9.0](https://dotnet.microsoft.com/download/dotnet/9.0)

**Verification**:

```powershell
dotnet --version
# Should output: 9.0.x
```

**Features Included**:

- .NET Runtime
- ASP.NET Core Runtime
- .NET CLI tools
- MSBuild

### 2. Node.js (LTS Version)

**Download**: [https://nodejs.org/](https://nodejs.org/)

**Recommended**: LTS (Long Term Support) version

**Verification**:

```powershell
node --version
# Should output: v18.x.x or v20.x.x

npm --version
# Should output: 9.x.x or 10.x.x
```

### 3. Angular CLI

**Installation**:

```powershell
npm install -g @angular/cli
```

**Verification**:

```powershell
ng version
# Should show Angular CLI version and Angular packages
```

## Development Tools (Recommended)

### Visual Studio Code

**Download**: [https://code.visualstudio.com/](https://code.visualstudio.com/)

**Recommended Extensions**:

- **C# for Visual Studio Code** - C# and .NET support
- **Angular Language Service** - Angular template support
- **REST Client** - API testing
- **GitLens** - Git integration
- **Thunder Client** - API testing alternative

### Visual Studio 2022 (Alternative)

**Download**: [https://visualstudio.microsoft.com/vs/](https://visualstudio.microsoft.com/vs/)

**Workloads Required**:

- ASP.NET and web development
- .NET desktop development

## Project Setup

### 1. Clone or Download the Project

```powershell
# If using Git
git clone <repository-url>
cd PetLink

# Or extract downloaded ZIP file to desired location
```

### 2. Backend Setup (.NET API)

Navigate to the API project directory:

```powershell
cd PetLink.API
```

**Restore NuGet packages**:

```powershell
dotnet restore
```

**Build the project**:

```powershell
dotnet build
```

**Verify setup**:

```powershell
dotnet run
# Should start the API on http://localhost:5000
```

### 3. Frontend Setup (Angular)

Navigate to the Angular project directory:

```powershell
cd petlink-ui
```

**Install npm packages**:

```powershell
npm install
```

**Build the project**:

```powershell
ng build
```

**Verify setup**:

```powershell
ng serve
# Should start the app on http://localhost:4200
```

## Environment Configuration

### Backend Configuration

The API uses configuration files for environment-specific settings.

**appsettings.json** (base configuration):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

**appsettings.Development.json** (development overrides):

```json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning"
    }
  }
}
```

### Frontend Configuration

The Angular app uses environment files for configuration.

**environment.ts** (development):

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:5000'
};
```

**environment.prod.ts** (production):

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api-url'
};
```

## Port Configuration

### Default Ports

- **Backend API**: http://localhost:5000
- **Frontend App**: http://localhost:4200

### Changing Ports

**Backend (launchSettings.json)**:

```json
{
  "profiles": {
    "http": {
      "commandName": "Project",
      "applicationUrl": "http://localhost:8080",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

**Frontend (angular.json)**:

```json
{
  "serve": {
    "builder": "@angular-devkit/build-angular:dev-server",
    "options": {
      "port": 3000
    }
  }
}
```

**Or use command line**:

```powershell
# Angular
ng serve --port 3000

# .NET API
dotnet run --urls=http://localhost:8080
```

## Database Setup (Future Enhancement)

Currently, the application uses hardcoded data. For database integration:

### SQL Server (Recommended)

**Download**: [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)

**Connection String Example**:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=PetLinkDb;Trusted_Connection=true;"
  }
}
```

### Entity Framework Core

**Package Installation**:

```powershell
dotnet add package Microsoft.EntityFrameworkCore.SqlServer
dotnet add package Microsoft.EntityFrameworkCore.Tools
```

## Development Workflow

### 1. Start Backend API

```powershell
cd PetLink.API
dotnet run
```

**Expected Output**:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

### 2. Start Frontend Application

```powershell
cd petlink-ui
ng serve
```

**Expected Output**:

```
Local:   http://localhost:4200/
press 'h' to show help
```

### 3. Access the Application

1. Open browser to http://localhost:4200
2. Login with demo credentials:
   - Username: `admin`
   - Password: `password`
3. Navigate to pets page to see data from API

## Troubleshooting

### Common Issues

#### Port Already in Use

**Error**: "Address already in use" or "Port 4200/5000 is already in use"

**Solution**:

```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# Or use different port
ng serve --port 4201
dotnet run --urls=http://localhost:5001
```

#### CORS Errors

**Error**: "Access to XMLHttpRequest blocked by CORS policy"

**Solution**: Verify CORS configuration in API Program.cs:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalhostPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:4200")  // Match Angular port
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});
```

#### Module Not Found Errors

**Error**: Various npm module errors

**Solution**:

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules
rm package-lock.json
npm install
```

#### .NET Build Errors

**Error**: Build or restore failures

**Solution**:

```powershell
# Clean and rebuild
dotnet clean
dotnet restore
dotnet build
```

### Log Files and Debugging

#### Backend Logging

Console output shows:

- HTTP requests
- Authentication attempts
- Application startup messages
- Error details

#### Frontend Debugging

Browser developer tools:

- **Console**: JavaScript errors and logs
- **Network**: HTTP requests and responses
- **Application**: Local storage and JWT tokens

## IDE Configuration

### Visual Studio Code

**Recommended settings.json**:

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

**Launch configuration** (.vscode/launch.json):

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": ".NET Core Launch (web)",
      "type": "coreclr",
      "request": "launch",
      "preLaunchTask": "build",
      "program": "${workspaceFolder}/PetLink.API/bin/Debug/net9.0/PetLink.API.dll",
      "args": [],
      "cwd": "${workspaceFolder}/PetLink.API",
      "stopAtEntry": false,
      "serverReadyAction": {
        "action": "openExternally",
        "pattern": "\\bNow listening on:\\s+(https?://\\S+)"
      },
      "env": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  ]
}
```

## Performance Optimization

### Development Performance

**Angular**:

```powershell
# Use development server with live reload
ng serve --live-reload

# Enable source maps for debugging
ng build --source-map
```

**.NET**:

```powershell
# Use watch mode for automatic rebuilds
dotnet watch run
```

### Build Optimization

**Angular Production Build**:

```powershell
ng build --prod
```

**.NET Release Build**:

```powershell
dotnet build --configuration Release
```

## Next Steps

After completing the environment setup:

1. [Running the Application](./running-application.md)
2. [Testing Guide](./testing-guide.md)
3. [Frontend Tutorial](../frontend/01-application-structure.md)
4. [Backend Tutorial](../backend/01-api-structure.md)
