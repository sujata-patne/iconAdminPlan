/**
 * Created by sujata.patne on 15-07-2015.
 */
var alacart = require('../controller/alacart.controller');

module.exports = function (app) {
    app.route('/getalacart')
      .post(alacart.getalacartadata)
    app.route('/addeditalacart')
      .post(alacart.addeditalacart);
}