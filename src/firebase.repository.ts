import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseRepository {
  public readonly auth: Auth;
  private readonly firebaseApp: app.App;

  constructor(@Inject('FIREBASE_APP') firebaseApp: app.App) {
    this.auth = firebaseApp.auth();
    this.firebaseApp = firebaseApp;
  }

  public getFirestore() {
    return this.firebaseApp.firestore();
  }
}
