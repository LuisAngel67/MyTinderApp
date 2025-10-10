import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-link',
  templateUrl: './link.component.html',
  styleUrls: ['./link.component.scss'],
  standalone: false,
})
export class LinkComponent {
  @Input() to: string = '/';
  @Input() label: string = '';
  @Input() disabled: boolean = false;

  constructor(private router: Router) {}

  navigate() {
    if (!this.disabled) {
      this.router.navigate([this.to]);
    }
  }
}
