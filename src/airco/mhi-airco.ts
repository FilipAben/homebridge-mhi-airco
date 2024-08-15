/*
 * Implementation based off the python implementation
 * on https://github.com/jeatheak/Mitsubishi-WF-RAC-Integration
 */

import { warn } from 'console';
import { Airco } from './airco';


const IP = '10.0.0.170'
const PORT = 51443

// const b64AirconStat = await send_command('getAirconStat');
// const decodedStat = decodeAirconStatus(b64AirconStat['airconStat']);
// console.log(decodedStat);
// decodedStat.operation = false;
// const final_cmd = generateB64AirconStat(decodedStat);
// const response = await send_command('setAirconStat', { airconId: b64AirconStat['airconId'], airconStat: final_cmd });
// console.log(response);

//update_account_info('e816561126eb', "Europe/Brussels");

// console.log(await getDeviceInfo())

const airco = new Airco(IP, PORT, 'Europe/Brussels');

airco.on('stateUpdate', (state, changed) => {
  console.log(`State updated to ${JSON.stringify(state)}, changed: ${changed}`);
})

// await airco.setTargetTemp(22);
// await airco.update();
await airco.setOperationState(false);
await airco.update();
