# Frontend Development Tutorial - Component Navigation Patterns

## When to Route vs When to Open Dialogs

One of the key decisions in Angular application design is determining when to navigate to a new route versus opening a dialog/modal. This choice affects user experience, URL structure, and application flow.

### Decision Framework

| Factor | Use Routing | Use Dialog |
|--------|-------------|------------|
| **Complexity** | Complex forms, multi-step processes | Simple forms, quick actions |
| **URL Value** | Should be bookmarkable/shareable | Ephemeral actions |
| **Context** | Full page experience needed | Need to preserve current page context |
| **Browser History** | Should be tracked in history | Temporary interruption |
| **User Flow** | Primary application features | Supporting/secondary actions |

### Implementation Examples from PetLink

#### 1. Dialog Pattern - Pet Form (Create/Edit)

**Use Case:** Quick pet creation or editing while staying on the list page.

```typescript
// Creating a new pet
openCreateDialog(): void {
  const dialogRef = this.dialog.open(PetFormDialogComponent, {
    width: '500px',
    data: { pet: null, isEdit: false }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadPets(); // Refresh list to show new pet
    }
  });
}

// Editing existing pet
editPet(pet: Pet): void {
  const dialogRef = this.dialog.open(PetFormDialogComponent, {
    width: '500px',
    data: { pet: { ...pet }, isEdit: true }
  });

  dialogRef.afterClosed().subscribe(result => {
    if (result) {
      this.loadPets(); // Refresh list to show changes
    }
  });
}
```

**Why Dialog?**
- ✅ Quick, focused action
- ✅ User stays on the list page
- ✅ Form is simple and single-purpose
- ✅ No need to bookmark an edit form
- ✅ Maintains context of the pet list

#### 2. Dialog Pattern - Confirmation

**Use Case:** Confirming destructive actions like pet deletion.

```typescript
deletePet(petId: number): void {
  const dialogRef = this.dialog.open(ConfirmDialogComponent, {
    width: '400px',
    data: {
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete this pet? This action cannot be undone.',
      confirmText: 'Delete',
      cancelText: 'Cancel'
    }
  });

  dialogRef.afterClosed().subscribe(confirmed => {
    if (confirmed) {
      this.petService.deletePet(petId).subscribe({
        next: (response: ApiResponse<any>) => {
          if (response.success) {
            this.loadPets(); // Refresh list
          }
        },
        error: (error) => {
          console.error('Failed to delete pet:', error);
        }
      });
    }
  });
}
```

**Why Dialog?**
- ✅ Brief confirmation interaction
- ✅ Interrupts workflow safely
- ✅ Preserves current page context
- ✅ No URL state needed

#### 3. Routing Pattern - Pet Details

**Use Case:** Viewing comprehensive pet information.

```typescript
viewPetDetails(petId: number): void {
  this.router.navigate(['/pets', petId]);
}
```

**Why Routing?**
- ✅ Full page experience for detailed view
- ✅ URL is bookmarkable (`/pets/123`)
- ✅ Browser history tracks visits
- ✅ Users can share direct links
- ✅ Primary application feature

### Best Practices

#### Dialog Implementation
1. **Always handle dialog result**: Subscribe to `afterClosed()` to handle user actions
2. **Refresh data when needed**: Update parent component state after successful operations
3. **Set appropriate width**: Use consistent sizing (`400px` for confirmations, `500px` for forms)
4. **Pass data properly**: Use the `data` property for component communication

```typescript
const dialogRef = this.dialog.open(ComponentName, {
  width: '500px',
  data: { /* your data */ }
});

dialogRef.afterClosed().subscribe(result => {
  if (result) {
    // Handle successful action
    this.refreshData();
  }
});
```

#### Routing Implementation
1. **Use meaningful URLs**: `/pets/123` is better than `/view/123`
2. **Handle navigation errors**: Always include error handling
3. **Consider route parameters**: Use route params for dynamic content

```typescript
// Navigate with parameters
this.router.navigate(['/pets', petId]);

// Navigate with query parameters (if needed)
this.router.navigate(['/pets'], { queryParams: { filter: 'available' } });
```

### Component Communication Patterns

#### Dialog Data Interface
```typescript
export interface PetFormDialogData {
  pet: Pet | null;
  isEdit: boolean;
}

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}
```

#### Dialog Component Structure
```typescript
@Component({
  selector: 'app-pet-form-dialog',
  standalone: true,
  templateUrl: './pet-form-dialog.component.html'
})
export class PetFormDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<PetFormDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PetFormDialogData
  ) {}

  onSave(): void {
    // Perform save operation
    this.dialogRef.close(true); // Return success
  }

  onCancel(): void {
    this.dialogRef.close(false); // Return cancellation
  }
}
```

### Common Pitfalls to Avoid

1. **Don't overuse dialogs**: Complex workflows belong on dedicated pages
2. **Don't forget to handle dialog results**: Always subscribe to `afterClosed()`
3. **Don't make dialogs too large**: If it needs to be full-screen, use routing instead
4. **Don't break the back button**: Use dialogs for actions that shouldn't be in browser history

### Summary

The choice between routing and dialogs significantly impacts user experience:

- **Dialogs** are perfect for quick, contextual actions that support the main workflow
- **Routing** is ideal for primary features that deserve their own URL and full page experience

In PetLink, we use dialogs for creating/editing pets and confirmations, while routing to dedicated pages for detailed pet views. This pattern keeps the interface clean while providing appropriate navigation depth for different user needs.