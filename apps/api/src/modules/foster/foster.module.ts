import { Module } from '@nestjs/common';
import { FosterService } from './foster.service';
import { FosterController } from './foster.controller';

@Module({
  controllers: [FosterController],
  providers: [FosterService],
  exports: [FosterService],
})
export class FosterModule {}
