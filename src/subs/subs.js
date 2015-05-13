import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from './subs-store';
import { fetch } from './subs-actions';
import AddSubComponent from './add-sub';

const AddSub = createFactory(AddSubComponent);

export default createClass({
  mixins: [ReactStateMagicMixin],

  statics: {
    registerStore: SubsStore
  },

  componentDidMount () {
    fetch();
  },

  render () {
    return DOM.div(null,
      DOM.ul(null,
        _.map(this.state.subs, (sub) => {
          return DOM.li({ key: sub.id }, sub.title || sub.author);
        })
      ),
      AddSub()
    );
  }
});
