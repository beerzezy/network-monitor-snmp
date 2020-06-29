import { Injectable, HttpService } from '@nestjs/common'
import { db } from 'src/database/firebase.config'
import * as moment from 'moment'
import { LinenotiInterface } from './linenoti.interface'
import { DNSHealthIndicator, HealthCheckService } from '@nestjs/terminus'
import { DEVICES } from '../const/app.const'
import axios from 'axios'
import * as qs from 'qs'
 
@Injectable()
export class LinenotiService {

  constructor(
    private httpService: HttpService,
    private health: HealthCheckService,
    private dns: DNSHealthIndicator
  ) {}

  async getStatusService() {
  } // check status 200

  async sendMessage() {
    //return this.httpService.post('https://notify-api.line.me/api/notify').pipe(map(response => response.data))

    let token = 'oh9PA0x5oFNDd83fUZRRwlhO44sseTkZFbDRNoGZmQF'
    const { data } = await axios({
      method: 'POST',
      url: 'https://notify-api.line.me/api/notify',
      data: qs.stringify({
        message: 'KUY RAI JAN'
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      }
    })
    return data
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
