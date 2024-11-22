import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';

@Injectable()
export class ReceiptService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async uploadReceipt(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    // Generate a unique file path
    const filePath = `receipts/${userId}/${Date.now()}-${file.originalname}`;

    // Upload the file and get the public URL
    return this.firebaseRepository.uploadFile(file, filePath);
  }
}
