import React from 'react'
import PropTypes from 'prop-types'
import Hammer from 'react-hammerjs'

import Regl from './regl.jsx'

class Gantt extends Regl {
    static defaultProps = {
        data: [],
        ratio: 2
	}
	
	static propTypes = {
        data: PropTypes.array,
        ratio: PropTypes.number
    }

    constructor(props){
        super(props)
    }

    handleSwipe(e){
        console.log('swipe!',e.direction === 2?'left':'right')
    }

    render(){
        return (<Hammer onSwipe={this.handleSwipe}>
        <article className={"popout"}>
                <canvas ref={this.el} style={{opacity: 0}}></canvas>
        </article></Hammer>)
    }
}

export default Gantt