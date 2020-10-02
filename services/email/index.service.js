"use strict";

const MoleculerMail = require('moleculer-mail')

module.exports = {
    ...MoleculerMail,
    name: 'email',
    middlewares: [],
    settings: {
        from: "sender@moleculer.services",
        transport: {
            service: 'gmail',
            auth: {
                user: 'gmail.user@gmail.com',
                pass: 'yourpass'
            }
        }
    }
}