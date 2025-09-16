# Yahalom Gatewaye

----------------------------------

This repo is for managing messages with CRUD requests supporting telemetry.

> [!IMPORTANT]
> To regenerate the types on openapi change run the command `npm run generate:openapi-types`.


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

git clone https://link-to-project

```

Go to the project directory

```bash

cd my-project

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
