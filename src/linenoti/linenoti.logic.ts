import { Injectable } from '@nestjs/common'
import { NestSchedule, Cron } from 'nest-schedule'
import { LinenotiService } from './linenoti.service'
import { DNSHealthIndicator, HealthCheckService } from '@nestjs/terminus'
import { threadId } from 'worker_threads'

@Injectable()
export class LinenotiLogic extends NestSchedule {
    constructor(
        private readonly linenotiService: LinenotiService,
        private health: HealthCheckService,
        private dns: DNSHealthIndicator
      ) {
        super()
    }

    @Cron('* * * * *')
    async cronJob() {
        console.log(new Date(new Date().getTime() + 24 * 60 * 60 * 1000))
        this.healthCheckDevice()
    }

    async healthCheckDevice() {
        console.log('healthCheckDevice...')
        let deviceName = 'sw9400'
        this.linenotiService.healthCheckDevice(deviceName)
    }
}
