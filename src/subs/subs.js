import _ from 'lodash';
import { createClass, DOM } from 'react';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubStore from './subs-store';
import { fetch } from './subs-actions';

export default createClass({
  mixins: [ReactStateMagicMixin],

  statics: {
    registerStore: SubStore
  },

  componentDidMount () {
    fetch();
  },

  render () {
    return DOM.ul(null,
      _.map(this.state.subs, (sub) => {
        return DOM.li({ key: sub.id }, sub.title);
      })
    );
  }
});
