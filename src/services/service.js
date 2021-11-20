class Service {
    constructor({ log, accessory, serviceType }) {
        this.log = log;
        this.accessory = accessory;
        this.service = this.getOrCreateHomekitService(serviceType);
    }

    getOrCreateHomekitService(serviceType) {
        const homekitAccessory = this.accessory.getHomekitAccessory();

        // get the service from the accessory if it exists
        let service = homekitAccessory.getService(serviceType);

        // otherwise create it
        if (!service) {
            service = homekitAccessory.addService(serviceType);
        }

        return service;
    }

    getHomekitService() {
        return this.service;
    }

    getCharacteristic(characteristic) {
        return this.service.getCharacteristic(characteristic);
    }

    async getHomekitState(state, getStateFn, callback) {
        this.log.debug(`Get ${this.accessory.name} ${state}`);

        if (!this.accessory.shutter) {
            callback('No shutter is associated to this service');
            this.log.error(
                `No shutter is associated to ${this.accessory.name}`
            );
            return;
        }

        try {
            const value = await getStateFn();

            this.log.info(
                `Get ${this.accessory.name} ${state} success: ${value}`
            );
            callback(null, value);
        } catch (error) {
            this.log.error(
                `Could not fetch ${this.accessory.name} ${state}`,
                error
            );

            callback(error);
        }
    }

    async setHomekitState(state, value, setStateFn, callback) {
        this.log.debug(
            `Set ${this.accessory.name} ${state} with value: ${value}`
        );

        if (!this.accessory.shutter) {
            callback('No shutter is associated to this service');
            this.log.error(
                `No shutter is associated to ${this.accessory.name}`
            );
            return;
        }

        try {
            await setStateFn(value);

            this.log.info(
                `Set ${this.accessory.name} ${state} success: ${value}`
            );
            callback();
        } catch (error) {
            this.log.error(
                `Could not set ${this.accessory.name} ${state}`,
                error
            );

            callback(error);
        }
    }
}

export default Service;
