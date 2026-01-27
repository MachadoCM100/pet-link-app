# Running the Application

## Overview

This guide provides step-by-step instructions for running the PetLink application in development mode. The application consists of two parts that need to be started separately: the .NET API backend and the Angular frontend.

## Quick Start

### Step 1: Start the Backend API

Open a terminal/command prompt and navigate to the API project:

```powershell
cd PetLink.API
dotnet run
```

**Expected Output**:

```
Building...
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
info: Microsoft.Hosting.Lifetime[0]
      Hosting environment: Development
info: Microsoft.Hosting.Lifetime[0]
      Content root path: C:\path\to\PetLink\PetLink.API
```

### Step 2: Start the Frontend Application

Open a **new** terminal/command prompt and navigate to the Angular project:

```powershell
cd petlink-ui
ng serve
```

**Expected Output**:

```
✔ Browser application bundle generation complete.

Initial Chunk Files | Names         |  Raw Size
vendor.js           | vendor        |   2.50 MB | 
main.js             | main          | 207.13 kB | 
polyfills.js        | polyfills     |  90.20 kB | 
styles.css          | styles        |  69.58 kB | 
runtime.js          | runtime       |   6.15 kB | 

                    | Initial Total |   2.87 MB

Build at: 2024-01-15T10:00:00.000Z - Hash: a1b2c3d4e5f6 - Time: 5432ms

** Angular Live Development Server is listening on localhost:4200, open your browser on http://localhost:4200/ **

✔ Compiled successfully.
```

### Step 3: Access the Application

1. Open your web browser
2. Navigate to: `http://localhost:4200`
3. You should see the PetLink login page

## Application URLs

### Development URLs

- **Frontend**: `http://localhost:4200`
- **Backend API**: `http://localhost:5000`
- **API Documentation**: `http://localhost:5000/swagger` (if Swagger is configured)

### API Endpoints

- **Login**: POST `http://localhost:5000/auth/login`
- **Get Pets**: GET `http://localhost:5000/api/pets`

## Login Credentials

For the demo application, use these credentials:

- **Username**: `admin`
- **Password**: `password`

## Detailed Startup Process

### Backend API Startup

#### 1. Navigate to API Project

```powershell
cd C:\path\to\PetLink\PetLink.API
```

#### 2. Restore Dependencies (if needed)

```powershell
dotnet restore
```

#### 3. Build the Project

```powershell
dotnet build
```

**Successful Build Output**:

```
Microsoft (R) Build Engine version 17.0.0+c9eb9dd64 for .NET
Copyright (C) Microsoft Corporation. All rights reserved.

  Determining projects to restore...
  All projects are up-to-date for restore.
  PetLink.API -> C:\path\to\PetLink\PetLink.API\bin\Debug\net9.0\PetLink.API.dll

Build succeeded.
    0 Warning(s)
    0 Error(s)

Time Elapsed 00:00:02.50
```

#### 4. Run the Application

```powershell
dotnet run
```

**Startup Logs**:

```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
info: Microsoft.Hosting.Lifetime[0]
      Application started. Press Ctrl+C to shut down.
```

#### 5. Verify API is Running

Open browser to `http://localhost:5000` or use curl:

```powershell
# Test API health
curl http://localhost:5000/api/pets
# Should return 401 Unauthorized (requires authentication)
```

### Frontend Application Startup

#### 1. Navigate to Angular Project

```powershell
cd C:\path\to\PetLink\petlink-ui
```

#### 2. Install Dependencies (if needed)

```powershell
npm install
```

**Installation Output**:

```
npm WARN deprecated package@version: message
added 1234 packages from 5678 contributors and audited 9012 packages in 45.678s
found 0 vulnerabilities
```

#### 3. Start Development Server

```powershell
ng serve
```

**Alternative with specific options**:

```powershell
ng serve --open --port 4200
```

Options:

- `--open`: Automatically opens browser
- `--port 4200`: Specifies port (default is 4200)
- `--host 0.0.0.0`: Makes server accessible from other devices

#### 4. Verify Frontend is Running

The Angular CLI will automatically open your browser to `http://localhost:4200`.

## Application Flow

### Complete User Journey

1. **Start Backend**: API server running on port 5000
2. **Start Frontend**: Angular dev server on port 4200
3. **Load Application**: Browser requests `http://localhost:4200`
4. **Default Route**: Application redirects to `/login`
5. **Login Form**: User enters credentials (admin/password)
6. **Authentication**: Frontend sends POST to `http://localhost:5000/auth/login`
7. **Token Response**: Backend returns JWT token
8. **Store Token**: Frontend saves token to localStorage
9. **Navigate**: Redirect to `/pets` page
10. **Fetch Data**: Frontend sends GET to `http://localhost:5000/api/pets` with Bearer token
11. **Display Data**: Show pet list from API response

## Development Mode Features

### Hot Reload (Angular)

The Angular development server provides hot reload:

- **File Changes**: Automatically rebuilds and refreshes browser
- **TypeScript**: Compiles on save
- **SCSS/CSS**: Styles update without full page reload
- **Templates**: HTML changes reflect immediately

### Watch Mode (.NET)

For automatic .NET rebuilds, use watch mode:

```powershell
dotnet watch run
```

**Features**:

- **Code Changes**: Automatically rebuilds and restarts
- **Configuration Changes**: Reloads appsettings.json
- **Fast Feedback**: Quick development cycle

## Stopping the Application

### Stop Angular Development Server

In the Angular terminal:

- **Windows**: `Ctrl + C`
- **Mac/Linux**: `Cmd + C` or `Ctrl + C`

### Stop .NET API

In the API terminal:

- **Windows**: `Ctrl + C`
- **Mac/Linux**: `Cmd + C` or `Ctrl + C`

**Graceful Shutdown**: Both applications handle shutdown signals properly and clean up resources.

## Alternative Startup Methods

### Using Visual Studio Code

#### 1. Open Workspace

```powershell
code .
```

#### 2. Use Integrated Terminal

- **Terminal Menu**: Terminal > New Terminal
- **Split Terminals**: Run both backend and frontend in separate terminal panes

#### 3. Debug Configuration

Use F5 to start debugging with launch.json configuration.

### Using Visual Studio 2022

#### 1. Open Solution

Open `PetLink.API.sln` in Visual Studio.

#### 2. Set Startup Project

Right-click on `PetLink.API` project and select "Set as Startup Project".

#### 3. Start Debugging

Press F5 or click the "Start" button.

### Using Docker (Future Enhancement)

```dockerfile
# Dockerfile example for API
FROM mcr.microsoft.com/dotnet/aspnet:9.0
COPY bin/Release/net9.0/publish/ App/
WORKDIR /App
ENTRYPOINT ["dotnet", "PetLink.API.dll"]
```

```powershell
# Build and run with Docker
docker build -t petlink-api .
docker run -p 5000:80 petlink-api
```

## Production Deployment

### Angular Production Build

```powershell
ng build --prod
```

**Output**: Creates `dist/` folder with optimized files for deployment.

### .NET Production Build

```powershell
dotnet publish --configuration Release
```

**Output**: Creates `bin/Release/net9.0/publish/` folder with deployment files.

## Troubleshooting Common Issues

### Port Conflicts

**Problem**: "Port already in use" error

**Solution**:

```powershell
# Check what's using the port
netstat -ano | findstr :5000

# Kill the process
taskkill /PID <process_id> /F

# Or use different ports
ng serve --port 4201
dotnet run --urls=http://localhost:5001
```

### CORS Issues

**Problem**: "CORS policy" errors in browser console

**Solution**: Verify CORS configuration in `Program.cs`:

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalhostPolicy", builder =>
    {
        builder.WithOrigins("http://localhost:4200")  // Must match Angular port
               .AllowAnyMethod()
               .AllowAnyHeader()
               .AllowCredentials();
    });
});
```

### Authentication Issues

**Problem**: "401 Unauthorized" responses

**Solutions**:

1. **Check Credentials**: Use `admin` / `password`
2. **Check Token**: Verify JWT token in browser localStorage
3. **Check Headers**: Ensure Authorization header is sent
4. **Check API Logs**: Look for authentication errors in API console

### Network Issues

**Problem**: Cannot connect to API from frontend

**Solutions**:

1. **Verify API is Running**: Check `http://localhost:5000` in browser
2. **Check Firewall**: Ensure ports 4200 and 5000 are not blocked
3. **Check Environment**: Verify `environment.ts` has correct API URL

## Performance Tips

### Development Performance

**Angular**:

- Use `ng serve --live-reload` for faster rebuilds
- Install Angular CLI globally for better performance
- Use `ng build --watch` for build-only mode

**.NET**:

- Use `dotnet watch run` for automatic restarts
- Enable logging only for necessary categories
- Use Debug configuration for development

### Memory Usage

**Angular**: Development server can use significant memory with large projects

**.NET**: Watch mode keeps previous builds in memory

**Solution**: Restart development servers periodically if experiencing slowdowns.

## Next Steps

Once you have the application running:

1. [Testing Guide](./testing-guide.md) - Learn how to test the application
2. [Frontend Tutorial](../frontend/01-application-structure.md) - Understand the Angular code
3. [Backend Tutorial](../backend-old/01-api-structure.md) - Understand the .NET API code

## Getting Help

If you encounter issues not covered in this guide:

1. Check the application logs in the terminal
2. Use browser developer tools to inspect network requests
3. Review the troubleshooting section above
4. Check the GitHub issues page for known problems
