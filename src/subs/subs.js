import _ from 'lodash';
import { createClass, DOM } from 'react';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubStore from './sub-store';
import { listSubs } from './sub-actions';

export default createClass({
  mixins: [ReactStateMagicMixin],

  statics: {
    registerStore: SubStore
  },

  componentDidMount () {
    listSubs();
  },

  render () {
    return DOM.ul(null,
      _.map(this.state.subs, (sub) => {
        return DOM.li(null, sub.title);
      })
    );
  }
});
