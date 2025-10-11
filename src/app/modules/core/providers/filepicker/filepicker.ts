import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';

@Injectable({
  providedIn: 'root',
})
export class Filepicker {
  constructor() {}

  async requestPermission(): Promise<boolean> {
    try {
      return true;
    } catch (err) {
      console.error('Filepicker.requestPermission error', err);
      return false;
    }
  }

  pickImageWeb(): Promise<File | null> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = () => {
        const f = input.files && input.files.length ? input.files[0] : null;
        resolve(f);
      };
      input.click();
    });
  }

  async pickImage(): Promise<File | null> {
    return this.pickImageWeb();
  }
}
