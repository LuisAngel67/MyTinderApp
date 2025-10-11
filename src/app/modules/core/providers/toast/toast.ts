import { Injectable } from '@angular/core';
import { ToastController } from '@ionic/angular';

@Injectable({ providedIn: 'root' })
export class Toast {
  constructor(private toastCtrl: ToastController) {}

  /**
   * Show a toast.
   * @param message text to show
   * @param duration ms to show
   * @param type 'default' | 'success' | 'error' — maps to CSS variants
   */
  async show(
    message: string,
    duration = 3000,
    type: 'default' | 'success' | 'error' = 'default'
  ) {
    const cssClass = ['app-toast', `app-toast--${type}`];
    const t = await this.toastCtrl.create({
      message,
      duration,
      position: 'bottom',
      cssClass,
    });
    await t.present();
  }
}
