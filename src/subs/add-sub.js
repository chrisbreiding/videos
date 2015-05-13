import { createClass, DOM } from 'react';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from './subs-store';
import { search, add } from './subs-actions';
import { icon } from '../lib/util';

export default createClass({
  mixins: [ReactStateMagicMixin],

  statics: {
    registerStore: SubsStore
  },

  render () {
    return DOM.div({ className: 'add-sub' },
      this.state.searching ? this._search() : this._add()
    );
  },

  _add () {
    return DOM.button({ onClick: () => { this.setState({ searching: true }); }},
      icon('plus', 'Add')
    );
  },

  _search () {
    return DOM.div(null,
      DOM.button({ onClick: () => { this.setState({ searching: false }); }}, 'Done'),
      DOM.form({ onSubmit: this._searchSubs },
        DOM.input({ ref: 'query', placeholder: 'Search...' }),
        DOM.button(null, icon('search'))
      ),
      this._results()
    );
  },

  _searchSubs (e) {
    e.preventDefault();
    search(this.refs.query.getDOMNode().value);
  },

  _results () {
    return _.map(this.state.searchResults, (channel) => {
      return DOM.div({ key: channel.id },
        channel.title || channel.author,
        DOM.button({ onClick: _.partial(this._addChannel, channel) }, icon('plus'))
      );
    });
  },

  _addChannel (channel) {
    add(channel);
  }
});
