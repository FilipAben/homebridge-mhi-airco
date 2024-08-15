/*
 * Implementation based off the python implementation
 * on https://github.com/jeatheak/Mitsubishi-WF-RAC-Integration
 */

import EventEmitter from 'events';
import { AirconStatus2String, String2AirconStatus } from './coder.js';
import { AirconStatus, OperationMode } from './types.js';
import { CmdQ } from './q.js';
import axios, {AxiosResponse} from 'axios';

const OPERATOR = '29fcd123-ff2a-4271-a80d-4ab56eec2c4f'
const MAX_POLL_INTERVAL_S = 10;
const DEFAULT_CMD_TRIES = 3;

enum InitState {
  NeedStatus = 0,
  NeedRegistration = 1,
  Ready = 2
}

async function sleep(seconds: number): Promise<void> {
  return new Promise((res) => {
    setTimeout(() => res(), seconds*1000);
  });
}

export class Airco extends EventEmitter {
  private host: string;
  private port: number;
  public id: string = '';
  private initialized: Promise<void>;
  private timezone: string;
  private _status: AirconStatus = {
    operation: false,
    presetTemp: 25,
    operationMode: 1,
    airFlow: 0,
    windDirectionUD: 0,
    windDirectionLR: 0,
    entrust: false,
    coolHotJudge: false,
    modelNr: 0,
    vacant: false,
    errorCode: '',
    outdoorTemp: 0,
    indoorTemp: 0,
    lastUpdated: 0,
  }

  private pollHandle: ReturnType<typeof setInterval> | null = null;
  private cmdQ: CmdQ<AxiosResponse> = new CmdQ<AxiosResponse>();

  constructor(host: string, port: number, timezone: string) {
    super();
    this.host = host;
    this.port = port;
    this.timezone = timezone;
    this.initialized = this.initialize();
  }

  get status(): AirconStatus {
    return {...this._status}
  }

  async initialize() {
    let state: InitState = InitState.NeedStatus;
    while( state !== InitState.Ready) {
      try {
        switch(state) {
          case InitState.NeedStatus:
            // console.log('State need status')
            await this.update();
            // console.log('State need registration')
            state = InitState.NeedRegistration;
            break;
          case InitState.NeedRegistration:
            await this.update_account_info(this.timezone);
            // console.log('State ready')
            state = InitState.Ready;
            this.pollHandle = setInterval(() => {
              if(!this._status) {
                return;
              }
              if((new Date().getTime() - this._status.lastUpdated)/1000 < MAX_POLL_INTERVAL_S) {
                return;
              }
              this.update();
            }, 5000)
            break;
        }
      } catch(err) {
        console.log(`Failed cmd while initializing, state ${state}, error ${(err as Error).message}`);
        sleep(2);
      }
    }
  }

  async waitInitialized() {
    return this.initialized;
  }

  async update() {
    try {
      const response = await this.#send_command('getAirconStat');
      this.id = response.airconId as string;
      this.#decodeAndUpdateStatus(response['airconStat'] as string);
    } catch(err) {
      console.debug(`Status update for ${this.id} threw error ${(err as Error).message}`);
    }
  }

  async update_account_info(time_zone: string) {
    const contents = {
      'accountId': OPERATOR,
      'airconId': this.id,
      'remote': 0,
      'timezone': time_zone,
    }
    return this.#send_command('updateAccountInfo', contents)
  }

  async #decodeAndUpdateStatus(encodedStatus: string) {
    const newStatus: AirconStatus = String2AirconStatus(encodedStatus);
    const changed = []

    for(const p in newStatus) {
      if(p !== 'lastUpdated' && ((newStatus as Record<string, any>)[p] !== (this._status as Record<string, any>)[p])) {
        changed.push(p);
      }
    }

    // console.log(newStatus);

    this._status = newStatus;
    if(changed.length) {
      this.emit('stateUpdate', {...this._status}, changed);
    }

  }

  async #send_command(command: string, contents?: Record<string, unknown>, tries = 1): Promise<Record<string, unknown>> {
    const cmd = {
      apiVer: '1.0',
      command: command,
      deviceId: 'homebridge',
      operatorId: OPERATOR,
      timestamp: Math.round(new Date().getTime()/1000),
      contents,
    }
    // console.debug(`CMD:${JSON.stringify(cmd, null, 4)}`)
    const response = await this.cmdQ.q(async () => {
      const resp = await axios.post(`http://${this.host}:${this.port}/beaver/command/${command}`, cmd);
      return resp;
    }, tries);
    // console.debug(`RESP: ${await response.text()}`);

    return response.data['contents'];
  }

  async #updateAirconStatus(changed: Partial<AirconStatus>) {
    const cmd = AirconStatus2String({...this._status, ...changed});
    try {
      const response = await this.#send_command('setAirconStat', { airconId: this.id, airconStat: cmd }, DEFAULT_CMD_TRIES);
      this.#decodeAndUpdateStatus(response['airconStat'] as string);
    } catch(err) {
      console.log(`updateAirconStatus threw error ${(err as Error).message}`)
    }
  }

  async setOperationState(state: boolean): Promise<void> {
    await this.initialized;
    await this.#updateAirconStatus({ operation: state });
  }

  async setOperationMode(mode: OperationMode): Promise<void> {
    await this.initialized;
    await this.#updateAirconStatus({ operationMode: mode });
  }

  async setTargetTemp(temp: number): Promise<void> {
    await this.initialized;
    await this.#updateAirconStatus({ presetTemp: temp});
  }

  stop() {
    if(this.pollHandle) {
      clearInterval(this.pollHandle);
    }
  }

}
