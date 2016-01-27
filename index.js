'use strict';

const Joi = require('joi');
const HapiSwagger = require('hapi-swagger');
const Inert = require('inert');
const Vision = require('vision');

const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({port: 9733});

const options = {
    info: {
        'title': 'Test API Documentation',
    }
};


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

    server.register([
        Inert,
        Vision,
        {
            'register': HapiSwagger,
            'options': options
        }], (err) => {

        if (err) {
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

});
