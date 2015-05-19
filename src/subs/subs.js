import _ from 'lodash';
import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent, RouteHandler as RouteHandlerComponent, Navigation } from 'react-router'
import ReactStateMagicMixin from 'alt/mixins/ReactStateMagicMixin';
import SubsStore from './subs-store';
import { fetch } from './subs-actions';
import AddSubComponent from './add-sub';
import { getApiKey, checkApiKey } from '../login/login-actions';

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
    return DOM.div(null,
      DOM.aside(null,
        DOM.ul(null,
          _.map(this.state.subs, (sub) => {
            return DOM.li({ key: sub.id },
              Link({ to: 'sub', params: { id: sub.id } }, sub.title || sub.author)
            );
          })
        ),
        AddSub()
      ),
      DOM.main(null, RouteHandler())
    );
  }
});
