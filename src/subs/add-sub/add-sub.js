import _ from 'lodash';
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
  },

  componentDidUpdate () {
    this._search();
    if (this.refs.query) {
      this.refs.query.getDOMNode().focus();
    }
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
    return DOM.div({ className: 'add-sub' },
      this.getQuery().q == null ? this._addComponent() : this._searchComponent()
    );
  },

  _addComponent () {
    return DOM.header(null,
      DOM.button({ onClick: _.partial(this._updateSearch, '') },
        icon('plus', 'Add')
      )
    );
  },

  _searchComponent () {
    return DOM.div(null,
      DOM.header(null,
        DOM.button({ onClick: () => {
          this._updateSearch(false);
          clearSearch();
        }}, 'Done')
      ),
      DOM.form({ onSubmit: this._searchSubs },
        DOM.input({ ref: 'query', placeholder: 'Search...', defaultValue: this.getQuery().q }),
        DOM.button(null, icon('search'))
      ),
      DOM.ul({ className: 'sub-search-results' },
        this._results()
      )
    );
  },

  _updateSearch (search) {
    const query = search === false ? undefined : { q: search };
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
