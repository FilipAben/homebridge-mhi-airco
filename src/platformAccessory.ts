import { Service, PlatformAccessory, CharacteristicValue, Characteristic } from 'homebridge';

import { MHIAircoPlatform } from './platform.js';
import { Airco } from './airco/airco.js';
import { AirconStatus, OperationMode } from './airco/types.js';

/**
 * Platform Accessory
 * An instance of this class is created for each accessory your platform registers
 * Each accessory may expose multiple services of different service types.
 */
export class AircoPlatformAccessory {
  private hcService: Service;
  private tempService: Service | null = null;
  private airco: Airco;

  constructor(
    private readonly platform: MHIAircoPlatform,
    private readonly accessory: PlatformAccessory,
    airco: Airco,
    addOutdoorTemp: boolean = false,
  ) {
    this.airco = airco;

    this.airco.on('stateUpdate', (state: AirconStatus, changed: string[]) => {
      if(changed.includes('operation')) {
        this.hcService.updateCharacteristic(this.platform.Characteristic.Active, state.operation ? 1 : 0);
      }
      if(changed.includes('presetTemp')) {
        this.hcService.updateCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature, state.presetTemp);
        this.hcService.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, state.presetTemp);
      }
      if(changed.includes('tar')) {
        this.hcService.updateCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature, state.presetTemp);
        this.hcService.updateCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature, state.presetTemp);
      }

    })

    // set accessory information
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Mitsubishi Heavy Industries')
      .setCharacteristic(this.platform.Characteristic.Model, 'Unknown')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Unknown');

    // HEATERCOOLER SERVICE CONFIGURATiON
    this.hcService = this.accessory.getService(this.platform.Service.HeaterCooler)
      || this.accessory.addService(this.platform.Service.HeaterCooler);

    this.hcService.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.hcService.getCharacteristic(this.platform.Characteristic.Active)
      .onSet(this.setActive.bind(this))
      .onGet(this.getActive.bind(this));

    this.hcService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
      .onGet(this.getCurrentTemperature.bind(this));

    this.hcService.getCharacteristic(this.platform.Characteristic.CurrentHeaterCoolerState)
      .onGet(this.getCurrentMode.bind(this));

    this.hcService.getCharacteristic(this.platform.Characteristic.TargetHeaterCoolerState)
      .onSet(this.setTargetMode.bind(this))
      .onGet(this.getTargetMode.bind(this));

    this.hcService.getCharacteristic(this.platform.Characteristic.CoolingThresholdTemperature)
      .onSet(this.setPresetTemp.bind(this))
      .onGet(this.getPresetTemp.bind(this));

    this.hcService.getCharacteristic(this.platform.Characteristic.HeatingThresholdTemperature)
      .onSet(this.setPresetTemp.bind(this))
      .onGet(this.getPresetTemp.bind(this));

    // Outdoor temperature sensor
    if(addOutdoorTemp) {
      this.tempService = this.accessory.getService('Outdoor temperature') ||
      this.accessory.addService(this.platform.Service.TemperatureSensor, 'Outdoor temperature', '1');

      this.tempService.getCharacteristic(this.platform.Characteristic.CurrentTemperature)
        .onGet(this.getOutdoorTemperature.bind(this));
    }
  }

  // ON/OFF
  async setActive(value: CharacteristicValue) {
    this.platform.log.debug('Set operation mode', value);
    const target = value === 1 ? true : false;
    await this.airco.setOperationState(target);
  }

  async getActive(): Promise<CharacteristicValue> {
    this.platform.log.debug('Get Characteristic On ->', this.airco.status.operation);
    return this.airco.status.operation ? 1 : 0;
  }

  // CURRENT MODE
  async getCurrentTemperature(): Promise<CharacteristicValue> {
    this.platform.log.debug('Get current temp ->', this.airco.status.indoorTemp);
    return this.airco.status.indoorTemp;
  }

  async getCurrentMode(): Promise<CharacteristicValue> {
    this.platform.log.debug('Get current mode ->', this.airco.status.operationMode);
    let state = 0;
    if(!this.airco.status.operationMode) {
      return 0;
    }
    switch(this.airco.status.operationMode) {
      case OperationMode.Cool:
        state = 3;
        break;
      case OperationMode.Heat:
        state = 2;
        break;
    }
    return state;
  }

  // TARGET MODE
  async setTargetMode(value: CharacteristicValue) {
    let mode = OperationMode.Cool;

    switch(value) {
      case 0:
        mode = OperationMode.Auto;
        break;
      case 1:
        mode = OperationMode.Heat;
        break;
      case 2:
        mode = OperationMode.Cool;
        break;
    }
    await this.airco.setOperationMode(mode)
  }

  async getTargetMode(): Promise<CharacteristicValue> {
    switch(this.airco.status.operationMode) {
      case OperationMode.Heat:
        return 1;
      case OperationMode.Cool:
        return 2;
      default:
        return 0;
    }
  }

  // TEMPERATURE SETPOINT
  async getPresetTemp(): Promise<CharacteristicValue> {
    return this.airco.status.presetTemp;
  }

  async setPresetTemp(value: CharacteristicValue) {
    console.log(`Target temp: ${value}`);
    this.airco.setTargetTemp(value as number)
  }

  // FAN SPEED
  async getFanSpeed(): Promise<CharacteristicValue> {
    return this.airco.status.presetTemp;
  }

  async setFanSpeed(value: CharacteristicValue) {
    console.log(`Target temp: ${value}`);
    this.airco.setTargetTemp(value as number)
  }


  async getOutdoorTemperature(): Promise<CharacteristicValue> {
    return this.airco.status.outdoorTemp;
  }
}
