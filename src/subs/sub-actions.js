import dispatcher from '../lib/dispatcher';
import subService from './sub-service';

class SubActions {
  updateSubs (subs) {
    this.dispatch(subs);
  }

  listSubs () {
    subService.list()
      .then((subs) => {
        this.actions.updateSubs(subs);
      });
  }
}

export default dispatcher.createActions(SubActions);
