import { IsNotEmpty, ArrayMinSize } from 'class-validator';

export class AttachPermissionDto {
  @IsNotEmpty()
  readonly role: number | string;

  @IsNotEmpty()
  @ArrayMinSize(1)
  readonly permissions: string[];
}
