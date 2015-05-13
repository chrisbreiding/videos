import dispatcher from '../lib/dispatcher';
import subService from './subs-service';

class SubActions {
  didUpdateSubs (subs) {
    this.dispatch(subs);
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

  add (channel) {
    subService.addChannel(channel).then((subs) => {
      this.actions.didUpdateSubs(subs);
    });
  }
}

export default dispatcher.createActions(SubActions);
