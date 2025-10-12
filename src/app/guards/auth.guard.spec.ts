import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AuthGuard } from './auth.guard';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  const mockRouter = { createUrlTree: jasmine.createSpy('createUrlTree') };

  function setup(userValue: any) {
    const mockAuth = { user$: of(userValue) } as Partial<Auth>;
    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
      ],
    });
    guard = TestBed.inject(AuthGuard);
  }

  it('redirects to /login when there is no user', (done) => {
    setup(null);
    guard.canActivate().subscribe((res) => {
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/login']);
      expect(res).toBeDefined();
      done();
    });
  });

  it('allows activation when user is present', (done) => {
    setup({ uid: 'abc' });
    guard.canActivate().subscribe((res) => {
      expect(res).toBe(true);
      done();
    });
  });
});
