import { Injectable } from '@nestjs/common'
import { db } from 'src/database/firebase.config'
import { CollectionReference } from '@google-cloud/firestore'
import { DeviceInterface } from './network.interface'
import * as moment from 'moment'
import * as snmp from 'snmp-native'

@Injectable()
export class NetworkService {
  private readonly networkRef: CollectionReference

  constructor() {
    this.networkRef = db.collection('network')
  }

  async sendNotify() {
    const deviceR124 = await this.networkRef.doc('r124').get()
    const deviceR101c = await this.networkRef.doc('r101c').get()
    const deviceSw3850 = await this.networkRef.doc('sw3850').get()
    const deviceR415 = await this.networkRef.doc('r15').get()
    const deviceR330a = await this.networkRef.doc('r330a').get()
    const deviceRshop = await this.networkRef.doc('rshop').get()
    const deviceRsad = await this.networkRef.doc('rsad').get()
    const deviceSw9400 = await this.networkRef.doc('sw9400').get()
    
    // console.log('deviceData === ', deviceR124.data() as DeviceInterface)
  }

  async shutDownInterface(deviceName: string): Promise<void> {
    // const device = new snmp.Session({ host: '192.168.1.1', community: 'public' })
    // shutDownInterface(device)
  }

  async setDeviceData(deviceName: string, payload: any): Promise<void> {
    await this.networkRef.doc(deviceName).set(payload, { merge: true })
  }

  async setDeviceInterface(deviceName: string, interfaceName: string, payload: any): Promise<void> {
    await this.networkRef.doc(deviceName).collection('interface').doc(interfaceName).set(payload, { merge: true })
  }

  async setDeviceTraffic(deviceName: string, inbound: number, outbound: number): Promise<void> {
    const timestamp = new Date(moment.utc().toString())
    
    var time = new Date(moment(timestamp ,'YYYY-MM-DD HH:mm:ss').add(7, 'hour').format('YYYY-MM-DDTHH:mm:ss'))
    var epoch = +time

    await this.networkRef.doc(deviceName).collection('traffic').add({ inbound, outbound, timestamp, epoch})
  }

  async setDeviceSpeed(deviceName: string, speed: number): Promise<void> {
    const timestamp = new Date(moment.utc().toString())
    await this.networkRef.doc(deviceName).collection('speed').add({ speed, timestamp })
  }
}
