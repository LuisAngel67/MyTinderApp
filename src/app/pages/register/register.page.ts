import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
  standalone: false,
})
export class RegisterPage implements OnInit {
  RegisterForm!: FormGroup;
  step = 1;

  passionsList: string[] = [
    'Harry potter',
    'Music',
    'Video games',
    'Travel',
    'Sports',
    'Movies',
  ];

  selectedPassions: string[] = [];

  selectedGender?: string;
  attemptedFinish = false;

  constructor(private fb: FormBuilder) {}

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

  nextStep() {
    if (this.isStepValid(this.step)) {
      this.step = Math.min(5, this.step + 1);
    } else {
      this.RegisterForm.markAllAsTouched();
    }
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
    console.log('User register succesfully');
  }
}
