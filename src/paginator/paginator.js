import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent, State } from 'react-router';
import { icon } from '../lib/util';

const Link = createFactory(LinkComponent);

export default createClass({
  mixins: [State],

  render () {
    const prev = this.props.prevPageToken;
    const next = this.props.nextPageToken;

    if(!prev && ! next) return null;

    return DOM.ul({ className: 'paginator' },
      DOM.li({ className: prev ? '' : 'disabled' },
        this._linkTo(prev, icon('angle-left', 'Newer'))
      ),
      DOM.li({ className: next ? '' : 'disabled' },
        this._linkTo(next, icon('angle-right', null, 'Older'))
      )
    );
  },

  _linkTo (pageToken, children) {
    return Link({
      to: this.getPathname(),
      params: this.getParams(),
      query: _.extend({}, this.getQuery(), { pageToken })
    }, children);
  }
});
