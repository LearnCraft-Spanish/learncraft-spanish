import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import MenuButton from './components/MenuButton'

function CallbackPage() {
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const stateSent = searchParams.get('state')
  const destinationUrl = useRef('/')

  const storedJson = localStorage.getItem(stateSent)
  const decodedJson = JSON.parse(storedJson) || {
    navigateToUrl: '/',
    expiresAt: 0,
  }
  if (decodedJson.expiresAt > Date.now()) {
    destinationUrl.current = decodedJson.navigateToUrl
  }

  useEffect(() => {
    navigate(destinationUrl.current)
  }, [])

  return (
    <div className="redirectMessage">
      <MenuButton />
    </div>
  )
}

export default CallbackPage
