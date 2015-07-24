/**
 * Created by sujata.patne on 15-07-2015.
 */
var alacart = require('../controller/alacart.controller');

module.exports = function (app) {
    app.route('/alacart')
       .get(alacart.getalacartadata)
       .post(alacart.addalacart);
    app.route('/editalacartdata')
      .post(alacart.geteditalacartadata)
    app.route('/editalacart')
      .post(alacart.editalacart);
}