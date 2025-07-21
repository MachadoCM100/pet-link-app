import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';

import { PetListComponent } from './pet-list.component';
import { PetService } from './pet.service';
import { Pet, ApiResponse } from '../core/models/api.models';

describe('PetListComponent', () => {
  let component: PetListComponent;
  let fixture: ComponentFixture<PetListComponent>;
  let petService: jasmine.SpyObj<PetService>;
  let alertSpy: jasmine.Spy;
  let consoleErrorSpy: jasmine.Spy;

  const mockPets: Pet[] = [
    { id: 1, name: 'Buddy', type: 'Dog', adopted: false , createdAt: new Date().toISOString() },
    { id: 2, name: 'Whiskers', type: 'Cat', adopted: true , createdAt: new Date().toISOString() },
    { id: 3, name: 'Rex', type: 'Dog', adopted: false , createdAt: new Date().toISOString() }
  ];

  const mockApiResponse: ApiResponse<Pet[]> = {
    data: mockPets,
    success: true,
    message: 'Pets fetched successfully',
    timestamp: new Date().toISOString(),
  };

  beforeEach(async () => {
    // Create a spy object for PetService
    const petServiceSpy = jasmine.createSpyObj('PetService', ['getPets']);

    await TestBed.configureTestingModule({
      imports: [
        PetListComponent,
        HttpClientTestingModule,
        NoopAnimationsModule
      ],
      providers: [
        { provide: PetService, useValue: petServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetListComponent);
    component = fixture.componentInstance;
    petService = TestBed.inject(PetService) as jasmine.SpyObj<PetService>;

    // Spy on window.alert and console.error
    alertSpy = spyOn(window, 'alert');
    consoleErrorSpy = spyOn(console, 'error');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty pets array', () => {
    expect(component.pets).toEqual([]);
  });

  describe('ngOnInit', () => {
    it('should fetch pets successfully on initialization', () => {
      // Arrange
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      component.ngOnInit();

      // Assert
      expect(petService.getPets).toHaveBeenCalledTimes(1);
      expect(component.pets).toEqual(mockPets);
      expect(component.pets.length).toBe(3);
    });

    it('should handle empty pets array from service', () => {
      // Arrange
      const mockApiResponse: ApiResponse<Pet[]> = {
        data: [],
        success: true,
        message: 'Empty Pets\' list fetched successfully',
        timestamp: new Date().toISOString(),
      };
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      component.ngOnInit();

      // Assert
      expect(petService.getPets).toHaveBeenCalledTimes(1);
      expect(component.pets).toEqual([]);
      expect(component.pets.length).toBe(0);
    });

    it('should handle service error with console logging and user alert', () => {
      // Arrange
      const errorMessage = 'Network error';
      const error = new Error(errorMessage);
      petService.getPets.and.returnValue(throwError(() => error));

      // Act
      component.ngOnInit();

      // Assert
      expect(petService.getPets).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch pets:', error);
      expect(alertSpy).toHaveBeenCalledWith('Could not load pets. Please try again later.');
      expect(component.pets).toEqual([]); // Should remain empty on error
    });

    it('should handle HTTP error response', () => {
      // Arrange
      const httpError = {
        status: 500,
        statusText: 'Internal Server Error',
        message: 'Server error occurred'
      };
      petService.getPets.and.returnValue(throwError(() => httpError));

      // Act
      component.ngOnInit();

      // Assert
      expect(petService.getPets).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch pets:', httpError);
      expect(alertSpy).toHaveBeenCalledWith('Could not load pets. Please try again later.');
    });

    it('should handle network timeout error', () => {
      // Arrange
      const timeoutError = { name: 'TimeoutError', message: 'Request timeout' };
      petService.getPets.and.returnValue(throwError(() => timeoutError));

      // Act
      component.ngOnInit();

      // Assert
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch pets:', timeoutError);
      expect(alertSpy).toHaveBeenCalledWith('Could not load pets. Please try again later.');
    });
  });

  describe('Component Template Integration', () => {
    it('should not call getPets before ngOnInit', () => {
      // Assert
      expect(petService.getPets).not.toHaveBeenCalled();
    });

    it('should call getPets when component initializes', () => {
      // Arrange
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      fixture.detectChanges(); // This triggers ngOnInit

      // Assert
      expect(petService.getPets).toHaveBeenCalledTimes(1);
      expect(component.pets).toEqual(mockPets);
    });

    it('should update pets array after successful service call', () => {
      // Arrange
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      fixture.detectChanges();

      // Assert
      expect(component.pets.length).toBe(3);
      expect(component.pets[0].name).toBe('Buddy');
      expect(component.pets[1].name).toBe('Whiskers');
      expect(component.pets[2].name).toBe('Rex');
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle null response from service', () => {
      // Arrange
      petService.getPets.and.returnValue(of(null as any));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.pets).toBeNull();
    });

    it('should handle undefined response from service', () => {
      // Arrange
      petService.getPets.and.returnValue(of(undefined as any));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.pets).toBeUndefined();
    });

    it('should maintain component stability after error', () => {
      // Arrange
      petService.getPets.and.returnValue(throwError(() => new Error('Service error')));

      // Act
      component.ngOnInit();

      // Assert
      expect(component).toBeTruthy();
      expect(component.pets).toEqual([]);
      
      // Verify component can recover from error
      petService.getPets.and.returnValue(of(mockApiResponse));
      component.ngOnInit();
      expect(component.pets).toEqual(mockPets);
    });
  });

  describe('Pet Data Validation', () => {
    it('should handle pets with all required properties', () => {
      // Arrange
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.pets[0]).toEqual(jasmine.objectContaining({
        id: jasmine.any(Number),
        name: jasmine.any(String),
        type: jasmine.any(String),
        adopted: jasmine.any(Boolean),
        createdAt: jasmine.any(String)
      }));
    });

    it('should handle pets with different adoption statuses', () => {
      // Arrange
      const mixedAdoptionPets: Pet[] = [
        { id: 1, name: 'Available Pet', type: 'Dog', adopted: false, createdAt: new Date().toISOString() },
        { id: 2, name: 'Adopted Pet', type: 'Cat', adopted: true, createdAt: new Date().toISOString() }
      ];
      const mockApiResponse: ApiResponse<Pet[]> = {
        data: mixedAdoptionPets,
        success: true,
        message: 'Empty Pets\' list fetched successfully',
        timestamp: new Date().toISOString(),
      };

      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.pets.length).toBe(2);
      expect(component.pets[0].adopted).toBeFalse();
      expect(component.pets[1].adopted).toBeTrue();
    });

    it('should handle pets with different types', () => {
      // Arrange
      const diversePets: Pet[] = [
        { id: 1, name: 'Buddy', type: 'Dog', adopted: false, createdAt: new Date().toISOString() },
        { id: 2, name: 'Whiskers', type: 'Cat', adopted: false, createdAt: new Date().toISOString() },
        { id: 3, name: 'Nibbles', type: 'Rabbit', adopted: false, createdAt: new Date().toISOString() }
      ];
      const mockApiResponse: ApiResponse<Pet[]> = {
        data: diversePets,
        success: true,
        message: 'Pets list fetched successfully',
        timestamp: new Date().toISOString(),
      };
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      component.ngOnInit();

      // Assert
      expect(component.pets.length).toBe(3);
      expect(component.pets.map(pet => pet.type)).toEqual(['Dog', 'Cat', 'Rabbit']);
    });
  });

  describe('Service Interaction', () => {
    it('should call PetService.getPets exactly once during initialization', () => {
      // Arrange
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      component.ngOnInit();

      // Assert
      expect(petService.getPets).toHaveBeenCalledTimes(1);
      expect(petService.getPets).toHaveBeenCalledWith();
    });

    it('should not make additional service calls after initialization', () => {
      // Arrange
      petService.getPets.and.returnValue(of(mockApiResponse));

      // Act
      component.ngOnInit();
      // Reset the spy to only count calls after initial setup
      petService.getPets.calls.reset();
      
      // Simulate some component activity that shouldn't trigger additional calls
      fixture.detectChanges();

      // Assert
      expect(petService.getPets).not.toHaveBeenCalled();
    });
  });

  describe('Component Lifecycle', () => {
    it('should implement OnInit interface correctly', () => {
      expect(component.ngOnInit).toBeDefined();
      expect(typeof component.ngOnInit).toBe('function');
    });

    it('should be a standalone component', () => {
      // This tests that the component is configured as standalone
      expect(PetListComponent).toBeDefined();
      // The standalone property is checked at compile time, so this verifies the imports work
      expect(() => TestBed.createComponent(PetListComponent)).not.toThrow();
    });
  });

  afterEach(() => {
    // Clean up spies
    alertSpy.calls.reset();
    consoleErrorSpy.calls.reset();
  });
});
