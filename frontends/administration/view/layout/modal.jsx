import React from 'react'
import PropTypes from 'prop-types'

import '~/assets/style/layout/modal.scss'
import modals from "../component/modal/*.jsx"

export default class extends React.Component {
    static defaultProps = {
        stream: null,
        location: {}
    }
    static propTypes = {
        stream: PropTypes.any,
        location: PropTypes.object
    }
    static storyProps = [
        'visible'
    ]

    constructor(props) {
        super(props)
        this.state = {
            visible: false
        }
    }
    static getDerivedStateFromProps(props, state){
        if(props.location.state && typeof props.location.state.modal!=='undefined' && props.location.state.modal.show)
            return {
                visible: true,
                component: modals[props.location.state.modal.view].default,
                channel: new BroadcastChannel(props.location.state.channel)
            }
        return {
            visible: false
        }
    }
    render(){
        let ModalPromise = this.state.visible
            ? this.state.component
            : ()=>(<div></div>)
        return (
        <view-layer id="modal" {...(this.state.visible && {class: 'visible'})}>
            <ModalPromise channel={this.state.channel} />
        </view-layer>)
    }
}