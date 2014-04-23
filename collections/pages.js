define([

  'require',

  'jquery',
  'backbone',

  'models/page'

], function(require) {

  var $        = require('jquery'),
      Backbone = require('backbone'),

      Page     = require('models/page');

  return Backbone.Collection.extend({

    model: Page,

    initialize: function(models, options) {
      if (!options.accessToken) {
        throw new Error("Access Token is required.");
      }

      this.accessToken = options.accessToken;
    },

    url: function() {
      return 'https://graph.facebook.com/me/accounts';
    },

    parse: function(response) {
      return response.data || [];
    },

    fetch: function(options) {
      options = options || {};
      options.data = options.data || {};
      options.data.access_token = this.accessToken;

      return Backbone.Collection.prototype.fetch.call(this, options);
    }

  });

});
