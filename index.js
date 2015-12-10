'use strict';

// Load in config
require('dotenv').load();

// Required Libs
var Hapi = require('hapi');
var Path = require('path');
var dateFormat = require('dateformat');
var Canvas = require('canvas');
var fs = require('fs');
var request = require('request');

// format
var format = 'dd mmm HH:MM:ss';

// Instantiate the server
var server = new Hapi.Server({
  debug: {
    request: ['error', 'good'],
  },
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public'),
      },
    },
  },
});

// Set Hapi Connections
server.connection({
  host: process.env.VCAP_APP_HOST || 'localhost',
  port: process.env.VCAP_APP_PORT || process.env.PORT || 3000,
});

// Hapi Log
server.log(['error', 'database', 'read']);

// Default
server.route({
  method: 'GET',
  path: '/{url}',
  handler: function(request, reply) {
    var fpp = require('face-plus-plus');

    fpp.setApiKey(process.env.FACEKEY);
    fpp.setApiSecret(process.env.FACESECRET);

    var imageURL = request.params.url

    var parameters = {
      url: imageURL,
      attribute: 'gender,age',
    };
    fpp.get('detection/detect', parameters, function(err, faceres) {
      console.log(faceres.face[0]);
      var faceObject = faceres.face[0];


    var Image = Canvas.Image;
    var request = require('request');
    request({ url: imageURL, encoding: null }, function(error, response, body) {
      if (!error) {
        var image = new Image();

        image.onerror = function() {
            console.error(arguments);
        };

        image.onload = function() {
            var w = image.width;
            var h = image.height;
            var canvas = new Canvas(w, h);
            var ctx = canvas.getContext('2d');

            ctx.drawImage(image, 0, 0, w, h, 0, 0, w, h);

            var img = new Image;
            img.onload = function() {
              ctx.drawImage(img,
                (((image.width / 100) * faceObject.position.center.x) - (((image.width / 100) * faceObject.position.width) / 2)),
                ((image.height / 100) * faceObject.position.center.y) - (((image.height / 100) * faceObject.position.height) / 2),
                ((image.width / 100) * faceObject.position.width),
                ((image.height / 100) * faceObject.position.height));
            };

            img.src = __dirname + '/dings.jpeg';

            reply('<img src="' + canvas.toDataURL() + '" />');

          };

        image.src = new Buffer(body, 'binary');
      }
    });
  });

  },
});

// Start Hapi
server.start(function(err) {
  if (err) {
    console.log(err);
  } else {
    console.log(dateFormat(new Date(), format) + ' - Server started at: ' + server.info.uri);
  }
});
