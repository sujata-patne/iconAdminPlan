/**
 * Created by sujata.patne on 17-07-2015.
 */
var subscription = require('../controller/subscription.controller');
module.exports = function (app) {
    app.route('/getsubscriptions')
      .post(subscription.getsubscriptions)
    app.route('/contentTypeData')
        .get(subscription.getAlacartContentType)
    app.route('/addeditsubscription')
      .post(subscription.addeditsubscriptions);
}