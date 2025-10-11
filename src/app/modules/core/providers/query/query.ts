import { Injectable } from '@angular/core';
import { Firestore, setDoc, doc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root',
})
export class Query {
  constructor(private firestore: Firestore) {}

  async set(collectionName: string, uid: string, data: any) {
    const newDoc = doc(this.firestore, collectionName, uid);
    await setDoc(newDoc, data);
  }
}
