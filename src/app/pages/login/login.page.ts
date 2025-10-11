import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';
import { Loader } from 'src/app/modules/core/providers/loader/loader';
import { Toast } from 'src/app/modules/core/providers/toast/toast';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  LoginForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private readonly auth: Auth,
    private readonly loader: Loader,
    private readonly toast: Toast,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.LoginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  control(name: string) {
    return this.LoginForm.get(name);
  }

  showErrors(name: string) {
    const c = this.control(name);
    return !!(c && c.touched && c.invalid);
  }

  getErrorMessage(name: string): string | null {
    const c = this.control(name);
    if (!c || !c.errors) return null;
    if (c.hasError('required')) return 'This field is required';
    if (c.hasError('email')) return 'Please enter a valid email';
    if (c.hasError('minlength')) {
      const req = c.getError('minlength')?.requiredLength;
      return `Minimum length is ${req} characters`;
    }
    return 'Invalid value';
  }

  async login() {
    if (!this.LoginForm.valid) return;
    const { email, password } = this.LoginForm.value;
    try {
      await this.loader.show('Signing in...');
      await this.auth.login(email, password);
      await this.loader.hide();
      await this.toast.show('Welcome back!', 2000);
      await this.router.navigate(['/home']);
    } catch (err) {
      await this.loader.hide();
      const e = err as any;
      const message = e?.message ?? String(err ?? 'Unknown error');
      console.error('Login error', err);

      if (
        (e?.code ?? '').toString().includes('auth/user-not-found') ||
        message.toLowerCase().includes('user-not-found') ||
        message.toLowerCase().includes('no user')
      ) {
        await this.toast.show('User not found. Please register first.', 4000);
      } else if (
        (e?.code ?? '').toString().includes('auth/wrong-password') ||
        message.toLowerCase().includes('wrong-password') ||
        message.toLowerCase().includes('invalid')
      ) {
        await this.toast.show(
          'Invalid credentials. Check email and password.',
          4000
        );
      } else {
        await this.toast.show(`Login failed: ${message}`, 4000);
      }
    }
  }
}
