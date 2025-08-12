import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { adminGuard } from './admin.guard';

describe('adminGuard', () => {
  let guard: adminGuard;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        adminGuard,
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    });
    guard = TestBed.inject(adminGuard);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should allow access for admin users', () => {
    // Add your specific test logic here
    // For example:
    // spyOn(someService, 'isAdmin').and.returnValue(true);
    // expect(guard.canActivate()).toBeTruthy();
  });
});