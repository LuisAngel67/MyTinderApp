import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: Auth, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> {
    return this.auth.user$.pipe(
      take(1),
      map((user) => (user ? true : this.router.createUrlTree(['/login'])))
    );
  }
}
