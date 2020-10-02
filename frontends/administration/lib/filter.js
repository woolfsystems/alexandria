import crossfilter from 'crossfilter2'

export default class CallStore {
    constructor(_data = []){
        this.data = crossfilter(_data)
        this.unique = this.data.dimension(d =>
            d.requestID)
    }
    get(_id){
        this.unique.filter(_id)
        let [selectedEntry] = this.unique.top(1) || [undefined]
    return selectedEntry
    }
    addCall(_id, _call){
        let selectedEntry = this.get(_id)
        let updating = true

        if(typeof selectedEntry === 'undefined'){
            selectedEntry = {
                requestID: _id,
                startTime: _call.startTime,
                endTime: _call.endTime,
                levels: Math.max(1,_call.level),
                tags: [_call.action.name],
                log: [_call],
                calls: [],
                complete: false,
                duration: Infinity
            }
            updating = false
        }else{
            selectedEntry.log.push(_call)
            if(!selectedEntry.tags.includes(_call.action.name))
                selectedEntry.tags.push(_call.action.name)
            selectedEntry.levels = Math.max(selectedEntry.levels,_call.level)
        }
        selectedEntry = selectedEntry.log.reduce((_se, _l) => {
            let _endTime = typeof _l.endTime!=='undefined' && !isNaN(_l.endTime)
                ? _l.endTime
                : undefined
            let _complete = !!(typeof _endTime !== 'undefined')
            let _startTime = _l.startTime
            let _id = _l.id
            let _level = _l.level
            let _service = _l.service.name
            let _action = _l.action.name.replace(RegExp(`^${_service}\.`),'')
            
            let fi = _se.calls.findIndex(_c =>
                _c.id === _id)
            if(fi !== -1){
                _se.calls[fi].startTime = _startTime
                _se.calls[fi].endTime = _endTime
                _se.calls[fi].complete = _complete
            }else{
                _se.calls.push({
                    id: _id,
                    endTime: _endTime,
                    startTime: _startTime,
                    action: _action,
                    service: _service,
                    complete: _complete,
                    level: _level
                })
            }

            if(_complete){
                _se.endTime = _se.endTime > _endTime
                    ? _se.endTime
                    : _endTime
                if(_level === 1){
                    _se.duration = _se.endTime - _se.startTime
                    _se.complete = true
                }
            }
            // console.log('SE',_se.requestID,_se.complete)
            // _se.calls.forEach(_c =>
            //     console.log('C',_c))
            return _se
        },selectedEntry)
        if(updating)
            this.edit(_id, selectedEntry)
        else
            this.add([selectedEntry])
    }
    add(){
        return this.data.add(...arguments)
    }
    remove(){
        return this.data.remove(...arguments)
    }
    edit(_id, changes){
        let selectedEntry = this.get(_id)
        if(typeof selectedEntry === 'undefined')
            throw "Invalid ID"
        this.remove(d =>
            d.requestID === _id)
        this.add([{
            ...selectedEntry,
            ...changes
        }])
        this.unique.filter(null)
    }
}