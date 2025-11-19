# Yahalom Gateway

----------------------------------

This repo is for managing messages with CRUD requests supporting telemetry.

## Telemetry Log Object
| name | type | mandatory* | description |
|---|---|---|---|
| sessionId | number | true | Log identifier for the session |
| severity | enum[string] | true | Specifies the logging level. Available Options ('EMERGENCY', 'ALERT', 'CRITICAL', 'ERROR', 'WARNING', 'NOTICE', 'INFORMATIONAL', 'DEBUG') |
| timeStamp | date | true | The exact date and time the log was logged |
| message | string | true | The log message describing the event |
| messageParameters | array | false | Optional parameters in addition |
| component | enum[string] | true | Name of where the system component that generated the log. Available Options ('GENERAL', 'MAP', 'FTUE', 'FTUE') |
| messageType | enum[string] | true | Type of the message, used to filter the logs. Available Options ('APPSTARTED', 'APPEXITED', 'USERDETAILS', 'USERMACHINESPEC','USERDEVICES', 'DEVICECONNECTED', 'DEVICEDISCONNECTED', 'GAMEMODESTARTED', 'GAMEMODEENDED', 'IDLETIMESTARTED', 'IDLETIMEENDED', 'LAYERUSESTARTED', 'LAYERUSERENDED', 'MULTIPLAYERSTARTED', 'MULTIPLAYERENDED', 'LOCATION', 'ERROR', 'GENERALINFO', 'WARNING', 'CONSUMPTIONSTATUS', 'APPLICATIONDATA') |



## Development
When in development you should use the command `npm run start:dev`. The main benefits are that it enables offline mode for the config package, and source map support for NodeJS errors.

## API
Checkout the OpenAPI spec [here](/openapi3.yaml)

## Installation

Install deps with npm

```bash
npm install
```

## Run Locally

Clone the project

```bash

git clone https://github.com/MapColonies/yahalom-gateway.git

```
or
```bash

git clone git@github.com:MapColonies/yahalom-gateway.git

```

Go to the project directory

```bash

cd yahalom-gateway

```

Install dependencies

```bash

npm install

```

Start the server

```bash

npm run start

```

## Running Tests

To run tests, run the following command

```bash

npm run test

```

To only run unit tests:
```bash
npm run test:unit
```

To only run integration tests:
```bash
npm run test:integration
```
