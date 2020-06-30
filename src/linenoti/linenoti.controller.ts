import { Controller, Get, Param } from '@nestjs/common'
import { LinenotiService } from './linenoti.service'
import { LinenotiLogic } from './linenoti.logic'


@Controller('linenoti')
export class LinenotiController {
  constructor(
    private readonly linenotiService: LinenotiService,
    private linenotiLogic: LinenotiLogic
  ) {}

  @Get()
  async statusService() {
    return this.linenotiService.getStatusService()
  }
  
  @Get('check/:deviceName')
  async check(@Param('deviceName') deviceName: string) {
    return this.linenotiService.healthCheckDevice(deviceName)
  }

  @Get('sendmessage')
  async sendMessage() {
    let status = '', statusstatus = ''
    return this.linenotiService.sendMessage(status, status)
  }
}
