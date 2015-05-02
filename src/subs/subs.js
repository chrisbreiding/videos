import _ from 'lodash';
import React from 'react';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubStore from './sub-store';
import SubActions from './sub-actions';

const RD = React.DOM;

export default React.createClass({
  mixins: [ReactStateMagicMixin],

  statics: {
    registerStore: SubStore
  },

  componentDidMount () {
    SubActions.listSubs();
  },

  render () {
    return RD.ul(null,
      _.map(this.state.subs, (sub) => {
        return RD.li(null, sub.title);
      })
    );
  }
});
