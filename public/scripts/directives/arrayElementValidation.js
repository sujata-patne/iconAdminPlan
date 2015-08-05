/**
 * Created by sujata.patne on 05-08-2015.
 */
myApp.directive("requireItems", function(){
    return {
        require: "?ngModel",
        link: function(scope, element, attrs, ngModel){
            if (!ngModel) return;

            attrs.$observe("requireItems", function(){
                console.log(attrs.requireItems)
                var val = parseInt(attrs.requireItems);
                ngModel.$setValidity("require-items", !!val);
            });
        }
    }
});