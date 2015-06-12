import { createClass, DOM } from 'react';
import { Navigation, State } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from '../subs-store';
import { search, clearSearch, addChannel } from '../subs-actions';
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
    return DOM.div({ className: 'add-channel' },
      DOM.form({ onSubmit: this._searchSubs },
        DOM.input({ ref: 'query', placeholder: 'Search...', defaultValue: this.getQuery().q }),
        DOM.button(null, icon('search'))
      ),
      DOM.ul(null, this._results())
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
    return this.state.searchResults.map((channel) => {
      return DOM.li({ key: channel.get('id') },
        DOM.img({ src: channel.get('thumb') }),
        DOM.h3(null, channel.get('title') || channel.get('author')),
        DOM.button({ onClick: _.partial(addChannel, channel) }, icon('plus'))
      );
    });
  }
});