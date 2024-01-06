import React from "react"
import { useSelector, useDispatch } from "react-redux"
import { triggerFetchError } from "../../actions/redirect"
import { Link } from "react-router-dom"
import logoTransparent from "../../assets/img/pp_logo_transparent.png"

const TopContainer = (props) => {
  const { isFetchError } = useSelector((state) => state.redirect)
  const dispatch = useDispatch()

  const hideError = () => {
    if (isFetchError) {
      dispatch(triggerFetchError(false))
    }
  }

  return (
    <div className="top-container">
      <div className="top-logo">
        <Link to={{ pathname: "/" }} onClick={() => hideError()}>
          <img src={logoTransparent} alt="Property Praxis logo"></img>
        </Link>
      </div>

      <div>
        <h1>{props.title}</h1>
      </div>
    </div>
  )
}

export default TopContainer
