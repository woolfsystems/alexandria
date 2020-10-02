class Scan {
    job_id = undefined
    id = undefined
    
    index = undefined
    raw = undefined

	constructor({job_id, id, index}){
        this.job_id = job_id
        this.id = id
        this.index = index
	}
}

module.exports = {
    Scan
}
