import React from "react"
import { useSelector } from "react-redux"

function LoadingIndicator() {
  const { loadingIsOpen } = useSelector((state) => state.mapState)

  if (loadingIsOpen) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
      </div>
    )
  }
  return null
}

export default LoadingIndicator
