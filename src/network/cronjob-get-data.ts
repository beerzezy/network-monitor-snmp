import { Injectable } from '@nestjs/common'
import { NestSchedule, Cron } from 'nest-schedule'
import { NetworkService } from './network.service'
import * as snmp from 'snmp-native'
import { getOs, getUpTime, getCpu, getMemory, getTemperature, getInbound, getOutbound,
  getInterfaceStatus, getInterface, getInterfaceAdminStatus } from './utils/get-data.utils'
import { DEVICE_IP, DEVICE_NAME } from 'src/const/app.const'
import axios from 'axios'
import * as qs from 'qs'
import * as fs from 'fs'
import * as path from 'path'
import * as readline from 'readline'

@Injectable()
export class CronjobGetData extends NestSchedule {
  filePath: string;
  constructor(
    private readonly networkService: NetworkService
  ) {
    super()
    this.filePath = path.format({ dir: 'D:\\Syslog\\Logs', base: 'SyslogCatchAll.txt'});
  }

  @Cron('* * * * *')
  async cronjob() {
    // const deviceIp = ['192.168.10.2']
    // const deviceName = ['test']
    // deviceIp.forEach(async (ip, index) => {
    //   await this.getDeviceData(ip, deviceName[index])
    // })
    console.log(`get data @ ${new Date()}`)
    DEVICE_IP.forEach(async (ip, index) => {
      await this.getDeviceData(ip, DEVICE_NAME[index])
    })

    this.readSyslogFile()
  }

  private async readSyslogFile() {
    try {
      if (fs.existsSync(this.filePath.toString())) {
        const fileStream = fs.createReadStream(this.filePath.toString());
        const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });
    
        var sysLogData = []
        for await (const line of rl) {
          let replaceDoubleQuote = line.replace(/"/g, "");
          let replaceCommas = replaceDoubleQuote.replace(/, /g, ',');
          let arrayData = replaceCommas.split(',');
          let len = arrayData.length
          let sliced = arrayData.slice(3, len);
          sysLogData.push({
            datetime: arrayData[0],
            priority: arrayData[1],
            hostname: arrayData[2],
            message: sliced.toString()
          })
        }
        //console.log(sysLogData)
        sysLogData.forEach(data => {
          let w1 = data.message.includes("Reload Command");
          let w2 = data.message.includes("reload");
          if (w1 || w2) {
            this.sendMessage(data.datetime, data.hostname)
            console.log("Send Trap to Line Noti")
          }
        })

        // Delete file after check trap reload
        fs.unlink(this.filePath.toString(), (err) => {
          if (err) throw err;
          console.log(`${this.filePath.toString()} was deleted`);
        });
      }
    } catch(err) {
      console.log(err)
    }
  }

  private async sendMessage(datetime: string, hostname: string) {
    let token = 'oh9PA0x5oFNDd83fUZRRwlhO44sseTkZFbDRNoGZmQF'

    const { data } = await axios({
      method: 'POST',
      url: 'https://notify-api.line.me/api/notify',
      data: qs.stringify({
        message: `The device is reloaded, Detail => Date: ${datetime}, Hostname: ${hostname}`
      }),
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`
      }
    })
    return data
}
  
  private async getDeviceData(deviceIp: string, deviceName: string): Promise<void> {
    const device = new snmp.Session({ host: deviceIp, community: 'public' })
    try {
      const result = await Promise.all([
        getOs(device),
        getUpTime(device),
        getCpu(device),
        getMemory(device),
        getTemperature(device),
        getInbound(device , deviceIp),
        getOutbound(device),
        getInterfaceStatus(device),
        getInterface(device),
        getInterfaceAdminStatus(device)
      ])
      const deviceDataPayload = {
        ip: deviceIp,
        os: result[0],
        upTime: result[1],
        cpu: result[2],
        memory: result[3],
        temperature: result[4]
      }
      const interfaceResult: any = result[8]
      const interfaceResultAdminStatus: any = result[9]
      await Promise.all([
        this.networkService.setDeviceData(deviceName, deviceDataPayload),
        this.setInterface(deviceName, {
          interfaceName: interfaceResult.interfacePort,
          interfaceOid: interfaceResult.interfaceOid,
          interfaceNameAdminStatus: interfaceResultAdminStatus.interfacePort,
          interfaceOidAdminStatus: interfaceResultAdminStatus.interfaceOid,
          interfaceStatus: result[7],
          inbounds: result[5],
          outbounds: result[6]
        }),
        this.setTraffic(deviceName, result[5], result[6])
      ])   
    } catch (error) {
      
    }
  }

  private async setInterface(deviceName: string, interfaceData: any): Promise<void> {
    const { interfaceName, interfaceOid, interfaceStatus, inbounds, outbounds, interfaceOidAdminStatus, interfaceNameAdminStatus} = interfaceData
    interfaceName.forEach(async (nameValue: string, index: number) => {
      const name = nameValue.replace(/\//g, '-')
      const interfaceDataPayload = {
        oid: interfaceOid[index],
        status: interfaceStatus[index],
        inbound: inbounds[index],
        outbound: outbounds[index],
        oidAdminStatus: interfaceOidAdminStatus[index],
        interfaceNameAdminStatus: interfaceNameAdminStatus[index]
      }
      try {
        await this.networkService.setDeviceInterface(deviceName, name, interfaceDataPayload)      
      } catch (error) {

      }
    })
  }

  private async setTraffic(deviceName: string, inbound: any, outbound: any): Promise<void> {
    let inboundTotal = 0
    let outboundTotal = 0
    inbound.forEach((value, index) => {
      inboundTotal += value
      outboundTotal += outbound[index]
    })
    await Promise.all([
      this.networkService.setDeviceTraffic(deviceName, inboundTotal, outboundTotal),
      this.setSpeed(deviceName, inboundTotal, outboundTotal)
    ])
  }

  private async setSpeed(deviceName: string, inbound: any, outbound: any): Promise<void> {
    const speed = inbound + outbound
    await this.networkService.setDeviceSpeed(deviceName, speed)
  }
}
