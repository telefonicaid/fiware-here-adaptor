var Orion = require('fiware-orion-client');
var ORION_SERVER = 'http://mu.tlmat.unican.es:8099/v1';
var OrionClient = new Orion.Client({
  url: ORION_SERVER,
  userAgent: 'fiware-here-adapter',
  service: 'smartsantander'
});

OrionClient.queryContext({
  type: 'AmbientObserved'
}, {
    location: {
      geometry: 'Circle',
      coords: '43.4666,-3.79998',
      radius: 10000
    }
}
).then(function(data) {
    console.log(JSON.stringify(data));
});
