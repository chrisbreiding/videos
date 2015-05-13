import { SUBS_KEY } from '../lib/constants';
import { getItem, setItem } from '../lib/local-data';
import { searchChannels } from '../lib/youtube';

export default {
  fetch () {
    return getItem(SUBS_KEY);
  },

  search (query) {
    return searchChannels(query);
  },

  addChannel (channel) {
    return getItem(SUBS_KEY).then((subs = []) => {
      subs.push(channel);
      return setItem(SUBS_KEY, subs);
    });
  }
};
