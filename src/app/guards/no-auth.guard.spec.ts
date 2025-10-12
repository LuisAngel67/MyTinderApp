import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NoAuthGuard } from './no-auth.guard';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;
  const mockRouter = { createUrlTree: jasmine.createSpy('createUrlTree') };

  function setup(userValue: any) {
    const mockAuth = { user$: of(userValue) } as Partial<Auth>;
    TestBed.configureTestingModule({
      providers: [
        NoAuthGuard,
        { provide: Auth, useValue: mockAuth },
        { provide: Router, useValue: mockRouter },
      ],
    });
    guard = TestBed.inject(NoAuthGuard);
  }

  it('allows activation when there is no user', (done) => {
    setup(null);
    guard.canActivate().subscribe((res) => {
      expect(res).toBe(true);
      done();
    });
  });

  it('redirects to /home when user exists', (done) => {
    setup({ uid: 'abc' });
    guard.canActivate().subscribe((res) => {
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/home']);
      expect(res).toBeDefined();
      done();
    });
  });
});
