require([

  'require',

  'jquery',
  'backbone',
  'facebook',

  'views/app'

], function(require) {

  var $        = require('jquery'),
      Backbone = require('backbone'),
      FB       = require('facebook'),

      App      = require('views/app');

  FB.init({
    appId       : '1442753872636126',
    channelUrl  : 'localhost:8080',
    status      : true,
    cookie      : true,
    xfbml       : true
  });

  Backbone.history.start();

  $('#app').html(new App().render().el); 

});
