import fetch from 'node-fetch';
import Shutter from './shutter.js';

const RestActions = {
    UP: 'up',
    DOWN: 'down',
    STOP: 'stop',
    GET_CONFIG: 'getConfig',
};

const CommandToAction = {
    open: RestActions.UP,
    my: RestActions.STOP,
    close: RestActions.DOWN,
};

class RestAPI {
    constructor(config, log) {
        this.config = config;
        this.log = log;
    }

    async sendRequest(action, options) {
        const url = `${this.config.host}/cmd/${action}`;

        const response = await fetch(url, options);
        return response.json();
    }

    async listShutters() {
        try {
            const config = await this.sendRequest(RestActions.GET_CONFIG);
            const shutters = [];

            for (let [id, name] of Object.entries(config.Shutters)) {
                shutters.push(new Shutter(id, name, this));
            }

            return shutters;
        } catch (error) {
            this.log.error('Failed to get shutters list', error);

            throw error;
        }
    }

    async sendCommand(shutter, command) {
        const params = new URLSearchParams();
        params.append('shutter', shutter.id);

        try {
            const response = await this.sendRequest(CommandToAction[command], {
                method: 'POST',
                body: params,
            });

            if (response.status !== 'OK') {
                throw new Error('Did not receive OK response status');
            }
        } catch (error) {
            this.log.error('Failed to execute shutter command', error);

            throw error;
        }
    }
}

export default RestAPI;
