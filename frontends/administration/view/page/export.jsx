import React from 'react'

export default class extends React.Component{
    static defaultProps = {
    }
    constructor(props) {
      super(props)
    }
    render(){
        return (
        <section>
            <legend>export</legend>
            <article className="popover"></article>
        </section>)
    }
}