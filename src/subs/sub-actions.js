import { createActions } from '../lib/dispatcher';
import { list } from './sub-service';

class SubActions {
  updateSubs (subs) {
    this.dispatch(subs);
  }

  listSubs () {
    list()
      .then((subs) => {
        this.actions.updateSubs(subs);
      });
  }
}

export default createActions(SubActions);
