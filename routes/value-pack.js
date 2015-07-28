/**
 * Created by sujata.patne on 17-07-2015.
 */

var valuepack = require('../controller/valuepack.controller');
module.exports = function (app) {
    app.route('/getvaluepack')
      .post(valuepack.getvaluepack)
    app.route('/addeditvaluepack')
      .post(valuepack.addeditvaluepack);
}