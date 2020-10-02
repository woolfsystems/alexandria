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
                <legend>in progress</legend>
            </section>
            <section style={{marginBottom: '0.5em'}}>
                <legend>complete</legend>
            </section>
            <section>
                <legend>exported</legend>
            </section>
        </React.Fragment>)
    }
}