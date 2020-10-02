class Page {
    collection_id = undefined
    id = undefined
    
    index = undefined
    raw = undefined

	constructor({collection_id, id, index}){
        this.collection_id = collection_id
        this.id = id
        this.index = index
	}
}

module.exports = {
    Page
}
