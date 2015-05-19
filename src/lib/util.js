import { DOM } from 'react';

export default {
  icon (iconName, text) {
    return DOM.span({ className: `icon${text ? ' with-text' : ''}` },
      DOM.i({ className: `fa fa-${iconName}` }),
      text ? text : null
    );
  }
}
