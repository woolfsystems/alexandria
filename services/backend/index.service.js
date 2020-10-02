const EnvLoader = require('@lib/mixins/env.mixin')

module.exports = {
    name: 'backend',
    dependencies: ['http'],
    mixins: [EnvLoader],
	actions: {
		postcodeLookup: {
			cache: {
				keys: [
					'postcode',
					'token'
				]
			},
			params: {
				postcode: { type: 'string', min: 3, max: 9, trim: true, convert: true },
				token: { type: 'string', min: 8, max: 1024, trim: true, convert: true }
			},
			async handler(ctx) {
                ctx.broker.logger.info('meta', ctx.meta,ctx.requestID)
                ctx.broker.logger.info('api', `${this.env.API_BACKEND_HOST}/${this.env.API_BACKEND_SERVICE_POSTCODE}/${ctx.params.postcode}`)
				return await ctx
					.call('http.get', {
                        url: 'http://google.com/',
                        opt: { responseType: 'text' }
                        //url: `${this.config.API_BACKEND_HOST}/${this.config.API_BACKEND_SERVICE_POSTCODE}/${ctx.params.postcode}`
					}).then(response => {
						ctx.broker.logger.info(response)
						return response
					}).catch(error => {
						ctx.broker.logger.error(error)
						return error
					})
			}
        },
        login: {
			params: {
				user: { type: 'string', min: 4, max: 128, trim: true, convert: true },
				pass: { type: 'string', min: 4, max: 32, trim: true, convert: true }
			},
			async handler(ctx) {
				return await ctx
					.call('http.post', {
                        url: 'http://google.com/',
                        //url: `${this.config.API_BACKEND_HOST}/${this.config.API_BACKEND_SERVICE_LOGIN}`
					}).then(response => {
						ctx.broker.logger.info(response.data)
						return response.data
					}).catch(error => {
						ctx.broker.logger.error(error)
						return error
					})
			}
        }
	}
}
