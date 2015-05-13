import { Promise } from 'rsvp';

export default {
  getItem (key) {
    return new Promise((resolve) => {
      if (!localStorage[key]) {
        resolve(null);
      } else {
        resolve(JSON.parse(localStorage[key]));
      }
    });
  },

  setItem (key, value) {
    return new Promise((resolve) => {
      localStorage[key] = JSON.stringify(value);
      resolve(value);
    });
  }
};
