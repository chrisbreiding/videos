import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { Navigation, State } from 'react-router';
import SearchComponent from './search';
import { icon } from '../../lib/util';

const Search = createFactory(SearchComponent);

export default createClass({
  mixins: [Navigation, State],

  render () {
    const buttonContents = this._adding() ? 'Done' : icon('plus', 'Add');
    return DOM.div({ className: 'add-sub' },
      DOM.header(null, DOM.button({ onClick: this._toggle }, buttonContents)),
      this._adding() ? Search() : null
    );
  },

  _toggle () {
    const query = _.extend({}, this.getQuery(), { adding: this._adding() ? undefined : true });
    this.transitionTo(this.getPathname(), this.getParams(), query);
  },

  _adding () {
    return this.getQuery().adding;
  }
});
