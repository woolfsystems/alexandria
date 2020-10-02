import React from 'react'
import { svg as quasi } from 'quasi-svg'

export default ({options}) =>
    (<div class="svg--background" dangerouslySetInnerHTML={{__html: quasi(options)}}/>)