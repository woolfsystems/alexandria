import React from 'react'
import PropTypes from 'prop-types'

import { Route, Router } from 'react-router-dom'

import { createBrowserHistory } from 'history'

import 'setimmediate'

import '~/view/element/layer.js'
import '~/view/element/input.js'
import '~/assets/style/core.scss'


import Pipe from '~/lib/pipe'

import CoreView from '~/view/layout/content.jsx'
import ModalView from '~/view/layout/modal.jsx'

import { AuthenticationRejected } from '../lib/errors'
 
window.sounds = 0
let loop = 1
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
    
    setupIO() {
        window.pipe = new Pipe(':4000',this.attemptLogin)
        pipe.on('connect', () => {
            console.log('[WS]', 'connected')
            try{
                pipe.call('collections.create', { meta: {author: 'dave', title: 'life'} })().then(_dc => console.log('[DC]', _dc))
                pipe.call('camera.list')().then(_dc=>console.log('[DC]',_dc))
                pipe.call('camera.capture')().then(_dc=>console.log('[DC]',_dc))
                pipe.call('camera.orientation')().then(_dc=>console.log('[DC]',_dc)).catch(console.error)
                pipe.getServices().then(_dc=>console.log('[SERVICES]',_dc)).catch(console.error)
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
        console.info('[MODAL]','showing login')
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