import { Injectable } from '@angular/core';
import { Auth as FirebaseAuth, authState } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  type UserCredential,
} from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  public user$: Observable<User | null>;

  constructor(private readonly authFirebase: FirebaseAuth) {
    this.user$ = authState(this.authFirebase) as Observable<User | null>;
  }

  async register(email: string, password: string): Promise<string> {
    try {
      const resp = await createUserWithEmailAndPassword(
        this.authFirebase,
        email,
        password
      );
      return resp.user.uid;
    } catch (err) {
      console.error('Auth.register error', err);
      throw err;
    }
  }

  async login(email: string, password: string): Promise<UserCredential> {
    try {
      return (await signInWithEmailAndPassword(
        this.authFirebase,
        email,
        password
      )) as UserCredential;
    } catch (err) {
      console.error('Auth.login error', err);
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.authFirebase);
    } catch (err) {
      console.error('Auth.logout error', err);
      throw err;
    }
  }

  get currentUid(): string | null {
    return (this.authFirebase as any)?.currentUser?.uid ?? null;
  }
}
