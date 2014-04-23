define([

  'require',

  'jquery',
  'underscore',
  'backbone',
  'facebook',

  'models/post',
  'collections/posts',
  'collections/pages',
  'views/post',

  'text!templates/app.tpl'

], function(require) {

  var $        = require('jquery'),
      _        = require('underscore'),
      Backbone = require('backbone'),
      FB       = require('facebook'),

      Post     = require('models/post'),
      Posts    = require('collections/posts'),
      Pages    = require('collections/pages'),
      PostView = require('views/post'),

      tplApp  = require('text!templates/app.tpl');

  return Backbone.View.extend({

    className: 'st-logged-out',

    events: {
      'click .login-button'    : 'fbLogin',
      'click .logout-button'   : 'fbLogout',
      'change .page-selector'  : 'reloadPosts',
      'submit .poster-form'    : 'createPost'
    },

    initialize: function() {
      FB.getLoginStatus(function(response) {
        if (response.status === 'connected') {
          this.userAccessToken = response.authResponse.accessToken;
          this.loggedIn();
        }
      }.bind(this), { scope: 'publish_actions, manage_pages' });
    },

    render: function() {
      this.$el.html(tplApp);
      this.pageSelector = this.$el.find('.page-selector');
      return this;
    },

    renderAllPosts: function() {
      this.$el.find('.posts').empty();
      this.posts.each(this.renderPost.bind(this));
      this.$el.removeClass('st-loading');
    },

    renderPost: function(post) {
      var view = new PostView({
        model: post
      });

      this.$el.find('.posts').prepend(view.render().el);
    },

    reloadPosts: function() {
      var currentPage = this.pages.findWhere({ id: this.pageSelector.val() });

      this.posts = new Posts(null, {
        pageId: currentPage.get('id'),
        accessToken: currentPage.get('access_token')
      });

      this.listenTo(this.posts, 'add', this.renderPost.bind(this));
      this.$el.addClass('st-loading');

      // Get all page status updates.
      this.posts.fetch().done(function(response) {
        if (response && !response.error) {
          var batchRequests = [];

          if (this.posts.length) {
            this.$el.removeClass('st-no-items');

            this.posts.each(function(post) {

              // Create objects for insight batch request.
              batchRequests.push({
                method: 'GET',
                relative_url: '/' + currentPage.get('id') + '_' + post.id + '/insights'
              });
            }.bind(this));


            // Get insight data.
            FB.api('/', 'POST', { batch: batchRequests }, function(response) {

              if (response && !response.error) {

                // Gets batch request response and sets page_impressions attribute for posts
                // where that data is available.
                _.each(response, function(item) {
                  var insight = JSON.parse(item.body).data[0];

                  if (insight) {
                    var insightId = insight.id.match(/[0-9]+_([0-9]+)\/.+/)[1];
                    this.posts.findWhere({ id: insightId }).set({
                      post_impressions_unique: insight.values[0].value
                    });
                  }
                }.bind(this));

                this.renderAllPosts();
              } else {
                // FB.api failed.
                alert('An error occurred.');
                console.log(response);
              }
            }.bind(this));
          } else {
            this.$el.addClass('st-no-items');
          }
        } else {
          // FB.api failed.
          alert('An error occurred.');
          console.log(response);
        }
      }.bind(this));
    },

    createPost: function(e) {
      // Don't actually submit the form.
      e.preventDefault();

      var currentPage = this.pages.findWhere({ id: this.pageSelector.val() }),

          data = {
            access_token: currentPage.get('access_token'),
            message: this.$el.find('.poster-text').val(),
            published: !!this.$el.find('.poster-published').prop('checked')
          };

      FB.api('/' + currentPage.get('id') + '/feed', 'POST', data, function(response) {
        if (response && !response.error) {

          // Clear the textarea.
          this.$el.find('.poster-text').val('');

          var postId = response.id.match(/[0-9]+_([0-9]+)/)[1],

              post = new Post({
                id: postId
              });

          post.fetch({ data: { access_token: currentPage.get('access_token') } }).done(function(response) {
            
            // Add this model to the collection.
            this.posts.add(post);

          }.bind(this));

        } else {
          // FB.api failed.
          alert('An error occurred.');
          console.log(response);
        }
      }.bind(this));
    },

    loggedIn: function() {
      this.$el.addClass('st-logged-in');
      this.$el.removeClass('st-logged-out');

      this.$el.addClass('st-loading');

      this.pages = new Pages(null, {
        accessToken: this.userAccessToken
      });

      this.pages.fetch().done(function(response) {
        if (response && !response.error) {
          this.pageSelector.empty();

          this.pages.each(function(page) {
            this.pageSelector.append($('<option value="' + page.get('id') + '">' + page.get('name') + '</option>'));
          }.bind(this));

          this.reloadPosts();
        } else {
          // FB.api failed.
          alert('An error occurred.');
          console.log(response);
        }

      }.bind(this));
    },

    loggedOut: function() {
      this.$el.addClass('st-logged-out');
      this.$el.removeClass('st-logged-in');
    },

    fbLogin: function() {
      FB.login(function(response) {
        if (response && response.status === 'connected') {
          this.userAccessToken = response.authResponse.accessToken;
          this.loggedIn();
        }
      }.bind(this), { scope: 'publish_actions, manage_pages, read_insights' });
    },

    fbLogout: function() {
      FB.logout(this.loggedOut.bind(this));
    }
  });
});
