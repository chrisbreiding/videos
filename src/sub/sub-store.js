import dispatcher from '../lib/dispatcher';
import actions from './sub-actions';

class SubStore {
  constructor () {
    this.sub = {};

    this.bindListeners({
      updateSub: actions.DID_UPDATE_SUB,
      setSubId: actions.GET_SUB
    });
  }

  setSubId (id) {
    this.id = id;
  }

  updateSub (sub) {
    this.sub = sub;
  }
}

export default dispatcher.createStore(SubStore, 'SubStore');
