import { Module } from '@nestjs/common';
import { RemarksService } from './remarks.service';
import { RemarksController } from './remarks.controller';

@Module({
  providers: [RemarksService],
  controllers: [RemarksController]
})
export class RemarksModule {}
