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
        
        // check status device sw9400 and then status is down will send linenotify
        // let deviceInfo = await this.checkStatusSW9400()
        // console.log('health check device info => ', deviceInfo.status, deviceInfo.deviceName)
        // if (deviceInfo.status == 'down') {
        //     this.linenotiService.sendMessage(deviceInfo.status, deviceInfo.deviceName)
        // }
    }

    async healthCheckDevice(deviceName) {
        return this.linenotiService.healthCheckDevice(deviceName)
    }

    async checkStatusSW9400() {
        console.log('Health check device : SW9400...')

        let deviceName = 'sw9400'
        try {
            let data = await this.healthCheckDevice(deviceName)
            return data
        } catch {
            return { status: 'down', deviceName: deviceName }
        }
    }
}
