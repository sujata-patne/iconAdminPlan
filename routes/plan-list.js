/**
 * Created by sujata.patne on 17-07-2015.
 */
var plan = require('../controller/planlist.controller');
module.exports = function (app) {
    app.route('/planlist')
       .get(plan.getplanlist)
    app.route('/blockunblockplan')
      .post(plan.blockunblockplan)
    app.route('/deleteplan')
     .post(plan.deleteplan)
    app.route('/exportplan')
    .post(plan.exportplan)
}