/**
 * Created by sujata.patne on 7/7/2015.
 */
module.exports = function(app){
    require('../routes/index')(app);
    require('../routes/users')(app);
    require('../routes/a-la-cart')(app);
    require('../routes/subscriptions')(app);
    require('../routes/value-pack')(app);
    require('../routes/plan-list')(app);

    app.use('/*', function(req,res,next){
        res.status(404).json({"error":"No such service present"});
    })

    app.use('*', function(req,res,next){
        res.status(404).send('<html><body><h1>404 Page Not Found</h1></body></html>');
    })
}
