import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationComponent } from './notification.component';
import { NotificationService, Notification } from './notification.service';
import { of } from 'rxjs';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    const notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['getNotifications', 'removeNotification']);

    await TestBed.configureTestingModule({
      declarations: [ NotificationComponent ],
      providers: [
        { provide: NotificationService, useValue: notificationServiceSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    notificationService = TestBed.inject(NotificationService) as jasmine.SpyObj<NotificationService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch notifications on init', () => {
    const mockNotifications: Notification[] = [
      { id: '1', type: 'success', message: 'Test success notification', duration: 5000, timestamp: new Date() }
      ];
    notificationService.getNotifications.and.returnValue(of(mockNotifications));

    component.ngOnInit();

    expect(component.notifications).toEqual(mockNotifications);
    expect(notificationService.getNotifications).toHaveBeenCalled();
  });

  it('should remove notification', () => {
    const notificationId = '1';
    component.removeNotification(notificationId);
    expect(notificationService.removeNotification).toHaveBeenCalledWith(notificationId);
  });

  afterEach(() => {
    component.ngOnDestroy();
  });
});