import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

import MenuButton from './components/MenuButton'

function CallbackPage() {
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(window.location.search)
  const stateSent = searchParams.get('state') || ''
  const destinationUrl = useRef('/')

  const defaultRedirectState = JSON.stringify({
    navigateToUrl: '/',
    expiresAt: 0,
  })

  const storedJson = localStorage.getItem(stateSent) || defaultRedirectState
  const decodedJson = JSON.parse(storedJson)
  if (decodedJson.expiresAt > Date.now()) {
    destinationUrl.current = decodedJson.navigateToUrl
  }

  useEffect(() => {
    navigate(destinationUrl.current)
  }, [navigate])

  return (
    <div className="redirectMessage">
      <MenuButton />
    </div>
  )
}

export default CallbackPage
