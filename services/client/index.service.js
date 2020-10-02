const fs = require('fs')
const { promisify } = require('util')
const writeFileAsync = promisify(fs.writeFile)

module.exports = {
	name: 'client',
	dependencies: ['backend','pdf'],
	actions: {
		generateContract(ctx) {
			ctx.broker.logger.info('meta',ctx.meta,ctx.requestID)

            return ctx
                .call('pdf.transform', { html: '<h1>Contract</h1>' })
                .then(buff => {
                    //const filePath = path.join(this.uploadDir, ctx.params.file)
                    const filePath = './contract.pdf'
                                    return fs.createReadStream(`/tmp/${ctx.params.filename}`);
                    return writeFileAsync(filePath, buff).then(_r => {
                        if (!fs.existsSync(filePath))
                            return new NotFoundError()
                        ctx.meta.$responseType = 'application/pdf'// mime.lookup(ctx.params.file)
                        
                        return fs.createReadStream(filePath)
                    })
                    .catch(error => {
                        ctx.broker.logger.error(error)
					    throw error
                    })
                })
                .catch(error => {
					ctx.broker.logger.error(error)
					throw error
				})
		}
	}
}
