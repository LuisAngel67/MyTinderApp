import { Injectable } from '@angular/core';
import { Auth } from 'src/app/modules/core/providers/Auth/auth';
import { Query } from 'src/app/modules/core/providers/query/query';

@Injectable({
  providedIn: 'root',
})
export class User {
  constructor(private readonly auth: Auth, private readonly query: Query) {}

  async createProfile(payload: any) {
    const uid = await this.auth.register(payload.email, payload.password);
    const profile = { ...payload };
    delete profile.password;
    if (profile.photos) delete profile.photos;
    if (profile.selectedPhotoUrl) delete profile.selectedPhotoUrl;
    await this.query.set('users', uid, profile);
    return uid;
  }
}
