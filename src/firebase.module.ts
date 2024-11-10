import { Module } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { FirebaseRepository } from './firebase.repository';
import * as serviceAccount from '../serviceAccountKey.json';

const firebaseProvider = {
  provide: 'FIREBASE_APP',
  useFactory: () => {
    return admin.initializeApp({
      credential: admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key,
      } as admin.ServiceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
  },
};

@Module({
  providers: [firebaseProvider, FirebaseRepository],
  exports: [FirebaseRepository],
})
export class FirebaseModule {}
