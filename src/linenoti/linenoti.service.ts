import { Injectable, HttpService } from '@nestjs/common'
import { db } from 'src/database/firebase.config'
import * as moment from 'moment'
import { LinenotiInterface } from './linenoti.interface'
import { Observable } from 'rxjs';
import { AxiosResponse } from 'axios'
import { map } from 'rxjs/operators'
import { DNSHealthIndicator, HealthCheckService } from '@nestjs/terminus'
import { DEVICES } from '../const/app.const'
 
@Injectable()
export class LinenotiService {

  constructor(
    private httpService: HttpService,
    private health: HealthCheckService,
    private dns: DNSHealthIndicator
  ) {}

  async getStatusService() {} // check status 200

  async sendNoti() {
    return this.httpService.get('http://localhost:9001/linenoti').pipe(map(response => response.data))
  }

  async healthCheckDevice(deviceName: string) {
    let devices_ip
    let devices = DEVICES.find( devices => devices.device_name == deviceName)
    if (devices == undefined) {
      devices_ip = deviceName
    }
    
    return this.health.check([
        async () => this.dns.pingCheck(deviceName, `http://${devices_ip}`)
    ])
  }
}
