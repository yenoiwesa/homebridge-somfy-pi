# Homebridge Somfy Pi

A Homebridge plugin providing HomeKit support for the [Nickduino/Pi-Somfy](https://github.com/Nickduino/Pi-Somfy) project via its REST API.

# Requirements

-   **Node** version 16 or above (verify with `node --version`).
-   **Homebridge** version 1.0.0 or above.

# Installation

1. Install homebridge using:

```sh
npm install -g homebridge
```

2. Install the plugin using:

```sh
npm install -g homebridge-somfy-pi
```

3. Update your configuration file. See bellow for a sample.

> **Note:** it is also possible to install this plugin in a local `npm` package instead using the homebridge option `--plugin-path`.

# Configuration

## General settings

To configure homebridge-somfy-pi, add the `Somfy-Pi` platform to the `platforms` section of your homebridge's `config.js` file:

```json
{
    "bridge": { "...": "..." },

    "description": "...",

    "platforms": [
        {
            "platform": "Somfy-Pi",
            "name": "Somfy-Pi",
            "host": "http://192.168.1.1:9000"
        }
    ]
}
```

The platform can be configured with the following parameters:

### Required settings

| Parameter | Type   | Default | Note                                                                         |
| --------- | ------ | ------- | ---------------------------------------------------------------------------- |
| `host`    | String | `null`  | The URL where the Somfy-Pi web server is accessible at on the local network. |

### Optional settings

| Parameter  | Type   | Default | Note                                                                                                                                    |
| ---------- | ------ | ------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `shutters` | Object | `null`  | A JSON object that allows to configure specific shutters, using their name as key and configuration Object as value. See section below. |

## Shutter-specific configuration

Each shutter can receive specific additional configurations. For instance, they can accept the `commands` configuration:

```json
{
    "platforms": [
        {
            "platform": "Connexoon",
            "...": "...",

            "devices": {
                "Bedroom Blind": {
                    "commands": ["close", "my", "open"]
                }
            }
        }
    ]
}
```

Note that the above configuration is the default for a shutter, and thus does not need to declared in the homebridge configuration file to use the default.

#### `commands` - Array - Optional

An Array of Strings mapping RTS commands (one of `open`, `my`, `close`) to homekit window covering positions.

The default value is:

```json
["close", "my", "open"]
```

The above configuration means that the shade will have three 'steps' in the Home app, with the bottom one sending the `close` command, the middle one sending the `my` command and the top one sending the `open` command.

If your shades have been installed in the opposite direction, simply reverse the commands array to:

```json
["open", "my", "close"]
```

It is also possible to override the configuration to have only two 'steps' for the shade's closure, and for instance, use the 'my' preferred position as the open state, with:

```json
["close", "my"]
```

# Contribute

Please feel free to contribute to this plugin by adding support for new device types, implementing new features or fixing bugs. Pull requests are welcome.
