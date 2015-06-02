import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { RouteHandler as RouteHandlerComponent, State, Navigation } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from './subs-store';
import { fetch, remove } from './subs-actions';
import { icon } from '../lib/util';
import AddSubComponent from './add-sub/add-sub';
import SubItemComponent from './sub-item';

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
    return DOM.div({ className: `subs${this.state.editing ? ' editing' : ''}` },
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
    return DOM.ul(null,
      _.map(this.state.subs, (sub) => {
        return SubItem(_.extend({
          key: sub.id,
          onRemove: _.partial(this._removeSub, sub.id)
        }, sub));
      })
    );
  },

  _toggleEditing () {
    this.setState({ editing: !this.state.editing });
  },

  _removeSub (id) {
    const routeId = this.getParams().id;
    remove(id);
    if (routeId === id) this.transitionTo('app');
  }
});
