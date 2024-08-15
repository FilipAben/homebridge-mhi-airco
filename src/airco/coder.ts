import {AirconStatus, LRDirections, UDDirections, airFlows, indoorTempList, opModes, outdoorTempList} from './types.js';

export function String2AirconStatus(data: string): AirconStatus {
  const decoded = Buffer.from(data, 'base64');

  for(let i = 0 ; i < decoded.length ; i+=1) {
    decoded[i] = decoded[i] > 127 ? (256 - decoded[i]) : decoded[i]
  }

  const start_length = decoded[18] * 4 + 21
  const content = decoded.slice(start_length, start_length + 18);

  function byteToErrorCode(byte: number): string {
    const code = byte & 127;

    if(code === 0) {
      return '00';
    }
    if((byte & -128) <= 0) {
      return '' + code;
    }
    return 'E' + code;
  }

  const measRange = decoded.slice(start_length + 19, decoded.length - 2);

  let outdoorTemp = -1;
  let indoorTemp = -1;
  for(let i = 0; i<measRange.length; i+=4) {
    if(measRange[i] === 128 && measRange[i + 1] === 16) {
      outdoorTemp = outdoorTempList[outdoorTempList.length - (measRange[i + 2] & 0xFF)];

    }
    if(measRange[i] === 128 && measRange[i + 1] === 32) {
      indoorTemp = indoorTempList[indoorTempList.length - (measRange[i + 2] & 0xFF)];
    }
  }

  return {
    operation: 1 === (3 & content[2]),
    presetTemp: content[4] / 2,
    operationMode: opModes.indexOf(60 & content[2]) + 1,
    airFlow: airFlows.indexOf(15 & content[3]),
    windDirectionUD: ((content[2] & 192) === 64) ? 0 : UDDirections.indexOf(240 & content[3]) + 1,
    windDirectionLR: ((content[12] & 3) === 1) ? 0 : LRDirections.indexOf(31 & content[11]) + 1,
    entrust: 4 === (12 & content[12]),
    coolHotJudge: (content[8] & 8) <= 0,
    modelNr: content[0] & 127,
    vacant: (content[10] & 1) !== 0,
    errorCode: byteToErrorCode(content[6]),
    indoorTemp: indoorTemp,
    outdoorTemp: outdoorTemp,
    lastUpdated: new Date().getTime(),
  }
}

export function AirconStatus2String(stat: Partial<AirconStatus>) {
  const command = add_crc(Buffer.from(add_variable(command_to_byte(stat))));
  const receive = add_crc(Buffer.from(add_variable(recieve_to_bytes(stat))));
  const allbytes = new Uint8Array(command.length + receive.length);
  allbytes.set(command, 0);
  allbytes.set(receive, command.length);
  return Buffer.from(allbytes).toString('base64');
}

function add_crc(data: Buffer) {
  const result = new Uint8Array(data.length + 2)
  result.set(data, 0);
  result.set(crc16_ccitt(data), data.length);
  return result;
}

function crc16_ccitt(s: Buffer): Uint8Array {
  // const c: number[] = [];
  // for(let k = 0 ; k < s.length ; k+=1) {
  //   c.push(s[k] > 127 ? (256 - s[k]) : s[k]);
  // }

  let i = 65535
  for(const b of s) {
    for(let i2=0; i2< 8; i2++) {
      let z = true
      const z2 = ((b>> (7-i2)) & 1) === 1
      if ((( i >> 15) & 1) !== 1) {
        z = false
      }
      i = i << 1
      if(z2 !== z) {
        i ^= 4129
      }
    }
  }
  const result = i & 65535
  return new Uint8Array([result & 0xFF, result >> 8 & 0xFF]);
}

function add_variable(data: Uint8Array): Uint8Array {
  const result = new Uint8Array(data.length + 5);
  result.set(data, 0);
  result.set(new Uint8Array([1, 255, 255, 255, 255]), data.length);
  return result;
}

function command_to_byte( stat: Partial<AirconStatus>): Uint8Array {
  const stat_byte: Uint8Array = new Uint8Array([0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  // Operation
  if(stat.operation) {
    stat_byte[2] |= 3;
  } else {
    stat_byte[2] |= 2;
  }

  // Operating Mode
  switch(stat.operationMode) {
    case 0:
      stat_byte[2] |= 32;
      break;
    case 1:
      stat_byte[2] |= 40;
      break;
    case 2:
      stat_byte[2] |= 48;
      break;
    case 3:
      stat_byte[2] |= 44;
      break;
    case 4:
      stat_byte[2] |= 36;
      break;
    default:
      console.log(`Invalid operation mode ${stat.operationMode}`);
  }

  switch(stat.airFlow) {
    case 0:
      stat_byte[3] |= 15;
      break;
    case 1:
      stat_byte[3] |= 8;
      break;
    case 2:
      stat_byte[3] |= 9;
      break;
    case 3:
      stat_byte[3] |= 10;
      break;
    case 4:
      stat_byte[3] |= 14;
      break;
    default:
      console.log(`Invalid airflow state ${stat.airFlow}`);
  }

  switch(stat.windDirectionUD) {
    case 0:
      stat_byte[2] |= 192;
      stat_byte[3] |= 128;
      break;
    case 1:
      stat_byte[2] |= 128;
      stat_byte[3] |= 128;
      break;
    case 2:
      stat_byte[2] |= 128;
      stat_byte[3] |= 144;
      break;
    case 3:
      stat_byte[2] |= 128;
      stat_byte[3] |= 160;
      break;
    case 4:
      stat_byte[2] |= 128;
      stat_byte[3] |= 176;
      break;
    default:
      console.log(`Invalid UD wind direction ${stat.windDirectionUD}`);

  }

  switch(stat.windDirectionLR) {
    case 0:
      stat_byte[12] |= 3;
      stat_byte[11] |= 16;
      break;
    case 1:
      stat_byte[12] |= 2;
      stat_byte[11] |= 16;
      break;
    case 2:
      stat_byte[12] |= 2;
      stat_byte[11] |= 17;
      break;
    case 3:
      stat_byte[12] |= 2;
      stat_byte[11] |= 18;
      break;
    case 4:
      stat_byte[12] |= 2;
      stat_byte[11] |= 19;
      break;
    case 5:
      stat_byte[12] |= 2;
      stat_byte[11] |= 20;
      break;
    case 6:
      stat_byte[12] |= 2;
      stat_byte[11] |= 21;
      break;
    case 7:
      stat_byte[12] |= 2;
      stat_byte[11] |= 22;
      break;
    default:
      console.log(`Invalid LR wind direction ${stat.windDirectionLR}`);
  }

  const preset_temp = stat.operationMode === 3 ? 25.0 : stat.presetTemp;
  stat_byte[4] |= Math.round((preset_temp ?? 25) / 0.5) + 128;

  if(stat.entrust) {
    stat_byte[12] |= 12;
  } else {
    stat_byte[12] |= 8;
  }

  if(!stat.coolHotJudge) {
    stat_byte[8] |= 8;
  }
  if(stat.modelNr === 1) {
    stat_byte[10] |= stat.vacant ? 1 : 0;
  }

  if(stat.modelNr !== 1 && stat.modelNr !== 2) {
    return stat_byte;
  }

  stat_byte[10] |= 0
  stat_byte[10] |= 128

  return stat_byte
}

function recieve_to_bytes(stat: Partial<AirconStatus>): Uint8Array {
  const stat_byte: Uint8Array = new Uint8Array( [0, 0, 0, 0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

  if(stat.operation) {
    stat_byte[2] |= 1
  }

  switch(stat.operationMode) {
    case 1:
      stat_byte[2] |= 8;
      break;
    case 2:
      stat_byte[2] |= 16;
      break;
    case 3:
      stat_byte[2] |= 12;
      break;
    case 4:
      stat_byte[2] |= 4;
      break;
  }

  switch(stat.airFlow) {
    case 0:
      stat_byte[3] |= 7;
      break;
    case 1:
      break;
    case 2:
      stat_byte[3] |= 1;
      break;
    case 3:
      stat_byte[3] |= 2;
      break;
    case 4:
      stat_byte[3] |= 6;
      break;
  }

  switch(stat.windDirectionUD) {
    case 0:
      stat_byte[2] |= 64;
      break;
    case 1:
      break;
    case 2:
      stat_byte[3] |= 16;
      break;
    case 3:
      stat_byte[3] |= 32;
      break;
    case 4:
      stat_byte[3] |= 48;
      break;
  }

  switch(stat.windDirectionLR) {
    case 0:
      stat_byte[12] |= 1;
      break;
    case 1:
      stat_byte[11] |= 0;
      break;
    case 2:
      stat_byte[11] |= 1;
      break;
    case 3:
      stat_byte[11] |= 2;
      break;
    case 4:
      stat_byte[11] |= 3;
      break;
    case 5:
      stat_byte[11] |= 4;
      break;
    case 6:
      stat_byte[11] |= 5;
      break;
    case 7:
      stat_byte[11] |= 6;
      break;
  }

  const preset_temp = stat.operationMode === 3 ? 25.0 : stat.presetTemp;
  stat_byte[4] |= Math.round((preset_temp || 25) / 0.5);

  if(stat.entrust) {
    stat_byte[12] |= 4;
  }

  if(!stat.coolHotJudge) {
    stat_byte[8] |= 8;
  }

  if(stat.modelNr === 1) {
    stat_byte[0] |= 1;
  } else if(stat.modelNr === 2) {
    stat_byte[0] |= 2;
  }

  if(stat.modelNr === 1) {
    stat_byte[10] |= stat.vacant ? 1 : 0;
  }

  if(![1, 2].includes(stat.modelNr ?? 0)) {
    return stat_byte
  }
  stat_byte[15] |= 0
  return stat_byte
}
