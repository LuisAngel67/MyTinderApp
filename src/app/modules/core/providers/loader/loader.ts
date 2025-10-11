import { Injectable } from '@angular/core';
import { LoadingController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class Loader {
  private current: HTMLIonLoadingElement | null = null;
  constructor(private loadingCtrl: LoadingController) {}

  async show(message = 'Loading...') {
    if (this.current) return;
    this.current = await this.loadingCtrl.create({
      message,
      spinner: 'circles',
      cssClass: 'app-loader',
    });
    await this.current.present();
  }

  async hide() {
    try {
      if (this.current) {
        await this.current.dismiss();
        this.current = null;
      }
    } catch (err) {
      console.warn('Loader.hide error', err);
      this.current = null;
    }
  }
}
