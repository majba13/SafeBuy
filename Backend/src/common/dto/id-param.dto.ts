import { IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class IdParamDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @IsMongoId()
  id: string;
}
