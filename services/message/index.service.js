"use strict";

module.exports = {
    name: 'message',
    dependencies: ['email', 'sms'],
    middlewares: [],
    actions: {
        send: {
            params: {
                // message transport (email/sms/call)
                // message data
                // message template
                // message recipient
            },
            handler(ctx) {

            }
        }
    }
}