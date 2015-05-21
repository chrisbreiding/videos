import { createClass, DOM } from 'react';
import { icon, duration, date } from '../lib/util';

export default createClass({
  render () {
    return DOM.div({ className: 'video' },
      DOM.img({ src: this.props.thumb }),
      DOM.div(null,
        DOM.h4(null, this.props.title),
        DOM.div(null,
          DOM.p({ className: 'duration' }, icon('clock-o', duration(this.props.duration))),
          DOM.p({ className: 'pub-date' }, date(this.props.published))
        )
      )
    );
  }
});