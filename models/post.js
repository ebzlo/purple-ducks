define([

  'require',
  'backbone',

  'moment'

], function(require) {

  var Backbone = require('backbone'),
      Moment   = require('moment');

  return Backbone.Model.extend({

    initialize: function() {
      this.on('add sync', this.updateGeneratedProperties);
    },

    defaults: {
      post_impressions_unique: 0,
      profile_picture: '',
      post_header: '',
      message: '',
      story: '',
      link: '',
      picture: '',
      is_published: true
    },

    toJSON: function() {
      var json = Backbone.Model.prototype.toJSON.apply(this);
      json.updated_time_readable = moment(this.get('updated_time')).fromNow();

      return json;
    },

    url: function() {
      return 'https://graph.facebook.com/' + this.id;
    },

    updateGeneratedProperties: function() {
      this.set('profile_picture', '//graph.facebook.com/' + this.get('from').id + '/picture?type=square');
      this.set('post_header', this.get('from').name);
    }

  });
});
