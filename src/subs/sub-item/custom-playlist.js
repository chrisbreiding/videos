import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent } from 'react-router';
import { icon } from '../../lib/util';
import IconThumbComponent from '../../icon-thumb/icon-thumb';

const IconThumb = createFactory(IconThumbComponent);
const Link = createFactory(LinkComponent);

export default createClass({
  render () {
    return DOM.span(null,
      Link({ to: 'sub', params: { id: this.props.id } },
        DOM.h3(null, this.props.title)
      ),
      IconThumb(this.props.icon)
    );
  }
});
