import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';
import { Toast } from 'src/app/modules/core/providers/toast/toast';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  constructor(
    private router: Router,
    private readonly auth: Auth,
    private readonly toast: Toast
  ) {}

  ngOnInit() {}

  goToUpdate() {
    this.router.navigate(['/update']);
  }

  async logout() {
    try {
      await this.auth.logout();
      await this.toast.show('Logged out', 1500, 'success');
      await this.router.navigate(['/login']);
    } catch (err) {
      console.error('Logout failed', err);
      await this.toast.show('Could not log out', 2500, 'error');
    }
  }
}
