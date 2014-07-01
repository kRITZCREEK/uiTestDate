'use strict';
var app = angular.module('plunker', ['ui.bootstrap']);
app.factory('_', function(){
    return window._;
});
app.factory('moment', function(){
    return window.moment;
});
app.controller('DatepickerDemoCtrl', function ($scope, dateParser, _) {
    $scope.today = function() {
        $scope.dt = new Date();
    };
    var test = function(a,b){
      return a+b;
    };
    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };

    $scope.toggleMin = function() {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.initDate = new Date('2016-15-20');
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = 'ddMMyy';
});

app.directive('numeric', ['dateParser','_', 'moment', function(dateParser, _, moment) {
    return {
        require: 'ngModel',
        //moment.js _.js ngmodelcontroller
        link: function (scope, element, attr, ngModelCtrl) {
            var formats = ['DDMMYY', 'DDMMYYYY', 'DD.MM.YY', 'DD.MM.YYYY'];
            var parsers = [
                function(text){
                    return moment(text, formats, true).isValid()? moment(text, formats, true).toDate(): undefined;
                },
                /*function(text){
                    return dateParser.parse(text, 'ddMMyy');
                },
                function(text){
                    return dateParser.parse(text, 'ddMMyyyy');
                },
                function(text){
                    return dateParser.parse(text, 'dd.MM.yy');
                },
                function(text){
                    return dateParser.parse(text, 'dd.MM.yyyy');
                },*/
                //Matches . -> today
                function(text){
                    if(text === ".") return new Date();
                },
                //Matches ddMM. -> ddMMcurrentYear
                function(text){
                    if(/[0-9]{4}\./.test(text))
                        return dateParser.parse(text.slice(0,-1).concat(new Date().getFullYear()), 'ddMMyyyy');
                }
            ];

            var parse = function(parsers, text){
                //return _.find(parsers, function(parser){return parser(text);})
                for(var i = 0; i < parsers.length; i++){
                    var parsed = parsers[i](text);
                    if(parsed) return parsed;
                }
            };

            function fromUser(input) {
                var text = element.val();
                var parsed = parse(parsers, text);
                if(input instanceof Date){
                    parsed = input;
                }
                if(!parsed){
                    scope.dt = undefined;
                    return;
                }
                if(!scope.dt || !moment(parsed).isSame(moment(scope.dt), 'day')){
                    scope.dt = parsed;
                    ngModelCtrl.$setViewValue(parsed);
                    ngModelCtrl.$render();
                }
                return scope.dt;
            }


            function numerical(input) {
                if(input instanceof Date && scope.opened){
                    return input;
                }
                var text = element.val();
                var clean = text.replace( /[^0-9|\.]+/g, '');
                if (text !== clean) {
                    element.val(clean);
                }
                return clean;
            }
            ngModelCtrl.$parsers.push(numerical);
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);


app.directive('selectOnClick', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            element.on('click', function () {
                scope.opened = false;
                this.select();
            });
        }
    };
});
