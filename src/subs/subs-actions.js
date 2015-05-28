import dispatcher from '../lib/dispatcher';
import subService from './subs-service';

class SubsActions {
  didUpdateSubs (subs) {
    this.dispatch(subs);
  }

  didAddSub (sub) {
    this.dispatch(sub);
  }

  didRemoveSub (id) {
    this.dispatch(id);
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

  addChannel (channel) {
    subService.addChannel(channel).then((channel) => {
      this.actions.didAddSub(channel);
    });
  }

  addCustomPlaylist (sub) {
    subService.addCustomPlaylist(sub).then(() => {
      this.actions.didAddSub(sub);
    });
  }

  remove (id) {
    subService.remove(id).then(() => {
      this.actions.didRemoveSub(id);
    });
  }
}

export default dispatcher.createActions(SubsActions);
