import React, { useEffect, useState } from 'react'

export default function GlobalLoader(){
  const [count, setCount] = useState(0)

  useEffect(()=>{
    function onStart(e: Event){
      setCount(c => c + 1)
    }
    function onEnd(e: Event){
      setCount(c => Math.max(0, c - 1))
    }
    window.addEventListener('apiRequestStart', onStart as EventListener)
    window.addEventListener('apiRequestEnd', onEnd as EventListener)
    return () => {
      window.removeEventListener('apiRequestStart', onStart as EventListener)
      window.removeEventListener('apiRequestEnd', onEnd as EventListener)
    }
  },[])

  if (count <= 0) return null

  return (
    <div className="global-loader-overlay" aria-hidden={false}>
      <div className="loader" />
    </div>
  )
}
