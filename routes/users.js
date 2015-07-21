var users = require('../controller/users.controller');

module.exports = function(app) {
  app.route('/users')
      .get(users.getUserData);

    app.route('/addEditUsers')
        .post(users.getEditUserData);
}