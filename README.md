# Fiware HERE Adaptor

Adaptor component for the FIWARE-NGSI-HERE integration for Smarter car navigation through cities.

# How to install and run

The following instructions are for development setups:

Prerequisites:

- **Node JS 0.12.0 or higher** (see [NodeJS](http://nodejs.org/download/)).
- Tools: **git** and **npm**.

Download the source code from git repository:

  ```bash
  $ git clone git@pdihub.hi.inet:labajo/fiware-here-adaptor.git
  ```

Install dependencies:

  ```bash
  $ npm install
  ```

When npm process finishes the dependencies installation, you could run the fiware-here-adaptor executing this command:

  ```bash
  CONFIG_DIR={path_to_config_folder} ./bin/fiware-here-adaptor
  ```

CONFIG_DIR environment variable is optional. The default configuration has the following aspect:

```js
{
  // Port where fiware-here-adaptor is available
  "serverPort": 7007,

  "logLevel": "INFO",

  // Log format: "json", "pipe", or "dev"
  "logFormat": "json",

  // If true, disable unauthorized SSL (NODE_TLS_REJECT_UNAUTHORIZED = 0)
  "gentleSsl": true,

  //Global city broker directory configuration
  "contextBroker": {
    "cityContextBrokerDirectoryName": "CityBrokerFHA",
    "maxDistanceCityDirectory": 10,
    "cityBrokerDirectoryConfig": {
      // Global city broker endpoint
      "url": "http://{contextBrokerIp}:1026/v1",
      "userAgent": "fiware-here-adapter"
    }
  },

  // HERE configuration to consume the API
  "here": {
    "geocodingUrl": "http://geocoder.cit.api.here.com",
    "reverseGeocodingUrl": "http://reverse.geocoder.cit.api.here.com",
    // You can obtain your API keys in HERE service.
    "appId": "myAppId",
    "appCode": "myAppCode"
  }
}
```
The internal config is stored in '{installation_path}/lib/config/config.json' but you can use the environment variable CONFIG_DIR to set a folder that merges the configs obtained from json files against the internal config file.

Example taking into account the internal config file above included:

CONFIG_DIR=/opt/fiware-here-adaptor

File **/opt/fiware-here-adaptor/config.json**:
```js
{
  "serverPort": 8080,
  "here": {
    "geocodingUrl": "http://geocoder.cit.api.here.com",
    "reverseGeocodingUrl": "http://reverse.geocoder.cit.api.here.com",
    // You can obtain your API keys in HERE service.
    "appId": "534g23df325df23gf4",
    "appCode": "63gdsgv23d78ads5bgv"
  }
}
```

The server will merge **/opt/fiware-here-adaptor/config.json** into **{installation_path}/lib/config/config.json** in order to get the following final configuration:

```js
{
  // Port where fiware-here-adaptor is available
  "serverPort": 8080,

  "logLevel": "INFO",

  // Log format: "json", "pipe", or "dev"
  "logFormat": "json",

  // If true, disable unauthorized SSL (NODE_TLS_REJECT_UNAUTHORIZED = 0)
  "gentleSsl": true,

  //Global city broker directory configuration
  "contextBroker": {
    "cityContextBrokerDirectoryName": "CityBrokerFHA",
    "maxDistanceCityDirectory": 10,
    "cityBrokerDirectoryConfig": {
      // Global city broker endpoint
      "url": "http://{contextBrokerIp}:1026/v1",
      "userAgent": "fiware-here-adapter"
    }
  },

  // HERE configuration to consume the API
  "here": {
    "geocodingUrl": "http://geocoder.cit.api.here.com",
    "reverseGeocodingUrl": "http://reverse.geocoder.cit.api.here.com",
    // You can obtain your API keys in HERE service.
    "appId": "534g23df325df23gf4",
    "appCode": "63gdsgv23d78ads5bgv"
  }
}
```

## Other commands:
* Launch unit tests:

  ```bash
  $ npm test
  ```
* Generate coverage report:

  ```bash
  $ npm run coverage
  ```
* Check style rules:

  ```bash
  $ npm run lint
  ```

## Contribute

### Server

The source code files are found in 'lib' folder.

Main files:

* **'lib/fiware-here-adaptor.js'** : It has the express js code.

* **'lib/routes/index.js'**: It has the definition of the exposed endpoints.

    * GET on '/v2/entities'
    * GET on '/getCenterCoords'
* **'lib/services/carNavigatorService.js'**: It contains the main flow to resolve the information of a city using the endpoint '/v2/entities'. Steps:

    * (HERE) Get city info from request coordinates.
    * (HERE) Get canonical coordinates of a city using city info.
    * (Global Context Broker) Using canonical coordinates the global context broker responses with the City Context Brokers of the city.
    * Get the different information of the current city depending the 'type' request parameter. (Parallel process)
        * Requests to fiware-orion server or ngsi10 compliant servers.
        * Adaptation of the requests when it is needed.

* **'lib/services/here'**: Folder where HERE integrations are. (Integrations: getCoordsByCityInfo, searchCityByCoords)

* **'lib/services/ngsi10'**: Folder where NGSI10 integrations are. (Integrations: getCityContextBrokerInfo)

* **'lib/services/ngsi10/utils'**: Folder where NGSI10 utilities are. (Utilities: ObjectAdaptor, helperFunctions)

* **'lib/services/orion'**: Folder where fiware-orion integrations are. (Integrations: getCityContextBrokerFromDirectory, getCityContextBrokerInfo)

* **'lib/services/orion/utils'**: Folder where fiware-orion utilities are. (Utilities: ObjectAdaptor depending the type of the event, queryContext Common use of Orion-Client)

* **'lib/errors.js'**: File that contains the error definitions.

#### Object adaptations:

The object adaptations are based on a JSON pointer rule system. Using this way it is very simple to change the outcoming data.
Files:
* lib/services/ngsi10/utils/objectAdaptors.js
* lib/services/orion/utils/objectAdaptors.js

##### Object adaptation example:

* Rules example:
```js
var rules = [
  {origin: '/geom_feature', destination: '/location'},
  {destination: '/closingTime', default: '23:00'},
  {destination: '/metered', default: false},
  {destination: '/maximumAllowedDuration', default: 480},
  {destination: '/totalSpotNumber', default: 210},
  {destination: '/availableSpotNumber', func: helperFunctions.randomIntInc, arg: [50, 100]},
  {origin: '/name', destination: '/name'},
  {origin: '/metadata/description/eng', destination: '/description'},
  {destination: '/type', default: 'ParkingLot'},
  {origin: '/id', destination: '/id'}
];
```

* Origin Object:
```js
  {
    "geom_feature": "geom_feature",
    "id": "id",
    "name": "name",
    "metadata": {"description": { "eng": "English Description" }}
  }
```

* Result Object:
```js
  {
    "location": "geom_feature",
    "closing_time": "23:00",
    "metered": false,
    "maximumAllowedDuration": 480,
    "totalSpotNumber": 210,
    "availableSpotNumber": 55,
    "id": "id",
    "name": "name",
    "type": "ParkingLot",
    "description": "English Description",
  }
```

## Context Broker provisioner script

This script contains examples to set the context information about the cities. This information contains the URLs where the city context broker is.

```bash
$ cd cbProvisioner
$ node --harmony index.js
```

It supports arguments to set information of a certain city. Arguments supported: madrid, oporto, guadalajara, aveiro, amsterdam

Example:

```bash
$ cd cbProvisioner
$ node --harmony index.js oporto madrid
```

## Deployment

Generate a tgz file with the code content.

```bash
$ npm pack
```

Copy it to server using scp or other methods.
Extract content:

```bash
$ tar -xvzf fiware-here-adaptor-1.0.0.tgz
```

Go to package folder and install all dependencies:

```bash
$ cd package
$ npm install
```

Launch the server:

```
CONFIG_DIR={path_to_config_folder} ./bin/fiware-here-adaptor
```

Or launch it using nohup:

```
CONFIG_DIR={path_to_config_folder} nohup ./bin/fiware-here-adaptor &
```

## Server Features:
* Logops library for logging to the standard output. (Pipe or json format supported). Use tee command to log to a file. https://github.com/telefonicaid/logops#writing-to-files
* Cluster. Take advantage of multi-core systems.
* Therror to define platform errors.
* Json schemas to check configuration.
* Configuration merge process using CONFIG_DIR environment var.


## Documentation

[HERE API doc](https://developer.here.com/rest-apis/documentation/routing/topics/quick-start.html)

[Smart Parking Data Models](https://docs.google.com/document/d/17leIlKCE5EdOtrAurbIsvbjRnE6UMEXQcNVswvS0J_A)
