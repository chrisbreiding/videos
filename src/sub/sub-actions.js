import dispatcher from '../lib/dispatcher';
import subService from '../subs/subs-service';

class SubActions {
  didUpdateSub (sub) {
    this.dispatch(sub);
  }

  getSub (id) {
    this.dispatch(id);

    subService.getSub(id).then((sub) => {
      this.actions.didUpdateSub(sub);
    });
  }
}

export default dispatcher.createActions(SubActions);
