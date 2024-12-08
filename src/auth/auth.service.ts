import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { User } from '../user/interfaces/user.interface';
import { Timestamp } from 'firebase-admin/firestore';
import * as bcrypt from 'bcrypt';

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
      // Hash the password
      const hashedPassword = await bcrypt.hash(signUpDto.password, 10);

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
        password: hashedPassword,
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
    const db = this.firebaseRepository.getFirestore();

    try {
      // Retrieve user document by email
      const userSnapshot = await db
        .collection('users')
        .where('email', '==', signInDto.email)
        .get();

      if (userSnapshot.empty) {
        throw new UnauthorizedException('Invalid email or password');
      }

      const userDoc = userSnapshot.docs[0];
      const userData = userDoc.data() as User;

      // Verify the password
      const isPasswordValid = await bcrypt.compare(
        signInDto.password,
        userData.password,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid email or password');
      }

      // Create a custom token
      const customToken = await this.firebaseRepository.auth.createCustomToken(
        userData.uid,
      );

      return {
        message: 'Custom token created successfully',
        customToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid email or password');
    }
  }
}
