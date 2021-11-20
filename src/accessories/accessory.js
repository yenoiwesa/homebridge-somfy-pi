import AccessoryInformation from '../services/accessory-information.js';
import WindowCovering from '../services/window-covering.js';

class Accessory {
    constructor({ api, log, homekitAccessory, config }) {
        this.api = api;
        this.log = log;
        this.accessory = homekitAccessory;
        this.config = config;
        this.services = [];

        this.services.push(
            new AccessoryInformation({
                api,
                log,
                accessory: this,
            })
        );

        this.services.push(
            new WindowCovering({
                api,
                log,
                accessory: this,
                config,
            })
        );

        this.log.debug(`Found ${this.constructor.name} ${this.name}`);
    }

    assignShutter(shutter) {
        this.shutter = shutter;

        // use the most up to date shutter in the accessory context
        this.context.shutter = shutter.toContext();
    }

    getHomekitAccessory() {
        return this.accessory;
    }

    get context() {
        return this.accessory.context;
    }

    get name() {
        return this.context.shutter.name;
    }
}

export default Accessory;
