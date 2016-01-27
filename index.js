'use strict';

const Joi = require('joi');


const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({port: 9733});


var dbOpts = {
    "url": "mongodb://localhost:27017/moneyboy",
    "settings": {
        "db": {
            "native_parser": false
        }
    }
};

server.register({
    register: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }


    server.route({
        method: 'POST',
        path: '/money/location',
        handler: (request, reply) => {

            var db = request.server.plugins['hapi-mongodb'].db;
            var money = db.collection('money');

            money.insertOne(request.payload);

            reply('OK');
        },
        config: {
            validate: {
                payload: {
                    long: Joi.string().required(),
                    lat: Joi.string().required()
                }
            }
        }
    });

    server.route({
        method: 'GET',
        path: '/money/location',
        handler: (request, reply) => {
            var db = request.server.plugins['hapi-mongodb'].db;
            var money = db.collection('money');

            money.find().toArray().then(docs => reply(docs)).catch(reply('sorry'));
        }
    });


    server.start(err => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });

});
