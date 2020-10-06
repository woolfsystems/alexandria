import React from 'react'

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
            </section>
        </React.Fragment>)
    }
}