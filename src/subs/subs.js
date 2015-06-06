import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { RouteHandler as RouteHandlerComponent, State, Navigation } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import cs from 'classnames';
import SubsStore from './subs-store';
import { fetch, update, remove } from './subs-actions';
import { icon } from '../lib/util';
import AddSubComponent from './add-sub/add-sub';
import SubItemComponent from './sub-item/sub-item';

const AddSub = createFactory(AddSubComponent);
const SubItem = createFactory(SubItemComponent);
const RouteHandler = createFactory(RouteHandlerComponent);

export default createClass({
  mixins: [ReactStateMagicMixin, State, Navigation],

  statics: {
    registerStore: SubsStore
  },

  componentDidMount () {
    fetch();
  },

  render () {
    return DOM.div({ className: 'subs' },
      DOM.aside(null,
        DOM.header(null,
          DOM.button({ onClick: this._toggleEditing }, this.state.editing ? 'Done' : 'Edit')
        ),
        this._subs(),
        AddSub()
      ),
      DOM.main(null, RouteHandler())
    );
  },

  _subs () {
    return DOM.ul({ className: cs({ editing: this.state.editing }) },
      _.map(this.state.subs, (sub) => {
        return SubItem({
          key: sub.id,
          sub: sub,
          onUpdate: this._updateSub,
          onRemove: _.partial(this._removeSub, sub.id)
        });
      })
    );
  },

  _toggleEditing () {
    this.setState({ editing: !this.state.editing });
  },

  _updateSub (sub) {
    update(sub);
  },

  _removeSub (id) {
    remove(id);
    if (this.getParams().id === id) this.transitionTo('app');
  }
});
