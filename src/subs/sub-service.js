const fixtures = [
  { title: 'Sub 1' },
  { title: 'Sub 2' },
  { title: 'Sub 3' },
  { title: 'Sub 4' }
];

export default {
  list () {
    return new Promise((resolve) => {
      setTimeout(() => { resolve(fixtures); }, 250);
    });
  }
};
