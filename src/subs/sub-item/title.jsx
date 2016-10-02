import React from 'react'
import { Link } from 'react-router'

const Title = ({ sub }) => (
  <Link to={`/subs/${sub.get('id')}`} activeClassName='active'>
    <h3>{sub.get('title') || sub.get('author')}</h3>
  </Link>
)

export default Title
