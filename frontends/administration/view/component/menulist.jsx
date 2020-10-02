import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'

export default class MenuList extends React.Component {
    static defaultProps = {
        items: []
    }
    constructor(props) {
      super(props) 
    }
    render(){
        return (<ol>{this.props.items.length && this.props.items.map(([label,url],_i) =>
            <NavLink exact key={(url.pathname || url.key || url).replace('/','_')} to={url} activeClassName="selected">{label}</NavLink>
        )}</ol>)
    }
}