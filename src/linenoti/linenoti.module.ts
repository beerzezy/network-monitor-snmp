import { Module, HttpModule } from '@nestjs/common'
import { LinenotiController } from './linenoti.controller'
import { LinenotiLogic } from './linenoti.logic'
import { LinenotiService } from './linenoti.service'
import { TerminusModule } from '@nestjs/terminus';

@Module({
  imports: [HttpModule, TerminusModule],
  controllers: [LinenotiController],
  providers: [LinenotiLogic, LinenotiService, ]
})

export class LinenotiModule {}
