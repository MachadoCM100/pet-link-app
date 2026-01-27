# Models and Interfaces

## Overview

TypeScript interfaces and models provide type safety, better IDE support, and clear data contracts in the PetLink application. They define the shape of data flowing between components, services, and the backend API.

## Interface Architecture

### 1. Data Models - Core Data Structures
### 2. API Contracts - Request/Response Types  
### 3. Component Models - UI-specific Types
### 4. Type Safety - Compile-time Validation

## Pet Model (`pet.model.ts`)

Defines the core data structures for pet-related functionality.

```typescript
export interface Pet {
  id: number;
  name: string;
  type: string;
  adopted: boolean;
}

export interface PetType {
  id: number;
  name: string;
}
```

### Pet Interface Analysis

#### Core Properties

```typescript
export interface Pet {
  id: number;        // Unique identifier
  name: string;      // Pet's display name
  type: string;      // Pet category (Dog, Cat, etc.)
  adopted: boolean;  // Adoption status
}
```

**Property Design Decisions**:

- **`id: number`**: Numeric identifiers for database compatibility
- **`name: string`**: Text field for pet names
- **`type: string`**: Flexible string for pet categories
- **`adopted: boolean`**: Clear binary state for adoption status

#### TypeScript Benefits

**Compile-time Validation**:

```typescript
// This would cause TypeScript errors:
const invalidPet: Pet = {
  id: "not-a-number",    // Error: Type 'string' is not assignable to type 'number'
  name: 123,             // Error: Type 'number' is not assignable to type 'string'
  type: "Dog",
  // adopted: missing     // Error: Property 'adopted' is missing
};
```

**IDE IntelliSense**:

- Auto-completion for property names
- Type checking in templates and components
- Refactoring support across the codebase
- Documentation through type definitions

### PetType Interface

```typescript
export interface PetType {
  id: number;
  name: string;
}
```

**Purpose**: Represents pet categories/classifications

**Use Cases**:

- Dropdown selection lists
- Filtering and categorization
- Normalized data relationships
- Future expansion for pet type management

**Relationship to Pet**:

```typescript
// Future enhancement possibility:
export interface Pet {
  id: number;
  name: string;
  typeId: number;      // Reference to PetType.id
  type?: PetType;      // Optional populated relationship
  adopted: boolean;
}
```

## Authentication Models

### Login Request Interface

```typescript
// Implicit interface from AuthService usage
interface LoginRequest {
  username: string;
  password: string;
}
```

### Login Response Interface

```typescript
// From AuthService.login() return type
interface LoginResponse {
  token: string;
}
```

**API Contract Benefits**:

- Clear request/response structure
- Type safety for HTTP operations
- Self-documenting API interface

## Component-Specific Models

### UI State Models

```typescript
// Example: Login component state interface
interface LoginState {
  username: string;
  password: string;
  isLoading: boolean;
  errorMessage?: string;
}

// Example: Pet list component state interface
interface PetListState {
  pets: Pet[];
  loading: boolean;
  error?: string;
  selectedPet?: Pet;
}
```

**Benefits**:

- Clear component state definition
- Type-safe state management
- Better testing support

## Advanced TypeScript Features

### Optional Properties

```typescript
interface Pet {
  id: number;
  name: string;
  type: string;
  adopted: boolean;
  imageUrl?: string;    // Optional property
  description?: string; // Optional property
}
```

**Usage**:

```typescript
const pet: Pet = {
  id: 1,
  name: "Fluffy",
  type: "Cat",
  adopted: false
  // imageUrl and description can be omitted
};
```

### Union Types

```typescript
type PetStatus = 'available' | 'adopted' | 'pending';

interface Pet {
  id: number;
  name: string;
  type: string;
  status: PetStatus;  // Restricted to specific values
}
```

### Generic Interfaces

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Usage with Pet data
const petResponse: ApiResponse<Pet[]> = {
  success: true,
  data: [/* pet array */]
};
```

## Model Validation

### Runtime Validation

```typescript
// Type guard function
function isPet(obj: any): obj is Pet {
  return obj &&
    typeof obj.id === 'number' &&
    typeof obj.name === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.adopted === 'boolean';
}

// Usage in service
getPets(): Observable<Pet[]> {
  return this.http.get<any[]>(this.apiUrl).pipe(
    map(data => data.filter(isPet))  // Runtime validation
  );
}
```

### Schema Validation Libraries

**Potential Integration**:

```typescript
// Using libraries like Zod or Joi
import { z } from 'zod';

const PetSchema = z.object({
  id: z.number(),
  name: z.string(),
  type: z.string(),
  adopted: z.boolean()
});

type Pet = z.infer<typeof PetSchema>;
```

## Data Transformation Patterns

### API Response Mapping

```typescript
// Backend response might differ from frontend model
interface ApiPet {
  pet_id: number;          // Snake case from API
  pet_name: string;
  pet_type: string;
  is_adopted: boolean;
}

// Transform to frontend model
function mapApiPetToPet(apiPet: ApiPet): Pet {
  return {
    id: apiPet.pet_id,
    name: apiPet.pet_name,
    type: apiPet.pet_type,
    adopted: apiPet.is_adopted
  };
}
```

### Service Layer Transformation

```typescript
getPets(): Observable<Pet[]> {
  return this.http.get<ApiPet[]>(this.apiUrl).pipe(
    map(apiPets => apiPets.map(mapApiPetToPet))
  );
}
```

## Model Organization Strategies

### File Structure Options

#### Option 1: Single Models File

```
src/app/models/
└── index.ts  // All interfaces in one file
```

#### Option 2: Feature-based Models

```
src/app/
├── pets/
│   └── pet.model.ts
├── auth/
│   └── auth.model.ts
└── shared/
    └── common.model.ts
```

#### Option 3: Domain-driven Models

```
src/app/models/
├── pet.model.ts
├── user.model.ts
├── api.model.ts
└── ui.model.ts
```

### Barrel Exports

```typescript
// models/index.ts
export * from './pet.model';
export * from './auth.model';
export * from './api.model';

// Usage in components
import { Pet, LoginRequest, ApiResponse } from '../models';
```

## Integration with Angular Features

### Template Type Checking

```html
<!-- TypeScript checks template bindings -->
<div *ngFor="let pet of pets">
  <h3>{{ pet.name }}</h3>           <!-- ✓ Valid: name is string -->
  <p>{{ pet.adopted ? 'Yes' : 'No' }}</p>  <!-- ✓ Valid: adopted is boolean -->
  <span>{{ pet.invalidProp }}</span> <!-- ✗ Error: Property doesn't exist -->
</div>
```

### Form Model Integration

```typescript
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface PetForm {
  name: string;
  type: string;
  adopted: boolean;
}

createPetForm(): FormGroup {
  return this.fb.group({
    name: ['', Validators.required],
    type: ['', Validators.required],
    adopted: [false]
  });
}
```

### HTTP Client Integration

```typescript
// Type-safe HTTP operations
getPet(id: number): Observable<Pet> {
  return this.http.get<Pet>(`${this.apiUrl}/${id}`);
}

createPet(pet: Omit<Pet, 'id'>): Observable<Pet> {
  return this.http.post<Pet>(this.apiUrl, pet);
}

updatePet(pet: Pet): Observable<Pet> {
  return this.http.put<Pet>(`${this.apiUrl}/${pet.id}`, pet);
}
```

## Best Practices Implemented

### 1. Clear Naming Conventions

- Interface names describe the data they represent
- Property names are descriptive and consistent
- Use PascalCase for interfaces, camelCase for properties

### 2. Minimal Interfaces

- Interfaces contain only necessary properties
- Avoid over-engineering with unused fields
- Focus on current application needs

### 3. Type Safety First

- All data structures have explicit types
- No `any` types in model definitions
- Compile-time validation prevents runtime errors

### 4. Single Responsibility

- Each interface has a clear, focused purpose
- Avoid mixing concerns in single interfaces
- Separate API models from UI models when needed

### 5. Export Strategy

- Consistent export patterns
- Barrel exports for clean imports
- Organized file structure

## Testing with Models

### Model Testing

```typescript
describe('Pet Model', () => {
  it('should create valid pet object', () => {
    const pet: Pet = {
      id: 1,
      name: 'Test Pet',
      type: 'Dog',
      adopted: false
    };

    expect(pet.id).toBe(1);
    expect(pet.name).toBe('Test Pet');
    expect(pet.type).toBe('Dog');
    expect(pet.adopted).toBe(false);
  });
});
```

### Component Testing with Models

```typescript
beforeEach(() => {
  const mockPets: Pet[] = [
    { id: 1, name: 'Fluffy', type: 'Cat', adopted: false },
    { id: 2, name: 'Rex', type: 'Dog', adopted: true }
  ];
  
  petService.getPets.and.returnValue(of(mockPets));
});
```

## Future Enhancements

### Possible Model Extensions

- **Validation Decorators**: Runtime validation attributes
- **Computed Properties**: Derived fields from base properties
- **Inheritance**: Shared base interfaces for common properties
- **Enum Types**: Strict value constraints for categorical data
- **Date Handling**: Proper date type definitions and transformations

## Next Steps

- [Backend API Structure](../backend-old/01-api-structure.md)
- [Authentication and JWT](../backend-old/02-authentication-jwt.md)
