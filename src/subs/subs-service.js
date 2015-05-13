import { SUBS_KEY } from '../lib/constants';
import localData from '../lib/local-data';

export default {
  fetch () {
    return localData.getItem(SUBS_KEY);
  }
};
