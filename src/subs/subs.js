import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent, RouteHandler as RouteHandlerComponent, Navigation } from 'react-router'
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from './subs-store';
import { fetch, remove } from './subs-actions';
import AddSubComponent from './add-sub/add-sub';
import { getApiKey, checkApiKey } from '../login/login-actions';
import { icon } from '../lib/util';

const AddSub = createFactory(AddSubComponent);
const Link = createFactory(LinkComponent);
const RouteHandler = createFactory(RouteHandlerComponent);

export default createClass({
  mixins: [ReactStateMagicMixin, Navigation],

  statics: {
    registerStore: SubsStore
  },

  componentDidMount () {
    fetch();
    getApiKey().then((apiKey) => {
      return checkApiKey(apiKey);
    }).then((isValid) => {
      if (!isValid) this.transitionTo('login');
    });
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
          DOM.img({ src: sub.thumb }),
          DOM.h3(null, sub.title || sub.author),
          Link({ className: 'view-sub', to: 'sub', params: { id: sub.id } }, icon('chevron-right')),
          DOM.button({ className: 'remove-sub', onClick: _.partial(this._removeSub, sub) }, icon('minus-circle'))
        );
      })
    );
  },

  _toggleEditing () {
    this.setState({ editing: !this.state.editing });
  },

  _removeSub (sub) {
    remove(sub);
  }
});
