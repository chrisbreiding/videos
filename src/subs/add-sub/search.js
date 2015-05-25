import { createClass, DOM } from 'react';
import { Navigation, State } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from '../subs-store';
import { search, clearSearch, add } from '../subs-actions';
import { icon } from '../../lib/util';

export default createClass({
  mixins: [ReactStateMagicMixin, Navigation, State],

  statics: {
    registerStore: SubsStore
  },

  componentDidMount () {
    this._search();
    this.refs.query.getDOMNode().focus();
  },

  componentDidUpdate () {
    this._search();
  },

  componentWillUnmount () {
    clearSearch();
    this._updateSearch();
  },

  _search () {
    const query = this.getQuery().q;
    const oldQuery = this.query;
    this.query = query;
    if (!query || query === oldQuery) return;
    this.refs.query.getDOMNode().value = query;
    search(query);
  },

  render () {
    return DOM.div(null,
      DOM.form({ onSubmit: this._searchSubs },
        DOM.input({ ref: 'query', placeholder: 'Search...', defaultValue: this.getQuery().q }),
        DOM.button(null, icon('search'))
      ),
      DOM.ul({ className: 'sub-search-results' }, this._results())
    );
  },

  _updateSearch (search) {
    const query = _.extend({}, this.getQuery(), { q: search });
    this.transitionTo(this.getPathname(), this.getParams(), query);
  },

  _searchSubs (e) {
    e.preventDefault();
    this._updateSearch(this.refs.query.getDOMNode().value);
  },

  _results () {
    return _.map(this.state.searchResults, (channel) => {
      return DOM.li({ key: channel.id },
        DOM.img({ src: channel.thumb }),
        DOM.h3(null, channel.title || channel.author),
        DOM.button({ onClick: _.partial(this._addChannel, channel) }, icon('plus'))
      );
    });
  },

  _addChannel (channel) {
    add(channel);
  }
});
