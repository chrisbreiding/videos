import _ from 'lodash'
import { action } from 'mobx'
import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Match } from 'react-router'

import authStore from '../login/auth-store'
import propTypes from '../lib/prop-types'
import subsStore from '../subs/subs-store'

import NowPlaying from '../now-playing/now-playing'
import Subs from '../subs/subs'
import Sub from '../sub/sub'

const NoSubSelected = () => {
  if (!subsStore.subs.length) return null

  return <p className='videos-empty'>Please select a sub</p>
}

@observer
class App extends Component {
  static contextTypes = {
    router: propTypes.router,
  }

  componentWillMount () {
    authStore.getApiKey()
    .then((apiKey) => {
      return authStore.checkApiKey(apiKey).then((isValid) => {
        return { apiKey, isValid }
      })
    })
    .then(({ apiKey, isValid }) => {
      if (isValid) {
        action('app:set:api:key', () => {
          authStore.setApiKey(apiKey)
        })()
      } else {
        this.context.router.transitionTo({ pathname: '/login' })
      }
    })
  }

  render () {
    return (
      <div className='app'>
        <NowPlaying
          id={(this.props.location.query || {}).nowPlaying}
          onClose={this._closeNowPlaying}
        />
        <div className='subs'>
          <Subs {...this.props} />
          <Match exactly pattern={this.props.pathname} component={NoSubSelected} />
          <Match pattern='/subs/:id' component={Sub} />
        </div>
      </div>
    )
  }

  _closeNowPlaying = () => {
    this.context.router.transitionTo({
      pathname: this.props.location.pathname,
      query: _.omit(this.props.location.query || {}, 'nowPlaying'),
    })
  }
}

export default App
