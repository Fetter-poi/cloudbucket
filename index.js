'use strict';

var express = require('express');
var dbSetup = require('./lib/db-setup');
var seed = require('./lib/seed');
var app = express();
dbSetup.init();
seed.init();

app.set('port', (process.env.PORT || 5000));

app.use(require('./lib/middlewares/session-setup'));
app.use(require('./lib/middlewares/basic-auth'));
app.use(express.static(__dirname + '/public'));

app.use('/v1', require('./lib/v1'));

app.listen(app.get('port'), function () {
  console.log('Node app is running on port', app.get('port'));
});
