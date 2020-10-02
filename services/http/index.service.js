const HTTPClientService = require('moleculer-http-client')

module.exports = {
    name: 'http',
    mixins: [HTTPClientService],
    settings: {
        httpClient: {
            logging: true,
            responseFormatter: 'body',
            defaultOptions: {

            }
        }
    },
}