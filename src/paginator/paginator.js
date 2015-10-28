import { createFactory, createClass, DOM, PropTypes } from 'react';
import { Link as LinkComponent, State } from 'react-router';
import { icon } from '../lib/util';

const Link = createFactory(LinkComponent);

export default createClass({
  displayName: 'Paginator',

  contextTypes: {
    location: PropTypes.object
  },

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
      to: this.context.location.pathname,
      query: _.extend({}, this.context.location.query, { pageToken })
    }, children);
  }
});
