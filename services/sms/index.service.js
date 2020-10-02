const SmsService = require('moleculer-twilio')
const EnvLoader = require('@lib/mixins/env.mixin')

module.exports = {
    name: 'sms',
    mixins: [EnvLoader, SmsService],
    settings: {
       phoneNumber: '+441234445555'
    }
}