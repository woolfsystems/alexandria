import React from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

// sub-views
import RootView  from '~/view/page/root.jsx'
import JobsView from '~/view/page/jobs.jsx'
import CollectionsView from '~/view/page/collections.jsx'
import ExportView from '~/view/page/export.jsx'
import DebugView from '~/view/page/debug.jsx'
import SettingsView from '~/view/page/settings.jsx'

const SITE_TITLE = 'alexandria'
const SITE_URL = ':4000'

const routes = [
    ['overview', {pathname: '/'}, RootView],
    ['scan', {pathname: '/jobs', state: {login: true}}, JobsView],
    ['process', '/collections', CollectionsView],
    ['export', '/export', ExportView],
    ['diagnostic', '/debug', DebugView],
    ['settings', {
        key: 'login',
        state: {
            modal: {
                show: true,
                view:'login'
            }
        }
    }, SettingsView]
]

class Router extends React.Component{
    static defaultProps = {
        url: '/',
        state: {},
        title: '',
        view: undefined
	}
	static propTypes = {
        url: PropTypes.string,
        state: PropTypes.object,
        title: PropTypes.string,
        view: PropTypes.elementType
    }

    constructor(props) {
        super(props)
        this.state = {
            ...props
        }
    }
    static getDerivedStateFromProps(props, state) {
        let {url} = props
        let [title,_url,view] = routes.find(([,_url]) =>
                url === (_url.pathname || _url)) || ['','/', RootView]
        return {
                url: _url||url,
                view,
                title
            }
    }
    render(){
        let TempView = this.state.view
        return (
        <React.Fragment>
            <Helmet titleTemplate={`${SITE_TITLE} - %s`} defaultTitle={SITE_TITLE}>
                <title>{this.state.title}</title>
                <meta charSet="utf-8" />

                <base target="_blank" href={`${SITE_URL}/`} />
                <link rel="canonical" href={`${SITE_URL}${this.state.url}`} />

                <meta name="description" content="beautifully simple book scanning" />
            </Helmet>
            <TempView key={this.state.url} />
        </React.Fragment>)
    }
}

export {
    Router,
    routes
}
