import { IsNotEmpty, ArrayMinSize } from 'class-validator';

export class AttachRoleDto {
  @IsNotEmpty()
  readonly userId: number;

  @IsNotEmpty()
  @ArrayMinSize(1)
  readonly roles: string[];
}
