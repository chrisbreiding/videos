import { Promise } from 'rsvp';

export default {
  getItem (key) {
    return new Promise((resolve) => {
      resolve(localStorage[key] ? JSON.parse(localStorage[key]) : undefined);
    });
  },

  setItem (key, value) {
    return new Promise((resolve) => {
      localStorage[key] = JSON.stringify(value);
      resolve(value);
    });
  }
};
