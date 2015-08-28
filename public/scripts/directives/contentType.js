/**
 * Created by sujata.patne on 27-08-2015.
 */


app.directive('contentType', function($compile){
    return {
        scope:{
            ContentTypes:"=",
            alacartData:"="
        },
        link:function (scope, elem, attr, ctrl)
        {
            //scope.$watch('contentTypes', function(){ // watch for when model changes

                elem.html("") //remove all elements

                angular.forEach(scope.contentTypes, function(d){ //iterate list
                    var s = scope.$new(); //create a new scope
                    angular.extend(s,d); //copy data onto it
                    console.log(scope.alacartData);

                    var template = '<label class="item item-input"><div class="style-select"><select ng-model="selectedAlacartPlan" ng-options="item.ap_id as item.ap_plan_name for item in scope.alacartData"></select><br></div></label>';
                    elem.append($compile(template)(s)); // compile template & append
                });
            //}, true) //look deep into object
        }
    }
})