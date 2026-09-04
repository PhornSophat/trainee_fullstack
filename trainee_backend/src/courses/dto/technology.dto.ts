import { Expose } from 'class-transformer';

export class TechnologyDto {
  @Expose() name!: string;
  @Expose() icon!: string;
}
