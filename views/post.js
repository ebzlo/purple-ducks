define([

  'require',

  'jquery',
  'backbone',
  'text!templates/post.tpl'

], function(require) {

  var $        = require('jquery'),
      Backbone = require('backbone'),
      tplPost  = require('text!templates/post.tpl');

  return Backbone.View.extend({

    tagName: 'div',

    className: 'post-content',

    render: function() {
      if (!this.model.get('published')) {
        this.$el.addClass('unpublished-post');
      }

      var template = _.template(tplPost);
      this.$el.html(template(this.model.toJSON()));

      return this;
    }

  });

});
