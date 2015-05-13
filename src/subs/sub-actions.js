import dispatcher from '../lib/dispatcher';
import subService from './sub-service';

class SubActions {
  didUpdateSubs (subs) {
    this.dispatch(subs);
  }

  fetch () {
    subService.fetch().then((subs) => {
      this.actions.didUpdateSubs(subs);
    });
  }
}

export default dispatcher.createActions(SubActions);
