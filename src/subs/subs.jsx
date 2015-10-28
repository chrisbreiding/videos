import _ from 'lodash';
import React, { createClass } from 'react';
import { History } from 'react-router';
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import cs from 'classnames';
import SubsStore from './subs-store';
import { fetch, update, remove } from './subs-actions';
import { icon } from '../lib/util';
import AddSub from './add-sub/add-sub';
import SubItem from './sub-item/sub-item';

export default createClass({
  mixins: [ReactStateMagicMixin, History],

  statics: {
    registerStore: SubsStore
  },

  componentDidMount () {
    fetch();
  },

  render () {
    return <aside>
      <header>
        <button onClick={this._toggleEditing}>{this.state.editing ? 'Done' : 'Edit'}</button>
      </header>
      {this._subs()}
      <AddSub params={this.props.params} />
    </aside>
  },

  _subs () {
    return <ul className={cs({ editing: this.state.editing })}>
      {this.state.subs.map((sub) => {
        return <SubItem
          key={sub.get('id')}
          sub={sub}
          onUpdate={this._updateSub}
          onRemove={_.partial(this._removeSub, sub.get('id'))}
        />
      })}
    </ul>
  },

  _toggleEditing () {
    this.setState({ editing: !this.state.editing });
  },

  _updateSub (sub) {
    update(sub);
  },

  _removeSub (id) {
    remove(id);
    if (this.props.params.id === id) this.history.pushState(null, '/subs');
  }
});
