const path = require('path')
const dotenv = require('dotenv')
const { ServiceSchemaError } = require('moleculer').Errors

module.exports = {
    created() {
        let {parsed, error} = dotenv.config({ path: path.join(`./${process.env.SERVICE_DIR}`, this.name, '.env') })

        if(error){
            throw new ServiceSchemaError('failed to load configuration .env file', error)
        }
        this.env = {
            ...process.env,
            ...parsed
        }
        this.broker.logger.info(this.name, 'Local environment settings loaded')
        if(typeof this.config !== 'undefined')
            this.config()
    }
}