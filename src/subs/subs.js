import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent, RouteHandler as RouteHandlerComponent } from 'react-router'
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
  mixins: [ReactStateMagicMixin],

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
        this.state.subs.length ? this._subs() : DOM.div({ className: 'no-subs' }, 'No subs...'),
        AddSub()
      ),
      DOM.main(null, RouteHandler())
    );
  },

  _subs () {
    return DOM.ul(null,
      _.map(this.state.subs, (sub) => {
        return DOM.li({ key: sub.id, className: 'sub' },
          sub.thumb ? DOM.img({ src: sub.thumb }) : IconThumb(sub.icon),
          DOM.h3(null, sub.title || sub.author),
          Link({ className: 'view-sub', to: 'sub', params: { playlistId: sub.playlistId } }, icon('chevron-right')),
          DOM.button({ className: 'remove-sub', onClick: _.partial(this._removeSub, sub.id) }, icon('minus-circle'))
        );
      })
    );
  },

  _toggleEditing () {
    this.setState({ editing: !this.state.editing });
  },

  _removeSub (id) {
    remove(id);
  }
});
