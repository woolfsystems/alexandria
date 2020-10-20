import io from 'socket.io-client'
import Tone from 'tone'
import SocketIOFileClient from 'socket.io-file-client'
import CallStore from '~/lib/filter'

const init = {
    url: '/',
    store: new CallStore()
}

export default class Pipe {
    constructor(_host, _attempt_login){
        this.host = _host
        this.connect()
        this.attemptLogin = _attempt_login
        this.synth = undefined
        if(window.sounds){
            this.synth = new Tone.Synth({
                oscillator : {
                    type : "pwm",
                    modulationFrequency : 0.2
                },
                envelope : {
                    attack : 0.02,
                    decay : 0.2,
                    sustain : 0.3,
                    //release : 0.9,
                }
            }).toMaster();
        }
    }
    on(_evt, _listener){
        this.socket.on(_evt,_listener)
        return this
    }
    connect() {
        try{
            this.socket = io(this.host, {
                reconnection: true,
            })
            
            // const uploader = SocketIOFileClient(socket)
        
            // const bindSubmitToUpload = function(_form, _ul_elem, next) {
            //     _form.addEventHandler('onsubmit', _ev => {
            //         _ev.preventDefault()
            //         next(uploader.upload(_ul_elem))
            //     })
            // }
            this.socket.on('event', (_evt) => {
                if(/metrics\.trace\.span\.(start|finish)/.test(_evt.event)){
                    let [,dir] = /metrics\.trace\.span\.(start|finish)/.exec(_evt.event)
                    init.store.addCall(_evt.payload.requestID, _evt.payload)
                    console.log(init.store.unique.top(Infinity))
                    if(dir === 'start'){
                        if(window.sounds){
                            synth.triggerAttackRelease("C4",'2n')
                        }
                        return
                    }
                    if(window.sounds){
                        synth.triggerAttackRelease("G4",'2n')
                    }
                    console.info('[WS]', 'CALL', dir, _evt.payload.action.name, _evt.payload.requestID)
                }else{
                    console.info('[WS]', 'OTHER', _evt)
                }
            })
            this.socket.on('metric', (_evt) => {
                console.info('[WS]', 'METRIC', _evt)
            })
            this.socket.onclose = (_evt) => {
                console.info('[WS]','CLOSE', _evt)
            }
            this.socket.on('connection_error', (_evt) => {
                console.info('[WS]','CONN_ERR', _evt)
            })
            this.socket.on('disconnect', (_evt) => {
                console.info('[WS]','DISCO', _evt)
            })
            this.socket.on('reconnect', (_evt) => {
                console.info('[WS!]','RECO', _evt)
            })
            this.socket.on('reconnect_error', (_evt) => {
                console.info('[WS!]', 'RECO_ERR', _evt)
            })
            
            this.socket.on('error', (_evt) => {
                console.error('[WS!]', _evt)
            })
        }catch(e){
            console.log('[SOCKET ERROR]',e)
        }
        
    }
    login(_pcall, _socket, _attempt_login){
        return (_err) =>
            new Promise((resolve, reject) =>
                _attempt_login(_socket)
                    .then(this.authWrapper(_pcall, _socket, _attempt_login))
                    .catch(reject))
    }
    authWrapper(_pcall, _socket, _attempt_login){
        return (_meta = {}) =>
            new Promise((resolve, reject) =>
                _pcall(_socket)
                    .then(_r=>resolve(_r))
                    .catch(this.login(_pcall, _socket, _attempt_login)))
    }
    socketCall(_call, _meta){
        return (_socket) =>
            new Promise((resolve, reject) =>
                _socket.emit('clientCall', _call, _meta, (_e, _r) => _e
                    ? reject(_e)
                    : resolve(_r)))
    }
    
    call(_call, _meta) {
        return this.authWrapper(this.socketCall(_call, _meta), this.socket, this.attemptLogin.bind(this))
    }

    getServices() {
        return new Promise((resolve,reject)=>{
            return this.call('$node.services')().then(_dc=>{                
                let _filtered_services = _dc.filter(_ns=>typeof _ns.settings.task!=='undefined' && _ns.settings.task).reduce((_l,_v)=>{
                    _l[_v.name] = {actions:[],..._v}
                    return _l
                },{})
                return this.call('$node.actions')().then(_ac=>{
                    _ac.forEach((_v)=>{
                        let [_service_name,_action_name] = _v.name.split('.')
                        if(typeof _filtered_services[_service_name]!=='undefined')
                            _filtered_services[_service_name].actions[_action_name] = _v
                    })
                    return resolve(_filtered_services)
                }).catch(reject)
            }).catch(reject)
        })
    }
}