const fs = require("fs")
const path = require("path")
const { NotFoundError } = require("moleculer-web/src/errors")
const mkdir = require("mkdirp").sync
const mime = require("mime-types")


module.exports = {
	name: "file",
	created(){
		this.uploadDir = path.join(__dirname, "__uploads")
		mkdir(this.uploadDir)
	},
	actions: {
		get: {
			handler(ctx) {
				const filePath = path.join(this.uploadDir, ctx.params.file)
				if (!fs.existsSync(filePath))
					return new NotFoundError()

				ctx.meta.$responseType = mime.lookup(ctx.params.file)
				// Return as stream
				return fs.createReadStream(filePath)
			}
		},
		save: {
			handler(ctx) {
				return new this.Promise((resolve, reject) => {
					//reject(new Error("Disk out of space"))
					const filePath = path.join(this.uploadDir, ctx.meta.filename || this.randomName())
					const f = fs.createWriteStream(filePath)
					f.on('close', () => {
						this.logger.info(`Uploaded file stored in '${filePath}'`)
						resolve({ filePath, meta: ctx.meta })
					})
					f.on('error', err => reject(err))

					ctx.params.pipe(f)
				})
			}
		}
	},
	methods: {
		randomName() {
			return "unnamed_" + Date.now() + ".png"
		}
	}
};
