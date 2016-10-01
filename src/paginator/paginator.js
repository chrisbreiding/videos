import _ from 'lodash';
import { createFactory, createClass, DOM, PropTypes } from 'react';
import { Link as LinkComponent } from 'react-router';
import { icon } from '../lib/util';

const Link = createFactory(LinkComponent);

export default createClass({
  displayName: 'Paginator',

  contextTypes: {
    location: PropTypes.object
  },

  render () {
    return DOM.div({ className: 'paginator' },
      this._prev(),
      this.props.children,
      this._next()
    );
  },

  _prev () {
    const prev = this.props.prevPageToken;
    if (!prev) return DOM.span()

    return this._linkTo(prev ? '' : 'disabled', prev, icon('angle-left', 'Newer'))
  },

  _next () {
    const next = this.props.nextPageToken;
    if (!next) return DOM.span()

    return this._linkTo(next ? '' : 'disabled', next, icon('angle-right', null, 'Older'))
  },

  _linkTo (className, pageToken, children) {
    return Link({
      className: `paginator-button ${className}`,
      to: this.context.location.pathname,
      query: _.extend({}, this.context.location.query, { pageToken })
    }, children);
  }
});
