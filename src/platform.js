import { get, remove } from 'lodash-es';
import RestAPI from './api/rest-api.js';
import Accessory from './accessories/accessory.js';

const PLUGIN_NAME = 'homebridge-somfy-pi';
const SHUTTERS_CONFIG = 'shutters';
const MINUTE = 60 * 1000;
const INIT_RETRY_INTERVAL = 5; // minutes

export const PLATFORM_NAME = 'Somfy-Pi';

export class Platform {
    constructor(log, config = {}, api) {
        this.log = log;
        this.config = config;
        this.api = api;
        this.accessories = [];

        this.log(`${PLATFORM_NAME} Init`);

        this.rest = new RestAPI(config, log);

        /**
         * Platforms should wait until the "didFinishLaunching" event has fired before
         * registering any new accessories.
         */
        api.on('didFinishLaunching', () => this.initAccessories());
    }

    /**
     * Homebridge will call the "configureAccessory" method once for every cached
     * accessory restored
     */
    configureAccessory(homekitAccessory) {
        this.log.info(
            `Restoring cached accessory ${homekitAccessory.displayName}`
        );
        try {
            this.accessories.push(this.createAccessory(homekitAccessory));
        } catch (error) {
            this.log.error(
                `Failed to restore cached accessory ${homekitAccessory.displayName}`,
                error
            );
        }
    }

    async initAccessories() {
        try {
            const newAccessories = [];

            const shutters = await this.rest.listShutters();

            for (const shutter of shutters) {
                // find the existing accessory if one was restored from cache
                let accessory = this.accessories.find(
                    (accessory) => accessory.context.shutter.id === shutter.id
                );

                // if none found, create a new one
                if (!accessory) {
                    const uuid = this.api.hap.uuid.generate(shutter.id);
                    const homekitAccessory = new this.api.platformAccessory(
                        shutter.name,
                        uuid
                    );
                    homekitAccessory.context.shutter = shutter.toContext();
                    accessory = this.createAccessory(homekitAccessory);
                    this.accessories.push(accessory);
                    newAccessories.push(accessory);
                }

                accessory.assignShutter(shutter);
            }

            // register new accessories
            if (newAccessories.length) {
                this.api.registerPlatformAccessories(
                    PLUGIN_NAME,
                    PLATFORM_NAME,
                    newAccessories.map((accessory) =>
                        accessory.getHomekitAccessory()
                    )
                );
            }

            // unregister accessories with no shutter assigned
            const orphanAccessories = remove(
                this.accessories,
                (accessory) => !accessory.shutter
            );
            if (orphanAccessories.length) {
                this.log.debug(
                    `Unregistering ${orphanAccessories.length} orphan accessories`
                );
                this.api.unregisterPlatformAccessories(
                    PLUGIN_NAME,
                    PLATFORM_NAME,
                    orphanAccessories.map((accessory) =>
                        accessory.getHomekitAccessory()
                    )
                );
            }
        } catch (error) {
            this.log.error(
                `Could not initialise platform, will retry in ${INIT_RETRY_INTERVAL} min`
            );
            setTimeout(
                () => this.initAccessories(),
                INIT_RETRY_INTERVAL * MINUTE
            );
        }
    }

    createAccessory(homekitAccessory) {
        // retrieve accessory config
        const config = get(
            get(this.config, SHUTTERS_CONFIG, {}),
            homekitAccessory.context.shutter.name
        );

        return new Accessory({
            api: this.api,
            log: this.log,
            homekitAccessory,
            config,
        });
    }
}
