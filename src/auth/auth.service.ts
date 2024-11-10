import { Injectable } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const userRecord = await this.firebaseRepository.auth.createUser({
        email: signUpDto.email,
        password: signUpDto.password,
      });

      return {
        message: 'User created successfully',
        uid: userRecord.uid,
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
