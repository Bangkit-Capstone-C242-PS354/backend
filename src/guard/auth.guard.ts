import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { FirebaseRepository } from '../firebase.repository';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly firebaseRepository: FirebaseRepository) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      return false;
    }

    try {
      const decodedToken =
        await this.firebaseRepository.auth.verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error) {
      return false;
    }
  }
}
