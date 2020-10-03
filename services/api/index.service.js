const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')
const { ForbiddenError, UnAuthorizedError, NotFoundError, ERR_NO_TOKEN, ERR_INVALID_TOKEN, ERR_UNABLE_DECODE_PARAM } = require('moleculer-web/src/errors')
const ApiGateway = require('moleculer-web')
const SocketIOService = require('moleculer-io')
const EnvLoader = require('@lib/mixins/env.mixin')
const { MoleculerError, MoleculerRetryableError } = require('moleculer').Errors


const { USER_TYPE_ANON, USER_TYPE_CLIENT } = require('@model/role')
const { User } = require('@model/user')	

module.exports = {
	dependencies: ['auth'],
	mixins: [ApiGateway, SocketIOService, EnvLoader],
	settings: {

		io: {
			namespaces: {
				'/': {
					authorization: true,
					middlewares: [
						// function (ctx, next) {
						// 	let {client: { user }} = ctx
						// 	let error = user instanceof User
						// 		? null
						// 		: user

						// 	if (error) {
						// 		return next(this.Promise.reject(new ForbiddenError('AUTH_MISSING', error)))
						// 	}
						// 	ctx.meta = {
						// 		...ctx.meta,
						// 		user
						// 	}
						// 	console.log('[AUTH]','ok', user, user.type, ctx)
						// 	return next()
						// }
					],
					events: {
						'call': {
							whitelist: [
								'math.add'
							],
							callOptions: {}
						},
						'clientCall': {
							whitelist: [
								'collections.*',
								'client.*',
								'$node.*'
							],
							callOptions: {

							},
							onBeforeCall: async function(ctx, socket, action, params, callOptions) {
								ctx.meta.socketid = socket.id
								ctx.meta.user = ctx.params.socket.client.user

								if(ctx.meta.user instanceof User){
									this.logger.info('Valid user')
								}else{
									this.logger.error('Invalid user',ctx.meta)
									throw new ForbiddenError('BAD_AUTH',ctx.meta.user)
								}
							},
							onAfterCall:async function(ctx, socket, res) {
							
							}
						}
					}
				}
			}
		},
		http2: true,
		cors: {
			origin: '*',
			methods: ["GET", "OPTIONS", "POST", "PUT", "DELETE"],
			allowedHeaders: "*",
			//exposedHeaders: "*",
			credentials: true,
			maxAge: null
		},
		rateLimit: {
			window: 10 * 1000,
			limit: 10,
			headers: true
		},
		etag: true,
		path: "/api",
		routes: [
			{
				path: "/admin",
				whitelist: [
					"users.*",
					"$node.*"
				],
				cors: {
					origin: ["https://localhost:3000"],
					methods: ["GET", "OPTIONS", "POST"],
				},
				authorization: true,
				roles: ["admin"],
				aliases: {
					"POST users": "users.create",
					"health": "$node.health"
				},
				bodyParsers: {
					json: true
				},
				onBeforeCall(ctx, route, req, res) {
					this.logger.info("onBeforeCall in protected route")
					ctx.meta.authToken = req.headers["authorization"]
				},
				onAfterCall(ctx, route, req, res, data) {
					this.logger.info("onAfterCall in protected route")
					res.setHeader("X-Custom-Header", "Authorized path")
					return data
				},
				onError(req, res, err) {
					res.setHeader("Content-Type", "text/plain")
					res.writeHead(err.code || 500)
					res.end("Route error: " + err.message)
				}
			},

			{
				path: "/upload",
				authorization: false,
				bodyParsers: {
					json: false,
					urlencoded: false
				},
				aliases: {
					"GET /": "file.get",
					"FILE /": "file.save"
				},
				busboyConfig: {
					limits: {
						files: 1
					}
				},
				callOptions: {
					meta: {
					}
				},
				onAfterCall(ctx, route, req, res, data) {
					this.logger.info("async onAfterCall in upload route")
					return new this.Promise(resolve => {
						res.setHeader("X-Response-Type", typeof(data))
						resolve(data)
					})
				},
				mappingPolicy: "restrict"
			},
			{
				path: "/",
				use: [
				],
				etag: true,
				whitelist: [
					"auth.*",
					"file.*",
					"test.*",
					"collections.*",
				],
				authorization: false,
				camelCaseNames: true,
				aliases: {
					"login": "auth.login",
				},
				bodyParsers: {
					json: true,
					urlencoded: { extended: true }
				},
				callOptions: {
					timeout: 3000,
					//fallbackResponse: "Fallback response via callOptions"
				},
				onBeforeCall(ctx, route, req, res) {
					return new this.Promise(resolve => {
						this.logger.info("async onBeforeCall in public. Action:", ctx.action.name)
						ctx.meta.userAgent = req.headers["user-agent"]
						//ctx.meta.headers = req.headers
						resolve()
					});
				},
				onAfterCall(ctx, route, req, res, data) {
					this.logger.info("async onAfterCall in public")
					return new this.Promise(resolve => {
						res.setHeader("X-Response-Type", typeof(data))
						resolve(data)
					});
				},
			}
		],

		assets: {
			//folder: ,
			options: {
			}
		},
		onError(req, res, err) {
			res.writeHead(err.code || 500)
			return res.end(this.settings.cache.error[err.code]
				|| this.settings.cache.error.default)
		},

		log4XXResponses: true,
	},
	events: {
		"node.broken"(node) {
			this.logger.warn(`The ${node.id} node is disconnected!`)
		},
		"**"(payload, sender, event) {
			if (this.io)
				this.io.emit("metric", {
					sender,
					event,
					payload
				})
		},
		"metrics.trace.span.*"(payload, sender, event) {
			if (this.io)
				this.io.emit("event", {
					sender,
					event,
					payload
				})
		}
	},
	methods: {
		/**
		 * Finalise config for service
		 */
		config(){
			this.settings.port = this.env.PORT || 9000
			this.settings.ip = this.env.HOST || '127.0.0.1'
			this.settings.assets.folder = path.resolve(this.env.npm_package_alias_build, this.env.ADMIN_FRONTEND)
			this.settings.routes.map(_route =>
				_route.cors && _route.cors.origin.push(`${process.env.HTTP_SERVER_HOST}:${process.env.HTTP_SERVER_PORT}`))
			this.settings.cache = {
				index: fs.readFileSync(path.resolve(this.settings.assets.folder, 'index.html')),
				error: {
					404: fs.readFileSync(path.resolve(this.settings.assets.folder, 'error.html')),
					default: fs.readFileSync(path.resolve(this.settings.assets.folder, 'error.html'))
				}
			}
			this.broker.logger.info(this.name, 'Applied configuration')
		},
		send404(req, res) {
			if (req.$next)
				return req.$next()

			res.setHeader('Content-Type', 'text/html; charset=UTF-8')
			if (req.url.indexOf('.') === -1) {
				this.logger.info("Redirect to '/index.html'", req.url)
				return res.end(this.settings.cache.index)
				//return this.broker.call('api.rest',res,{url:'/',...req})
			}
			this.sendError(req, res, new NotFoundError())
		},
		/**
		 * Authorize the socket
		 *
		 * @param {SocketIO} socket
		 * @param {Service} eventHandler
		 * @returns {Promise}
		 */
		socketAuthorize(socket, eventHandler){
			let accessToken = socket.handshake.query.token
			if (accessToken) {
				try{
					return this.broker.call('auth.resolveToken', { accessToken }).then(user => {
						return new User({
							id: user.id,
							type: USER_TYPE_CLIENT,
							data: {
								email: user.email,
								token: accessToken
							}
						})
					}).catch(err => {
						if (err instanceof MoleculerError)
							throw err
						return new UnAuthorizedError(ERR_INVALID_TOKEN)
					})
				} catch(e) {
					return this.Promise.reject(e)
				}
			} else {
				return this.Promise.resolve(new User({
					id: undefined,
					type: USER_TYPE_ANON
				}))
			}
		},

		/**
		 * Authorize the request
		 *
		 * @param {Context} ctx
		 * @param {Object} route
		 * @param {IncomingRequest} req
		 * @returns {Promise}
		 */
		authorize(ctx, route, req) {
			/*let authValue = req.headers["authorization"];
			if (authValue && authValue.startsWith("Bearer ")) {
				let token = authValue.slice(7);

				// Verify JWT token
				return ctx.call("auth.verifyToken", { token })
					.then(decoded => {
						//console.log("decoded data", decoded);

						// Check the user role
						if (route.opts.roles.indexOf(decoded.role) === -1)
							return this.Promise.reject(new ForbiddenError());

						// If authorization was success, we set the user entity to ctx.meta
						return ctx.call("auth.getUserByID", { id: decoded.id }).then(user => {
							ctx.meta.user = user;
							this.logger.info("Logged in user", user);
						});
					})

					.catch(err => {
						if (err instanceof MoleculerError)
							return this.Promise.reject(err);

						return this.Promise.reject(new UnAuthorizedError(ERR_INVALID_TOKEN));
					});

			} else
				return this.Promise.reject(new UnAuthorizedError(ERR_NO_TOKEN));

				*/
			let token
			if (req.headers.authorization) {
				let type = req.headers.authorization.split(" ")[0]
				if (type === "Token") {
					token = req.headers.authorization.split(" ")[1]
				}
			}
			if (!token) {
				return Promise.reject(new UnAuthorizedError(ERR_NO_TOKEN))
			}
			// Verify JWT token
			return ctx.call("auth.resolveToken", { token })
				.catch(user => {
					return Promise.reject(new UnAuthorizedError(ERR_NO_TOKEN))
				})
		}
	}
}
