import { Injectable } from '@angular/core';
import { Auth as FirebaseAuth, authState } from '@angular/fire/auth';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  type UserCredential,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { Observable, firstValueFrom } from 'rxjs';
import {
  Firestore,
  collection,
  collectionData,
  query,
  where,
  limit,
} from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  public user$: Observable<User | null>;

  constructor(
    private readonly authFirebase: FirebaseAuth,
    private readonly firestore: Firestore
  ) {
    this.user$ = authState(this.authFirebase) as Observable<User | null>;
  }

  async doesEmailExist(email: string): Promise<boolean> {
    try {
      const methods = await fetchSignInMethodsForEmail(
        this.authFirebase,
        email
      );
      const ok = Array.isArray(methods) && methods.length > 0;
      if (ok) return true;

      try {
        const usersCol = collection(this.firestore, 'users');
        const orig = String(email);
        const normalized = orig.trim().toLowerCase();
        const values = orig === normalized ? [orig] : [orig, normalized];
        const q = query(usersCol, where('email', 'in', values), limit(1));
        const rows = (await firstValueFrom(
          collectionData(q, { idField: 'id' })
        )) as any[];
        if (Array.isArray(rows) && rows.length > 0) {
          console.debug('[Auth] email found in users collection for', email);
          return true;
        }
        return false;
      } catch (err2) {
        console.error('Auth.users lookup failed', err2);
        return false;
      }
    } catch (err) {
      console.error('Auth.doesEmailExist error', err);
      return false;
    }
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
