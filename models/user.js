const roles = require('@model/role')

class User {
	

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
