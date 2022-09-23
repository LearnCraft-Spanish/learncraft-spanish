import React, {useState} from 'react'
import SwipeableViews from 'react-swipeable-views/lib/SwipeableViews'
import { virtualize, bindKeyboard } from 'react-swipeable-views-utils'
import { mod } from 'react-swipeable-views-core'

const VirtualizeSwipeableViews = bindKeyboard(virtualize(SwipeableViews))

const styles = {
    slide: {
        padding: 15,
        minHeight: 100,
        color: '#fff',
    },
    slide1: {
        backgroundColor: '#f00'
    },
    slide2: {
        backgroundColor: '#0a0'
    }
}

function slideRenderer(params) {
    const { index, key } = params
    let style

    switch(mod(index, 2)) {
        case 0:
            style = styles.slide1
            break
        case 1:
            style = styles.slide2
            break
        default:
            break
    }

    return(
        <div style={Object.assign({}, styles.slide, style)} key={key}>
            index is {index}. key is {key}.    
        </div>
    )
}

export default function TestVirtualize() {
    const [index, setIndex] = useState(0)

  return (
    <div>
        <VirtualizeSwipeableViews enableMouseEvents index={index} onChangeIndex={()=>setIndex(index)} slideRenderer={slideRenderer} />
        <button onClick={()=>setIndex(10)}>10</button>
        <div>{index}</div>
    </div>
  )
}
