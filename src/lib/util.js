import { DOM } from 'react';

export default {
  icon (iconName, text) {
    return DOM.span({ className: 'icon' },
      DOM.i({ className: `fa fa-${iconName}` }),
      text ? text : null
    );
  }
}
