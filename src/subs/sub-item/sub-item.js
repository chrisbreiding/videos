import { createFactory, createClass, DOM } from 'react';
import { Link as LinkComponent } from 'react-router';
import { icon } from '../../lib/util';
import IconThumbComponent from '../../icon-thumb/icon-thumb';

const IconThumb = createFactory(IconThumbComponent);
const Link = createFactory(LinkComponent);

export default createClass({
  render () {
    return DOM.li({ className: 'sub-item' },
      DOM.button({ className: 'remove', onClick: this._remove }, icon('minus-circle')),
      Link({ to: 'sub', params: { id: this.props.id } }, DOM.h3(null, this.props.title || this.props.author)),
      this.props.thumb ? DOM.img({ src: this.props.thumb }) : IconThumb(this.props.icon)
    );
  },

  _remove () {
    if (confirm(`Remove ${this.props.title || this.props.author}?`)) {
      this.props.onRemove();
    }
  }
});
