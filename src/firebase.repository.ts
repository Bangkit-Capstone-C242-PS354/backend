import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';

@Injectable()
export class FirebaseRepository {
  public readonly auth: Auth;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.auth = firebaseApp.auth();
  }
}
