import React, { createClass, PropTypes } from 'react';
import { History } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from '../subs-store';
import { search, clearSearch, addChannel } from '../subs-actions';
import { icon } from '../../lib/util';

export default createClass({
  mixins: [ReactStateMagicMixin, History],

  contextTypes: {
    location: PropTypes.object
  },

  statics: {
    registerStore: SubsStore
  },

  componentDidMount () {
    this._search();
    this.refs.query.focus();
  },

  componentDidUpdate () {
    this._search();
  },

  componentWillUnmount () {
    clearSearch();
    this.props.clearSearch();
  },

  _search () {
    const query = this.context.location.query.q;
    const oldQuery = this.query;
    this.query = query;
    if (!query || query === oldQuery) return;
    this.refs.query.value = query;
    search(query);
  },

  render () {
    return <div className='add-channel'>
      <form onSubmit={this._searchSubs}>
        <input ref='query' placeholder='Search...' defaultValue={this.context.location.query.q} />
        <button>{icon('search')}</button>
      </form>
      <ul>{this._results()}</ul>
    </div>
  },

  _updateSearch (search) {
    const query = _.extend({}, this.context.location.query, { q: search });
    this.history.pushState(null, this.context.location.pathname, query);
  },

  _searchSubs (e) {
    e.preventDefault();
    this._updateSearch(this.refs.query.value);
  },

  _results () {
    return this.state.searchResults.map((channel) => {
      return <li key={channel.get('id')}>
        <img src={channel.get('thumb')} />
        <h3>{channel.get('title') || channel.get('author')}</h3>
        <button onClick={_.partial(addChannel, channel)}>{icon('plus')}</button>
      </li>
    });
  }
});
