const roles = require('@model/role')

class User {
	id = undefined
	data = { }
	type = undefined

	constructor({id, type, data}){
        if(!Object.values(roles).includes(type))
            throw new Error('Invalid user role')
		this.id = id
		this.type = type

		this.data = data
	}
}

module.exports = {
    User
}
