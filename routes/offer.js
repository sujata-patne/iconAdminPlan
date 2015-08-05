/**
 * Created by sujata.patne on 17-07-2015.
 */

var offer = require('../controller/offer.controller');
module.exports = function (app) {
    app.route('/getofferdata')
      .post(offer.getofferdata)
    app.route('/addeditoffer')
      .post(offer.addeditoffer);
}