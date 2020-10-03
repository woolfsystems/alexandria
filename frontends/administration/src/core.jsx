import React from 'react'
import PropTypes from 'prop-types'

import { Route, Router, BrowserRouter } from 'react-router-dom'

import { createBrowserHistory } from 'history'

import 'setimmediate'

import '~/view/element/layer.js'
import '~/view/element/input.js'
import '~/assets/style/core.scss'

import io from 'socket.io-client'
import Tone from 'tone'
import SocketIOFileClient from 'socket.io-file-client'

import CallStore from '~/lib/filter'

import CoreView from '~/view/layout/content.jsx'
import ModalView from '~/view/layout/modal.jsx'

import { AuthenticationRejected } from '../lib/errors'
 

let loop = 1

const init = {
    url: '/',
    store: new CallStore()
}

const login = (_pcall, _socket, _attempt_login) =>
    (_err) =>
        new Promise((resolve, reject) =>
            _attempt_login(_socket)
                .then(authWrapper(_pcall, _socket, _attempt_login))
                .catch(reject))

const authWrapper = (_pcall, _socket, _attempt_login) =>
    (_meta = {}) =>
        new Promise((resolve, reject) =>
            _pcall(_socket)
                .catch(login(_pcall, _socket, _attempt_login)))

const socketCall = (_call, _meta) =>
    (_socket) =>
        new Promise((resolve, reject) =>
            _socket.emit('clientCall', _call, _meta, (_e, _r) => _e
                ? reject(_e)
                : resolve(_r)))

let synth
if(window.sounds){
    synth = new Tone.Synth({
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

export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            history: createBrowserHistory(),
            modal: {
                promise: { resolve:null, reject:null },
                show: false,
                component: undefined
            }
        }
    }
    call(_call, _meta) {
        return authWrapper(socketCall(_call, _meta), this.socket, this.attemptLogin.bind(this))
    }
    connectIO() {
        try{
            this.socket = io('localhost:4000', {
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
    setupIO() {
        this.socket.on('connect', () => {
            console.log('[WS]', 'connected')
            try{
                this.call('collections.create', { meta: {author: 'dave', title: 'life'} })().then(_r => {
                    console.log('=>','[call]', _r)
                }).catch(_e => {
                    console.error('=>','[call]', _e)
                })
                this.call('collections.find')().then(_dc=>console.log('DC',_dc))

            }catch(_e){
                console.log('[CALL]',_e)
            }
    
        })
    }
    showLogin() {
        console.info('[MODAL]','show')
        return new Promise((resolve, reject) => {
            let _cid = 'ch_'+(loop++)
            let _c = new BroadcastChannel(_cid)
            _c.onmessage = function ({data}) {
                let [_status, _data] = JSON.parse(data)
                _c.close()
                if(_status === 'resolve')
                    resolve(_data)
                else{
                    reject(new AuthenticationRejected('User chose not to login'))
                }
                    
            }
            this.state.history.push({
                state: {
                    modal: {
                        show: true,
                        view: 'login'
                    },
                    channel: _cid
                }
            })
        })
    }
    hideLogin() {
        console.info('[MODAL]','hide')
        this.state.history.replace(Object.assign({},
            this.state.history.location,
            {
                state: {
                    modal: { show: false }
                }
            }))
    return true
    }
    attemptLogin() {
        return new Promise((resolve, reject) =>
            this.showLogin()
                .then(_v => {
                    this.hideLogin()
                    resolve(_v)
                })
                .catch(_e => {
                    this.hideLogin()
                    reject(_e)
                }))
    }
    componentDidMount() {
        this.connectIO()
        this.setupIO()
    }
    render(){
        return (<>
            <Router history={this.state.history}>
                <Route component={ModalView} />
                <CoreView />
            </Router>
        </>)
    }
}