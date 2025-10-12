import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PASSIONS } from 'src/app/interfaces/passions';
import { User } from 'src/app/modules/shared/services/user/user';
import { Filepicker } from 'src/app/modules/core/providers/filepicker/filepicker';
import { Uploader } from 'src/app/modules/core/providers/Uploader/uploader';
import { Query } from 'src/app/modules/core/providers/query/query';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';
import { Loader } from 'src/app/modules/core/providers/loader/loader';
import { Toast } from 'src/app/modules/core/providers/toast/toast';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  RegisterForm!: FormGroup;
  step = 1;

  passionsList: string[] = PASSIONS.slice();

  selectedPassions: string[] = [];

  selectedGender?: string;
  attemptedFinish = false;

  selectedPhotoUrl?: string | null;

  constructor(
    private fb: FormBuilder,
    private readonly userService: User,
    private readonly router: Router,
    private readonly filepicker: Filepicker,
    private readonly uploader: Uploader,
    private readonly query: Query,
    private readonly loader: Loader,
    private readonly toast: Toast,
    private readonly auth: Auth
  ) {}

  ngOnInit() {
    this.RegisterForm = this.fb.group({
      name: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      country: ['', Validators.required],
      gender: [''],
      showGenderProfile: [false],
      birthDate: [''],
      passions: [[]],
      photos: [[]],
    });
  }

  get stepTitle(): string {
    switch (this.step) {
      case 1:
        return 'My Information';
      case 2:
        return 'I am a ...';
      case 3:
        return 'Birthday';
      case 4:
        return 'Passions';
      case 5:
        return 'Add Media';
      default:
        return 'Register';
    }
  }

  isAdult(birth: string | Date | null): boolean {
    if (!birth) return false;
    const b = new Date(birth as any);
    if (isNaN(b.getTime())) return false;
    const ageDifMs = Date.now() - b.getTime();
    const ageDate = new Date(ageDifMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    return age >= 18;
  }

  isStepValid(step: number): boolean {
    if (step === 1) {
      return !!(
        this.RegisterForm.get('name')?.valid &&
        this.RegisterForm.get('lastName')?.valid &&
        this.RegisterForm.get('email')?.valid &&
        this.RegisterForm.get('password')?.valid &&
        this.RegisterForm.get('country')?.valid
      );
    }

    if (step === 2) {
      return !!this.RegisterForm.get('gender')?.value;
    }

    if (step === 3) {
      const bd = this.RegisterForm.get('birthDate')?.value;
      return !!bd && this.isAdult(bd);
    }

    if (step === 4) {
      return this.selectedPassions.length > 0;
    }

    if (step === 5) {
      return true;
    }

    return false;
  }

  async nextStep() {
    if (!this.isStepValid(this.step)) {
      this.RegisterForm.markAllAsTouched();
      return;
    }

    if (this.step === 1) {
      const email = this.RegisterForm.get('email')?.value;
      if (email) {
        const normalized = String(email).trim().toLowerCase();
        try {
          await this.loader.show('Verifying email...');
          const exists = await this.auth.doesEmailExist(normalized);
          if (exists) {
            await this.toast.show(
              'Email already registered. Please sign in or use another email.',
              4000
            );
            return;
          }
        } catch (err) {
          console.error('Email verification failed', err);
          await this.toast.show(
            'Could not verify email. Check your connection.',
            3500
          );
          return;
        } finally {
          await this.loader.hide();
        }
      }
    }

    this.step = Math.min(5, this.step + 1);
  }

  prevStep() {
    this.step = Math.max(1, this.step - 1);
  }

  setGender(value: any) {
    if (value === undefined || value === null) return;
    const v = String(value);
    this.selectedGender = v;
    this.RegisterForm.patchValue({ gender: v });
  }

  setShowGender(checked: boolean) {
    this.RegisterForm.patchValue({ showGenderProfile: checked });
  }

  togglePassion(p: string) {
    const idx = this.selectedPassions.indexOf(p);
    if (idx >= 0) this.selectedPassions.splice(idx, 1);
    else this.selectedPassions.push(p);
    this.RegisterForm.patchValue({ passions: this.selectedPassions });
  }

  isPassionSelected(p: string) {
    return this.selectedPassions.includes(p);
  }

  control(name: string) {
    return this.RegisterForm.get(name);
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

  onSubmit() {
    if (this.RegisterForm.valid && this.isStepValid(4)) {
      this.DoRegister();
    } else {
      this.attemptedFinish = true;
      this.RegisterForm.markAllAsTouched();
    }
  }

  public async DoRegister() {
    const payload = { ...this.RegisterForm.value } as any;

    try {
      await this.loader.show('Creating account...');
      const uid = await this.userService.createProfile(payload);

      const photos = (this.RegisterForm.get('photos')?.value as any[]) || [];
      if (photos.length > 0) {
        const first = photos[0];
        const url = first.url ?? first.dataUrl ?? null;
        if (url) {
          await this.query.set('images', uid, { uid, url });
        }
      }
      await this.loader.hide();
      await this.toast.show('Account created successfully', 2500);
      await this.router.navigate(['/login']);
    } catch (err) {
      await this.loader.hide();
      const e = err as any;
      const message = e?.message ?? String(err ?? 'Unknown error');
      console.error('DoRegister error', err);

      await this.toast.show(`Registration failed: ${message}`, 4000);
    }
  }

  async onAddPhotoClicked() {
    try {
      await this.loader.show('Uploading image...');
      const ok = await this.filepicker.requestPermission();
      if (!ok) return;

      const file = await this.filepicker.pickImage();
      if (!file) return;

      const key = `ProfileImages/${Date.now()}_${file.name}`;
      const publicUrl = await this.uploader.uploadToSupabase(file, key);

      this.selectedPhotoUrl = publicUrl;
      const photos = (this.RegisterForm.get('photos')?.value as any[]) || [];
      photos.unshift({ name: file.name, url: publicUrl });
      this.RegisterForm.patchValue({ photos });
      await this.loader.hide();
      await this.toast.show('Image uploaded', 2000);
    } catch (err) {
      await this.loader.hide();
      console.error('onAddPhotoClicked error', err);
      await this.toast.show('Image upload failed', 3000);
    }
  }
}
