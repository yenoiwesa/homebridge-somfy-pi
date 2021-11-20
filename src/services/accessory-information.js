import Service from './service.js';

let Characteristic;

class AccessoryInformation extends Service {
    constructor({ api, log, accessory }) {
        super({
            log,
            accessory,
            serviceType: api.hap.Service.AccessoryInformation,
        });

        Characteristic = api.hap.Characteristic;

        this.service.setCharacteristic(
            Characteristic.Manufacturer,
            accessory.context.shutter.manufacturer
        );
        this.service.setCharacteristic(
            Characteristic.SerialNumber,
            accessory.context.shutter.id
        );
    }
}

export default AccessoryInformation;
