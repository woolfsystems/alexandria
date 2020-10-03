const EnvLoader = require('@lib/mixins/env.mixin')
const DbService = require("moleculer-db")

module.exports = {
    name: "collections",
    mixins: [DbService, EnvLoader],
    settings: {

    }
}