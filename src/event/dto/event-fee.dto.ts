import { IsNumber, Max, Min } from 'class-validator';

export class UpdateEventFeeDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  eventFee: number;
}
