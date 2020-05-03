import { EntityRepository, Repository, getRepository } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserDto } from './dto';
import {
  InternalServerErrorException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { RoleEntity } from '../role/role.entity';

const logger = new Logger('UserRepository');

@EntityRepository(UserEntity)
export class UserRepository extends Repository<UserEntity> {
  async registerUser(userDto: CreateUserDto): Promise<UserEntity> {
    // check uniqueness of username/email
    const { email, name, password } = userDto;

    // create new user
    const user = new UserEntity();
    user.email = email;
    user.name = name;
    user.password = await this.hashPassword(password, await bcrypt.genSalt());

    const createdUser = await this.save(user).catch((error) => {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already registered');
      }
      logger.error(error);
      throw new InternalServerErrorException();
    });

    return createdUser;
  }

  async findById(id: number): Promise<UserEntity> {
    return this.findOne(id, { cache: 600000 });
  }

  async findByEmail(email: string): Promise<UserEntity> {
    return this.findOne({ email }, { cache: 600000 });
  }

  private async hashPassword(password: string, salt: string): Promise<string> {
    return bcrypt.hash(password, salt);
  }

  async attachRolesToUser(user: UserEntity, roles: RoleEntity[]) {
    user.roles = roles;
    this.save(user);
  }

  async userHasRoles(user: UserEntity, roleNames: string[]): Promise<boolean> {
    const getUser = await getRepository(UserEntity).findOne(user.id);
    const userRoles = await getUser.roles;
    if (!userRoles) {
      return false;
    }
    const userRoleNames = userRoles.map((role) => role.name);

    return !roleNames.some((role) => !userRoleNames.includes(role));
  }
}
