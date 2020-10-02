import React from 'react'
import Gantt from '~/view/component/gantt.jsx'

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
        <section>
            <legend>jobs</legend>
        </section>)
    }
}