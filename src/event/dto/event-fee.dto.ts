import { IsNumber, Max, Min } from 'class-validator';

export class UpdateEventFeeDto {
  @IsNumber()
  @Min(0.01)
  @Max(1)
  eventFee: number;
}
