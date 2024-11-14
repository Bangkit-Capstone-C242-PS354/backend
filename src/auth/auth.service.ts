import { Injectable, ConflictException } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../user/interfaces/user.interface';
import { Timestamp } from 'firebase-admin/firestore';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async signUp(signUpDto: SignUpDto) {
    const db = this.firebaseRepository.getFirestore();

    // Check if username already exists
    const usernameDoc = await db
      .collection('users')
      .where('username', '==', signUpDto.username)
      .get();

    if (!usernameDoc.empty) {
      throw new ConflictException('Username already exists');
    }

    try {
      // Create authentication user
      const userRecord = await this.firebaseRepository.auth.createUser({
        email: signUpDto.email,
        password: signUpDto.password,
      });

      // Create initial user document in Firestore
      const userData: User = {
        uid: userRecord.uid,
        email: signUpDto.email,
        username: signUpDto.username,
        totalExpense: 0,
        totalIncome: 0,
        totalBalance: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await db.collection('users').doc(userRecord.uid).set(userData);

      return {
        message: 'User created successfully',
        uid: userRecord.uid,
        username: signUpDto.username,
      };
    } catch (error) {
      throw error;
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.firebaseRepository.auth.getUserByEmail(
        signInDto.email,
      );

      const customToken = await this.firebaseRepository.auth.createCustomToken(
        user.uid,
      );

      return {
        message: 'Custom token created successfully',
        customToken,
      };
    } catch (error) {
      throw error;
    }
  }
}
