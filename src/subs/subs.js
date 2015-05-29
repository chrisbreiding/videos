import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent, RouteHandler as RouteHandlerComponent, State, Navigation } from 'react-router'
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from './subs-store';
import { fetch, remove } from './subs-actions';
import { icon } from '../lib/util';
import AddSubComponent from './add-sub/add-sub';
import IconThumbComponent from '../icon-thumb/icon-thumb';

const AddSub = createFactory(AddSubComponent);
const IconThumb = createFactory(IconThumbComponent);
const Link = createFactory(LinkComponent);
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
        return DOM.li({ key: sub.id, className: 'sub' },
          Link({ to: 'sub', params: { id: sub.id } }, DOM.h3(null, sub.title || sub.author)),
          DOM.button({ className: 'remove', onClick: _.partial(this._removeSub, sub.id) }, icon('minus-circle')),
          sub.thumb ? DOM.img({ src: sub.thumb }) : IconThumb(sub.icon)
        );
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
