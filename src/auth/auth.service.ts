import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto';
import { UserRepository } from '../user/user.repository';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserRepository)
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService
  ) {}

  async login({ email, password }: AuthCredentialsDto): Promise<string> {
    const user = await this.userRepository.findByEmail(email);

    const auth = await (user
      ? user.validatePassword(password)
      : Promise.resolve(true));
    if (!auth) {
      throw new UnauthorizedException(`Email and password doesn't match`);
    }

    return this.generateJWT(user);
  }

  async userHasRoles(user: UserEntity, roleNames: string[]): Promise<boolean> {
    return this.userRepository.userHasRoles(user, roleNames);
  }

  async userHasPermissions(
    user: UserEntity,
    permissionNames: string[]
  ): Promise<boolean> {
    const authorizedPermission = user
      .getAuthorizedPermission()
      .map((permission) => permission.name);

    return !permissionNames.some(
      (name) => !authorizedPermission.includes(name)
    );
  }

  generateJWT(user): string {
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
  }
}
