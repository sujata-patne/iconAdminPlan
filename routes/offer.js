/**
 * Created by sujata.patne on 17-07-2015.
 */

var offer = require('../controller/offer.controller');
module.exports = function (app) {
    app.route('/getofferdata')
      .post(offer.getofferdata)
    app.route('/addoffer')
      .post(offer.addOffer)
    app.route('/editoffer')
      .post(offer.editOffer);
}