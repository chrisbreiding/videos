require.config({
  baseUrl: '/public/js',
  urlArgs: "v="+(new Date()).getTime(),
  paths: {
    jquery: 'lib/jquery.min',
    underscore: 'lib/underscore.min',
    backbone: 'lib/backbone.min',
    localstorage: 'lib/backbone.localstorage.min',
    text: 'lib/require.text.min',
    handlebars: 'lib/handlebars.min',
    moment: 'lib/moment.min',
    template: '/templates',
    spec: '../../spec'
  },
  shim: {
    backbone: {
      deps: ['jquery', 'underscore'],
      exports: 'Backbone'
    },
    underscore: {
      exports: '_'
    }
  }
});

require(['spec/chai'], function(chai) {

  expect = chai.expect;
  mocha.setup('bdd');

  var specs = [
    'main.spec'
  ];

  require(specs, function(){
    console.log('run test');
    mocha.run();
  });

});
