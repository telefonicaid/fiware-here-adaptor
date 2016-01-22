'use strict';

var Orion = require('fiware-orion-client');
var _ = require('lodash');
var ORION_SERVER = 'http://130.206.83.68:1026/v1';
var OrionClient = new Orion.Client({
  url: ORION_SERVER,
  userAgent: 'fiware-here-adapter'
});

var cities = [];

if (process.argv.length === 2) {
  cities = ['madrid', 'oporto', 'guadalajara', 'aveiro', 'amsterdam', 'santander'];
} else {
  process.argv.forEach(function (val, index) {
    if (index > 1) {
      cities.push(val);
    }
  });
}

cities = _.uniq(cities);

cities.forEach(function(city) {
  switch(city) {
    case 'madrid':
      updateContextMadrid();
      break;
    case 'oporto':
      updateContextOporto();
      break;
    case 'guadalajara':
      updateContextGuadalajara();
      break;
    case 'aveiro':
      updateContextAveiro();
      break;
    case 'amsterdam':
      updateContextAmsterdam();
      break;
    case 'santander':
      updateContextSantander();
      break;
    default:
      console.log('Unknown City');
  }

});


//------------------------------------------------------
function updateContextGuadalajara() {
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
function updateContextAmsterdam() {
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

function updateContextOporto() {
  var contextDataOporto = {
    type: 'CityBrokerFHA',
    id: 'rtcboporto',
    location: new Orion.Attribute('41.14946,-8.61031', 'geo:point'),
    cityBrokers: {
      AmbientArea: {
        url: 'http://130.206.83.68:1026/v1',
        entity: 'AmbientArea',
        type: 'orion'
      },
      TrafficEvent: {
        url: 'http://fiware-porto.citibrain.com:1026/v1',
        entity: 'TrafficEvent',
        type: 'orion'
      },
      AmbientObserved: {
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
        entity: 'StreetParking',
        type: 'orion'
      },
      CityEvent: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/events',
        type: 'ngsi10',
        key: 'hackacityporto2015_server'
      },
      WeatherForecast: {
        url:    'http://130.206.83.68:1028/v2/entities',
        q: {
          country: 'PT',
          addressLocality: 'Porto'
        },
        entity: 'WeatherForecast',
        type:   'ngsiv2'
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

function updateContextAveiro() {
  var contextDataAveiro = {
    type: 'CityBrokerFHA',
    id: 'rtcbaveiro',
    location: new Orion.Attribute('40.64123,-8.65391', 'geo:point'),
    cityBrokers: {
      ParkingLot: {
        url: 'http://fiware-aveiro.citibrain.com:1026/v1',
        entity: 'ParkingLot',
        pattern: 'Aveiro*',
        type: 'orion'
      },
      StreetParking: {
        url: 'http://fiware-aveiro.citibrain.com:1026/v1',
        entity: 'StreetParking',
        pattern: 'Aveiro*',
        type: 'orion'
      }
    }
  };

  OrionClient.updateContext(contextDataAveiro).then(function() {
    console.log('Context Properly updated (Aveiro)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}

function updateContextSantander() {
  var contextDataSantander = {
    type: 'CityBrokerFHA',
    id: 'rtcbsantander',
    location: new Orion.Attribute('43.46156,-3.81006', 'geo:point'),
    cityBrokers: {
      ParkingLot: {
        url: 'http://130.206.83.68:1026/v1',
        entity: 'ParkingLot',
        pattern: 'santander.*',
        type: 'orion'
      },
      StreetParking: {
        url: 'http://130.206.83.68:1026/v1',
        entity: 'StreetParking',
        pattern: 'santander.*',
        type: 'orion'
      }
    }
  };

  OrionClient.updateContext(contextDataSantander).then(function() {
    console.log('Context Properly updated (Santander)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}

function updateContextMadrid() {
  var contextDataMadrid = {
    type: 'CityBrokerFHA',
    id: 'rtcbmadrid',
    location: new Orion.Attribute('40.42028,-3.70578', 'geo:point'),
    cityBrokers: {
      AmbientObserved: {
        url: 'http://130.206.83.68:1029/v1',
        entity: 'AmbientObserved',
        pattern: 'Madrid.*',
        type: 'orion'
      }
    }
  };

  OrionClient.updateContext(contextDataMadrid).then(function() {
    console.log('Context Properly updated (Madrid)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}
