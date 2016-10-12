import { PropTypes } from 'react'

export default {
  router: PropTypes.shape({
    transitionTo: PropTypes.func.isRequired,
    replaceWith: PropTypes.func.isRequired,
  }),
}
