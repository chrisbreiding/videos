import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent } from 'react-router';
import { icon } from '../../lib/util';

const Link = createFactory(LinkComponent);

export default createClass({
  render () {
    return DOM.span(null,
      Link({ to: 'sub', params: { id: this.props.sub.id } },
        DOM.h3(null, this.props.sub.title || this.props.sub.author)
      ),
      DOM.img({ src: this.props.sub.thumb })
    );
  }
});
