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
    const prev = this.props.prevPageToken;
    const next = this.props.nextPageToken;

    if (!prev && !next) { return null; }

    return DOM.div({ className: 'paginator' },
      this._linkTo(prev ? '' : 'disabled', prev, icon('angle-left', 'Newer')),
      this.props.children,
      this._linkTo(next ? '' : 'disabled', next, icon('angle-right', null, 'Older'))
    );
  },

  _linkTo (className, pageToken, children) {
    return Link({
      className,
      to: this.context.location.pathname,
      query: _.extend({}, this.context.location.query, { pageToken })
    }, children);
  }
});
