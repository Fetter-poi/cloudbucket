'use strict';

var express = require('express');
var logger = require('morgan');
var dbSetup = require('./lib/db-setup');
var seed = require('./lib/seed');
var app = express();
dbSetup.init();
seed.init();


app.use(require('./lib/middlewares/session-setup'));
app.use(require('./lib/middlewares/basic-auth'));
app.use(express.static(__dirname + '/public'));
if (process.env['NODE_ENV'] === 'production') {
  app.use(logger('combined'));
} else {
  app.use(logger('dev'));

}
app.use('/v1', require('./lib/v1'));

app.use(require('./lib/middlewares/not-found.js'));
app.use(require('./lib/middlewares/error-handler.js'));

var port = process.env.PORT || 5000;
app.set('port', port);

app.listen(port, function () {
  console.log('Node app is running on port', port);
});
