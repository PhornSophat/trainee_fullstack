import { IsString, IsIn, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class SetApprovalDto {
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  @IsString()
  @IsIn(['APPROVED', 'REJECTED', 'PENDING', 'NOT_REQUESTED'], {
    message:
      'Status must be one of: APPROVED, REJECTED, PENDING, NOT_REQUESTED (case-insensitive)',
  })
  @IsNotEmpty()
  status: string;
}
