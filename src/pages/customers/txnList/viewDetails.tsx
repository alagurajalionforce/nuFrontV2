import React from 'react'
import { Link } from 'react-router-dom'
const viewDetails = () => {
  return (
    <div>
      <Link to={'/customers/transactions'}>Back</Link>
    </div>
  )
}

export default viewDetails
