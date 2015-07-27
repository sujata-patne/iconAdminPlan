/**
 * Created by sujata.patne on 17-07-2015.
 */
var subscription = require('../controller/subscription.controller');
module.exports = function (app) {
    app.route('/subscriptions')
       .get(subscription.getsubscriptions)
       .post(subscription.addsubscriptions);
    app.route('/editsubscriptiondata')
      .post(subscription.geteditsubscriptions)
    app.route('/editsubscription')
      .post(subscription.editsubscriptions);
}