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
}, err => {
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

            money.insertOne(request.payload)
                .catch(err => {
                        cosnsole.log(err);
                    }
                );

            reply('OK');
        },
        config: {
            validate: {
                payload: {
                    long: Joi.number().required(),
                    lat: Joi.number().required()
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

            money.find().toArray().then(docs => reply(docs)).catch(err => {
                console.log(err);
                reply([{
                    _id: '56a8ede8df77a3163f01283f',
                    long: 9.1697447,
                    lat: 47.6690469
                }]);
            })
        }
    });


    server.start(err => {
        if (err) {
            throw err;
        }
        console.log('Server running at:', server.info.uri);
    });


});
