import { IsString, IsIn, IsNotEmpty } from 'class-validator';

export class SetApprovalDto {
  @IsString()
  @IsIn(['pending', 'approved', 'rejected'], {
    message: 'Status must be one of: pending, approved, rejected',
  })
  @IsNotEmpty()
  status: string;
}
