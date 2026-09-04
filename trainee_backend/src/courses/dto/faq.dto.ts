import { Expose } from 'class-transformer';

export class FaqDto {
  @Expose() question!: string;
  @Expose() answer!: string;
}
