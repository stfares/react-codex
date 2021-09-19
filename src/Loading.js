import React from 'react'
import {ReactComponent as LoadingLogo} from './loading.svg';

export const Loading = (props) => {
    return <div className='loading-wrapper' style={props.style}>
        <LoadingLogo />
    </div>
}