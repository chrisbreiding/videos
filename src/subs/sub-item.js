import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent } from 'react-router';
import { icon } from '../lib/util';
import IconThumbComponent from '../icon-thumb/icon-thumb';

const IconThumb = createFactory(IconThumbComponent);
const Link = createFactory(LinkComponent);

export default createClass({
  render () {
    return DOM.li({ className: 'sub' },
      Link({ to: 'sub', params: { id: this.props.id } }, DOM.h3(null, this.props.title || this.props.author)),
      DOM.button({ className: 'remove', onClick: this.props.onRemove }, icon('minus-circle')),
      this.props.thumb ? DOM.img({ src: this.props.thumb }) : IconThumb(this.props.icon)
    );
  }
});
