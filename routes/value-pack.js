/**
 * Created by sujata.patne on 17-07-2015.
 */

var valuepack = require('../controller/valuepack.controller');
module.exports = function (app) {
    app.route('/valuepack')
       .get(valuepack.getvaluepacks)
       .post(valuepack.addvaluepacks);
    app.route('/editvaluepackdata')
      .post(valuepack.geteditvaluepacks)
    app.route('/editvaluepack')
      .post(valuepack.editvaluepacks);
}