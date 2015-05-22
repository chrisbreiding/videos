import dispatcher from '../lib/dispatcher';
import subService from './subs-service';

class SubActions {
  didUpdateSubs (subs) {
    this.dispatch(subs);
  }

  didAddSub (sub) {
    this.dispatch(sub);
  }

  didRemoveSub (sub) {
    this.dispatch(sub);
  }

  didUpdateSearchResults (searchResults) {
    this.dispatch(searchResults);
  }

  fetch () {
    subService.fetch().then((subs) => {
      this.actions.didUpdateSubs(subs);
    });
  }

  search (query) {
    subService.search(query).then((searchResults) => {
      this.actions.didUpdateSearchResults(searchResults);
    })
  }

  clearSearch () {
    this.actions.didUpdateSearchResults([]);
  }

  add (channel) {
    subService.addChannel(channel).then(() => {
      this.actions.didAddSub(channel);
    });
  }

  remove (channel) {
    subService.removeChannel(channel).then(() => {
      this.actions.didRemoveSub(channel);
    });
  }
}

export default dispatcher.createActions(SubActions);
