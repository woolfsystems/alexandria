import { Promise } from 'bluebird'
import 'svgxuse/svgxuse.js'
import React from 'react'
import ReactDOM from 'react-dom'
import Core from '~/src/core.jsx'
import { throttle } from 'throttle-debounce'

const textMetrics = require('text-metrics')

global.Promise=Promise

ReactDOM.render(
    <Core />,
    document.querySelector('body > main')
)
document.addEventListener('DOMContentLoaded',() => {
//    document.body.classList.add('loaded')
    console.log('[dom]','loaded')
})
document.fonts.ready.then(() => {
    try{
        const sizeFonts = () => {
            document.querySelectorAll('.textmetric--fit').forEach(_x =>
                _x.style.fontSize = textMetrics.init(_x).maxFontSize())
        }
        sizeFonts()
        window.addEventListener('resize',throttle(100,sizeFonts,true))
    }catch(_e){
        console.log('[text-metrics]', _e)
    }
    document.body.removeAttribute('loading')
    console.log('[fonts]','loaded')
})