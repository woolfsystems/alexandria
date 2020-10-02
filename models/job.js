// {
//     "id": "number",

//     "ts_start": "timestamp",
//     "ts_end": "timestamp",
//     "state": "number",    
//     "messages": [
//         {"ts": "timestamp", "message": "string", "data": [{}]}
//     ]
// }

const states = require('@model/state')

class Job {
	id = undefined
    state = states.JOB_STATE_INITIAL
    ts_start = undefined
	ts_end = undefined
	messages = []

	constructor({id}){
		this.id = id
	}
}

module.exports = {
    Job
}
