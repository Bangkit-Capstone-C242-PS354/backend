import { Injectable, NotFoundException } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { Receipt } from './interfaces/receipt.interface';

@Injectable()
export class ReceiptService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async uploadReceipt(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ url: string; filename: string }> {
    // Generate a unique file path
    const filename = `receipts/${userId}/${Date.now()}-${file.originalname}`;

    // Upload the file and get the public URL
    const url = await this.firebaseRepository.uploadFile(file, filename);

    return {
      url,
      filename,
    };
  }

  async getReceiptByFilename(filename: string): Promise<Receipt | null> {
    const db = this.firebaseRepository.getFirestore();
    const snapshot = await db
      .collection('receipts')
      .where('file_name', '==', filename)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return doc.data() as Receipt;
  }
}
