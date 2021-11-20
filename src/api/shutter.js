class Shutter {
    constructor(id, name, rest) {
        this.id = id;
        this.name = name;
        this.rest = rest;
    }

    get manufacturer() {
        return 'Somfy';
    }

    toContext() {
        return {
            id: this.id,
            name: this.name,
            manufacturer: this.manufacturer,
        };
    }

    async sendCommand(command) {
        return this.rest.sendCommand(this, command);
    }
}

export default Shutter;
