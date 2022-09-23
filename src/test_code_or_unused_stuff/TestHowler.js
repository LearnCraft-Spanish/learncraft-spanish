import React, {useState} from 'react'
import './SRSBuilder.css'
import ReactHowler from 'react-howler'

// https://mom-academic.s3.us-east-2.amazonaws.com/Monthly-Audio-Quizzes/Volume-2/2021+-+06+-+V2+-+AQ+-+EN+-+LAES.mp3

export default function TestHowler() {
  const [playing, setPlaying] = useState(false)


  return (
    <div>
        <div>TestHowler</div>
        <ReactHowler
          src={'https://mom-academic.s3.us-east-2.amazonaws.com/Monthly-Audio-Quizzes/Volume-2/2021+-+06+-+V2+-+AQ+-+EN+-+LAES.mp3'}
          playing={playing}
        />
        <button onClick={()=>setPlaying(true)}>Play</button>
        <button onClick={()=>setPlaying(false)}>Pause</button>
    </div>
  )
}
