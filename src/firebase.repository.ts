import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { Auth } from 'firebase-admin/auth';
import { Storage } from 'firebase-admin/storage';

@Injectable()
export class FirebaseRepository {
  public readonly auth: Auth;
  private readonly firebaseApp: app.App;
  private readonly storage: Storage;

  constructor(@Inject('FIREBASE_APP') firebaseApp: app.App) {
    this.auth = firebaseApp.auth();
    this.firebaseApp = firebaseApp;
    this.storage = firebaseApp.storage();
  }

  public getFirestore() {
    return this.firebaseApp.firestore();
  }

  public getStorage() {
    return this.storage;
  }

  async uploadFile(file: Express.Multer.File, path: string): Promise<string> {
    const bucket = this.storage.bucket();
    const blob = bucket.file(path);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise((resolve, reject) => {
      blobStream.on('error', (error) => {
        reject(error);
      });

      blobStream.on('finish', async () => {
        // Make the file public
        await blob.makePublic();

        // Get the public URL
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        resolve(publicUrl);
      });

      blobStream.end(file.buffer);
    });
  }

  public async deleteFile(path: string): Promise<void> {
    try {
      const bucket = this.storage.bucket();
      const file = bucket.file(path);
      const [exists] = await file.exists();

      if (!exists) {
        console.warn(`File ${path} does not exist in storage`);
        return;
      }

      await file.delete();
    } catch (error) {
      console.error(`Error deleting file ${path}:`, error);
      throw error;
    }
  }
}
