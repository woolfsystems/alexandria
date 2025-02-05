import React from 'react'
import { createEditor } from '~/view/component/rete'

export default class extends React.Component{
    static defaultProps = {
    }
    constructor(props) {
      super(props)
      this.state = {
          ...props
      }
    }
    static getDerivedStateFromProps(props, state){
        return Object.assign(
            state,
            props
        )
    }
    render(){
        return (
        <React.Fragment>
            <section style={{marginBottom: '0.5em'}}>
                <legend>camera</legend>
                <div
                    style={{ width: "90vw", height: "60vh" }}
                    ref={ref => ref && createEditor(ref)}
                />
            </section>
        </React.Fragment>)
    }
}