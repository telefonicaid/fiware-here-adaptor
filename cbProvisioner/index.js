'use strict';

var Orion = require('fiware-orion-client');

var ORION_SERVER = 'http://130.206.83.68:1026/v1';
var OrionClient = new Orion.Client({
  url: ORION_SERVER,
  userAgent: 'fiware-here-adapter'
});


var cities = {
  madrid: false,
  oporto: false,
  guadalajara: false,
  aveiro: false,
  amsterdam: false
};


if (process.argv.length === 2) {
  for (var key in cities) {
    cities[key] = true;
  }
} else {
  process.argv.forEach(function (val, index) {
    if (index > 1) {
      cities[val] = true;
    }
  });
}

if (cities.madrid) {
  var contextDataMad = {
    type: 'CityBrokerFHA',
    id: 'rtcbmadrid',
    location: new Orion.Attribute('40.42028,-3.70578', 'geo:point'),
    cityContextBroker: 'http://130.206.83.68:1026/v1'
  };

  OrionClient.updateContext(contextDataMad).then(function() {
    console.log('Context Properly updated (Madrid)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}

//------------------------------------------------------
if (cities.guadalajara) {
  var contextDataGua = {
    type: 'CityBrokerFHA',
    id: 'rtcbguadalajara',
    location: new Orion.Attribute('40.63018,-3.16446', 'geo:point'),
    cityContextBroker: 'http://130.206.83.68:1026/v1'
  };

  OrionClient.updateContext(contextDataGua).then(function() {
    console.log('Context Properly updated (Guadalajara)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}

//------------------------------------------------------
if (cities.amsterdam) {
  var contextDataAms = {
    type: 'CityBrokerFHA',
    id: 'rtcbamsterdam',
    location: new Orion.Attribute('52.3731,4.89329', 'geo:point'),
    cityContextBroker: 'http://130.206.83.68:1026/v1'
  };

  OrionClient.updateContext(contextDataAms).then(function() {
    console.log('Context Properly updated (Amsterdam)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}

//------------------------------------------------------

if (cities.oporto) {
  var contextDataOporto = {
    type: 'CityBrokerFHA',
    id: 'rtcboporto',
    location: new Orion.Attribute('41.14946,-8.61031', 'geo:point'),
    cityBrokers: {
      TrafficEvent: {
        url: 'http://fiware-porto.citibrain.com:1026/v1',
        entity: 'TrafficEvent',
        type: 'orion'
      },
      EnvironmentEvent: {
        url: 'http://fiware-porto.citibrain.com:1026/v1',
        entity: 'EnvironmentEvent',
        type: 'orion'
      },
      ParkingLot: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/pois',
        poisCat: '418',
        type: 'ngsi10',
        key: 'hackacityporto2015_server'
      },
      StreetParking: {
        url: 'http://fiware-porto.citibrain.com:1026/v1',
        entity: 'StreeParking',
        type: 'orion'
      },
      CityEvent: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/events',
        type: 'ngsi10',
        key: 'hackacityporto2015_server'
      }
    }
  };

  OrionClient.updateContext(contextDataOporto).then(function() {
    console.log('Context Properly updated (Oporto)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}

//------------------------------------------------------

if (cities.aveiro) {
  var contextDataAveiro = {
    type: 'CityBrokerFHA',
    id: 'rtcbaveiro',
    location: new Orion.Attribute('40.64123,-8.65391', 'geo:point'),
    cityBrokers: {
      ParkingLot: {
        url: 'http://fiware-aveiro.citibrain.com:1026/v1',
        entity: 'ParkingLot',
        pattern: 'Aveiro*',
        type: 'orion',
        geo: 'true'
      },
      StreetParking: {
        url: 'http://fiware-aveiro.citibrain.com:1026/v1',
        entity: 'StreetParking',
        pattern: 'Aveiro*',
        type: 'orion',
        geo: 'true'
      }
    }
  };

  OrionClient.updateContext(contextDataAveiro).then(function() {
    console.log('Context Properly updated (Aveiro)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}
