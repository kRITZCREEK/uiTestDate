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
    $scope.today();
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

app.directive('enhancedDate', ['dateParser','_', 'moment', function(dateParser, _, moment) {
    return {
        restrict: "A",
        require: 'ngModel',
        //moment.js _.js ngmodelcontroller
        link: function (scope, element, attr, ngModelCtrl) {
            console.log(attr);
            var modelDate = attr.ngModel;
            var isOpen = attr.isOpen;
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
                console.log(attr.ngModel + " Model")
                console.log(modelDate + " ModelinDirective")
                var text = element.val();
                var parsed = parse(parsers, text);
                if(input instanceof Date){
                    parsed = input;
                }
                if(!parsed){
                    modelDate = undefined;
                    return;
                }
                if(!modelDate || !moment(parsed).isSame(moment(modelDate), 'day')){
                    modelDate = parsed;
                    ngModelCtrl.$setViewValue(parsed);
                    ngModelCtrl.$render();
                }
                return modelDate;
            }


            function numerical(input) {
                //TODO: Couple isOpen and scope.opened properly
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

            element.on('click', function () {
                scope.opened = false;
                this.select();
            });
            ngModelCtrl.$parsers.push(numerical);
            ngModelCtrl.$parsers.push(fromUser);
        }
    };
}]);

app.directive('coupledDate', ['_', 'moment', function(_, moment){
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl){
             var modelDate = attr.ngModel;
             scope.$watch(attr.von, function(newValue, oldValue, scope) {
                var future = moment(newValue).add('d', Number(attr.difference)).toDate();
                ngModelCtrl.$setViewValue(future);
                ngModelCtrl.$render();
             });
             //ngModelCtrl.$setViewValue(moment(von).add('d', Number(difference)).toDate());
        }
    };
}]);