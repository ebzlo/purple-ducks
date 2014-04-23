<img class="profile-picture" src="<%= profile_picture %>" alt="<%= post_header %>">
<h3><%= post_header %></h3>
<p><%= message %>
<%= story %></p>

<% if (picture) { %>
<p><img src="<%= picture %>"></p>
<% } %>

<% if (link) { %>
<p><a target="_blank" href="<%= link %>"><%= link %></a></p>
<% } %>

<small><%= updated_time_readable %> &mdash; <%= post_impressions_unique %> views <span class="unpublished-text"> &mdash; Unpublished</span></small>
