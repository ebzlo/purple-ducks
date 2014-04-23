define([

  'require',

  'jquery',
  'backbone',

  'models/post'

], function(require) {

  var $        = require('jquery'),
      Backbone = require('backbone'),

      Post     = require('models/post');

  return Backbone.Collection.extend({

    model: Post,

    initialize: function(models, options) {
      if (!options.pageId || !options.accessToken) {
        throw new Error("Page ID and Access Token are required.");
      }

      this.pageId = options.pageId;
      this.accessToken = options.accessToken;
    },

    url: function() {
      return 'https://graph.facebook.com/' + this.pageId + '/promotable_posts';
    },

    parse: function(response) {
      return response.data || [];
    },

    comparator: function(post) {
      return new Date(post.get('updated_time')).valueOf();
    },

    fetch: function(options) {
      options = options || {};
      options.data = options.data || {};
      options.data.access_token = this.accessToken;

      return Backbone.Collection.prototype.fetch.call(this, options);
    }

  });

});
