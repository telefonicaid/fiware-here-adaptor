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
  cities = ['madrid', 'oporto', 'guadalajara', 'aveiro', 'amsterdam', 'santander', 'sevilla', 'antwerp'];
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
    case 'sevilla':
      updateContextSevilla();
      break;
    case 'antwerp':
      updateContextAntwerp();
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
function updateContextAntwerp() {
  var contextDataAmtwerp = {
    type: 'CityBrokerFHA',
    id: 'rtcbantwerp',
    location: new Orion.Attribute('51.2221, 4.39768', 'geo:point'),
    cityBrokers: {
      StreetParking: {
        url: 'http://asign-demo02.romcloud.be:1026/v1',
        entity: 'StreetParking',
        type: 'orion'
      }
    }
  };

  OrionClient.updateContext(contextDataAmtwerp).then(function() {
    console.log('Context Properly updated (Antwerp)');
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
      },
      GasStation: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/pois',
        poisCat: '417',
        type: 'ngsi10',
        key: 'hackacityporto2015_server',
        payment: true
      },
      Garage: {
        url: 'https://api.ost.pt/ngsi10/contextEntityTypes/pois',
        poisCat: '9',
        type: 'ngsi10',
        key: 'hackacityporto2015_server',
        payment: true
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
      StreetParking: {
        url: 'http://130.206.83.68:1026/v1',
        entity: 'StreetParking',
        pattern: 'santander.*',
        type: 'orion'
      },
      ParkingLot: {
        url:     'http://mu.tlmat.unican.es:8099/v1',
        pattern: 'urn:x-iot:smartsantander:parking:indoor.*',
        type:    'orion',
        entity:  'ParkingLot',
        service: 'smartsantander',
        servicePath: '/parking/#'
      },
      AmbientObserved: {
        url:     'http://mu.tlmat.unican.es:8099/v1',
        type:    'orion',
        entity:  'AmbientObserved',
        pattern: 'urn:x-iot:smartsantander:environmental:mobile.*',
        service: 'smartsantander'
      },
      AmbientArea: {
        url: 'http://mu.tlmat.unican.es:8099/v1',
        entity: 'AmbientArea',
        type: 'orion',
        service: 'smartsantander'
      },
      WeatherForecast: {
        url:    'http://130.206.83.68:1028/v2/entities',
        q: {
          postalCode: '39001',
          country: 'ES'
        },
        entity: 'WeatherForecast',
        type:   'ngsiv2'
      }
    }
  };

  OrionClient.updateContext(contextDataSantander).then(function() {
    console.log('Context Properly updated (Santander)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}


function updateContextSevilla() {
  var contextData = {
    type: 'CityBrokerFHA',
    id: 'rtcbsevilla',
    location: new Orion.Attribute('37.3879, -6.00198', 'geo:point'),
    cityBrokers: {
      ParkingLot: {
        url:     'http://130.206.122.29:1026/v1',
        type:    'orion',
        entity:  'ParkingLotZone'
      },
      WeatherForecast: {
        url:    'http://130.206.83.68:1028/v2/entities',
        q: {
          postalCode: '41001',
          country: 'ES'
        },
        entity: 'WeatherForecast',
        type:   'ngsiv2'
      }
    }
  };

  OrionClient.updateContext(contextData).then(function() {
    console.log('Context Properly updated (Sevilla)');
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
      },
      WeatherForecast: {
        url:    'http://130.206.83.68:1028/v2/entities',
        q: {
          postalCode: '28001',
          country: 'ES'
        },
        entity: 'WeatherForecast',
        type:   'ngsiv2'
      }
    }
  };

  OrionClient.updateContext(contextDataMadrid).then(function() {
    console.log('Context Properly updated (Madrid)');
  }, function(error) {
    console.log('Error while updating context: ', error);
  });
}
