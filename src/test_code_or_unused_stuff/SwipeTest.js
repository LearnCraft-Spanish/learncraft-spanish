import React, {useState} from 'react'
import SwipeableViews from 'react-swipeable-views'
import { useSwipeable } from 'react-swipeable';

export default function SwipeTest() {
    const [totalSwipes, setTotalSwipes] = useState(2)
    const [swipeableNum, setSwipeableNum] = useState(0)

    const numbers = [0,1,2,3,4,5,6,7,8,9]
    const styles = {
        slide: {
            padding: 15,
            minHeight: 100,
            color: '#000',
        },
        slide1: {
            background: '#FF99EE',
        },
        slide2: {
            background: '#FFEE00',
        },
    }

    function handleClick() {
        setTotalSwipes(totalSwipes+1)
    }

    function changeSwipeableNum(num, eventData) {
        setSwipeableNum(swipeableNum + num)
        console.log('swipe: ', eventData)
    }

    const handlers = useSwipeable({
        onSwipedUp: (eventData) => changeSwipeableNum(1, eventData),
        onSwipedDown: (eventData) => changeSwipeableNum(-1, eventData),
        delta: 20,
        preventDefaultTouchmoveEvent: false,
        trackTouch: false,
        trackMouse: true
    })
  return (
    <div >
        <button onClick={handleClick}>Increment total: {totalSwipes}</button>
        <div>{swipeableNum}</div>
        <SwipeableViews {...handlers} enableMouseEvents>
            {
                // numbers.map((number,id)=>
                //     {
                //         if(id < totalSwipes) {
                //             return(<div key={id} style={Object.assign({}, styles.slide, id%2===1?styles.slide1:styles.slide2)}>{number}</div>)
                //         } else {
                //             return
                //         }
                //     }
                // )
                numbers.filter((number, id) => (id < totalSwipes)).map((number, id) => {
                    return(<div key={id} style={Object.assign({}, styles.slide, id%2===1?styles.slide1:styles.slide2)}>{number}</div>)
                })
            }
            {/* <div style={Object.assign({}, styles.slide, styles.slide1)}>primero</div>
            <div style={Object.assign({}, styles.slide, styles.slide2)}>segundo</div> */}
        </SwipeableViews>
    </div>
  )
}
