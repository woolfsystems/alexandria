import React from 'react'
import PropTypes from 'prop-types'

import "~/assets/style/component/modal/login.scss"

import {
    AuthenticationRejected,
    AuthenticationError,
    ApplicationError,
    ConnectionError,
    ServiceError,
    APIError,

    LOGIN_OK,
    LOGIN_FAILED,
    LOGIN_REJECTED
} from '~/lib/errors.js'

export default class extends React.Component {
    static defaultProps = {
        channel: {}
    }
    static propTypes = {
        channel: PropTypes.object
    }
    constructor(props) {
        super(props)
        this.state = {
            ...props,
            user: 'blah',
            pass: 'foop'
        }
    }

    static getDerivedStateFromProps(props, state) {
        console.log(props)
        return Object.assign(
            state,
            props
        )
    }
    message(_status, _data=null) {
        return this.props.channel.postMessage(JSON.stringify([_status, _data]))
    }

    resolve(_e) {
        this.message('resolve')
    }
    reject() {
        this.message('reject')    
    }

    render() {
        return (
        <fieldset className="modal--content types--modal--login">
            <h2 className="textmetric--fit">login</h2>
            <p className="textmetric--fit">please enter your details below</p>
            <form>
                <view-input type="email" value={this.state.user} placeholder="email/username" required />
                <view-input type="password" value={this.state.pass} placeholder="password" required />
            </form>
            <button className="resolve" onClick={this.resolve.bind(this)}>submit</button>
            <button className="reject" onClick={this.reject.bind(this)}>cancel</button>
        </fieldset>)
    }
}

