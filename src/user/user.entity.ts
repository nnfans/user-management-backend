import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  UpdateDateColumn,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { IsEmail } from 'class-validator';
import * as bcrypt from 'bcryptjs';
import { RoleEntity } from '../role/role.entity';
import { PermissionEntity } from '../permission/permission.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 40 })
  @IsEmail()
  email: string;

  @Column({ length: 40 })
  name: string;

  @Column({ length: 60 })
  password: string;

  @Column({ default: false })
  passwordMustChange: boolean;

  @Column({ default: false })
  isSuperUser: boolean;

  @ManyToMany(() => RoleEntity, { eager: true })
  @JoinTable({ name: 'role_user' })
  roles: RoleEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  getAuthorizedPermission(): PermissionEntity[] {
    return this.roles
      .map((role) => role.permissions)
      .reduce((acc, curr) => [...acc, ...curr], []);
  }
}
