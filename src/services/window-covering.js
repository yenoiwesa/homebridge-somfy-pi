import { get } from 'lodash-es';
import AbortController from 'abort-controller';
import Service from './service.js';
import { delayPromise } from '../utils.js';

const POSITION_STATE_CHANGING_DURATION = 6 * 1000;

let Characteristic;

const Command = {
    OPEN: 'open',
    CLOSE: 'close',
    MY: 'my',
};

const DEFAULT_COMMANDS = [Command.CLOSE, Command.MY, Command.OPEN];

class WindowCovering extends Service {
    constructor({ api, log, accessory, config }) {
        super({
            log,
            accessory,
            serviceType: api.hap.Service.WindowCovering,
        });

        this.config = config;

        // using the default commands if none have been defined by the user
        this.commands = get(this.config, 'commands', DEFAULT_COMMANDS);

        if (!Array.isArray(this.commands) || this.commands.length < 2) {
            this.log.error(
                'The shutter commands settings must be an array of at least two commands.',
                `Using default commands instead for ${accessory.name}.`
            );
            this.commands = DEFAULT_COMMANDS;
        }

        Characteristic = api.hap.Characteristic;

        // Current Position
        // Percentage, 0 for closed and 100 for open
        this.currentPosition = this.getCharacteristic(
            Characteristic.CurrentPosition
        );

        // Target Position
        // Percentage, 0 for closed and 100 for open
        this.targetPositionSteps = parseFloat(
            (100 / (this.commands.length - 1)).toFixed(2)
        );

        this.targetPosition = this.getCharacteristic(
            Characteristic.TargetPosition
        )
            .setProps({
                minValue: 0,
                maxValue: 100,
                minStep: this.targetPositionSteps,
            })
            .on('set', (value, cb) =>
                this.setHomekitState(
                    'target position',
                    value,
                    this.setTargetPosition.bind(this),
                    cb
                )
            );

        // Position State
        // DECREASING (0) | INCREASING (1) | STOPPED (2)
        this.positionState = this.getCharacteristic(
            Characteristic.PositionState
        );

        // set initial values
        this.positionState.updateValue(Characteristic.PositionState.STOPPED);
    }

    async setTargetPosition(value) {
        const controller = new AbortController();
        const abortSignal = controller.signal;

        const command =
            this.commands[Math.round(value / this.targetPositionSteps)];

        if (command == null) {
            return;
        }

        this.updatePositionState(value);

        // abort current request if there is one
        if (this.controller) {
            this.controller.abort();
        }
        // assign the current request controller
        this.controller = controller;

        try {
            await this.accessory.shutter.sendCommand(command);
        } catch (error) {
            this.log.error(error);
            return;
        }

        // set the final requested position after specific delay
        delayPromise(POSITION_STATE_CHANGING_DURATION, abortSignal)
            .then(() => {
                this.currentPosition.updateValue(value);
                this.updatePositionState(value);
            })
            .catch(() => {
                // do nothing
            });
    }

    updatePositionState(target) {
        const position = this.currentPosition.value;

        let positionState;
        if (position > target) {
            positionState = Characteristic.PositionState.DECREASING;
        } else if (position < target) {
            positionState = Characteristic.PositionState.INCREASING;
        } else {
            positionState = Characteristic.PositionState.STOPPED;
        }

        this.positionState.updateValue(positionState);
    }
}

export default WindowCovering;
