'use strict';
var app = angular.module('plunker', ['ui.bootstrap']);
app.factory('_', function () {
    return window._;
});
app.factory('moment', function () {
    return window.moment;
});
app.controller('DatepickerDemoCtrl', function ($scope, dateParser, _) {
    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();
    var test = function (a, b) {
        return a + b;
    };
    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.open2 = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened2 = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.format = 'dd.MM.yyyy';
});

app.directive('enhancedDate', [

    function () {
        return {
            scope: {
                model: '=',
            },
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: './js/enhancedDate.html',
            replace: true,
            link: function ($scope, iElm, iAttrs, controller) {
                $scope.model2 = $scope.model + "_popup";
            }
        };
    }
]);
app.directive('enhancedDateCoupled', [

    function () {
        return {
            scope: {
                model: '=',
                dateFrom: '=',
                difference: '='
            },
            restrict: 'E', // E = Element, A = Attribute, C = Class, M = Comment
            templateUrl: './js/enhancedDateCoupled.html',
            replace: true,
            link: function ($scope, iElm, iAttrs, controller) {
                console.log($scope.dateFrom);
                $scope.model2 = $scope.model + "_popup";
            }
        };
    }
]);
app.directive('popUpButton', ['$parse',
    function ($parse) {
        return {
            restrict: 'A',
            templateUrl: 'js/popUpButton.html',
            replace: true,
            link: function (scope, element, attr) {
                element.on('click', function ($event) {
                    scope.$apply(function () {
                        console.log("HEllo" + $event);
                        $event.preventDefault();
                        $event.stopPropagation();
                        $parse(attr.click).assign(scope, true);
                    });
                });
            }
        };
    }
]);
app.directive('enhancedDatePicker', ['dateParser', '_', 'moment', '$parse',
    function (dateParser, _, moment, $parse) {
        return {
            restrict: "AE",
            require: 'ngModel',
            templateUrl: './js/enhancedDatePicker.html',
            // scope: {
            //     open: '@',
            //     model: '@'
            // },
            replace: true,
            link: function (scope, element, attr, ngModelCtrl) {
                var isOpen = attr.isOpen;
                var formats = ['DDMMYY', 'DDMMYYYY', 'DD.MM.YY', 'DD.MM.YYYY'];
                var parsers = [

                    function (text) {
                        return moment(text, formats, true).isValid() ? moment(text, formats, true).toDate() : undefined;
                    },
                    //Matches . -> today
                    function (text) {
                        if (text === ".") return new Date();
                    },
                    //Matches ddMM. -> ddMMcurrentYear
                    function (text) {
                        if (/[0-9]{4}\./.test(text))
                            return dateParser.parse(text.slice(0, -1).concat(new Date().getFullYear()), 'ddMMyyyy');
                    }
                ];

                var parse = function (parsers, text) {
                    for (var i = 0; i < parsers.length; i++) {
                        var parsed = parsers[i](text);
                        if (parsed) return parsed;
                    }
                };

                function fromUser(input) {
                    var text = element.val();
                    var parsed = parse(parsers, text);
                    if (input instanceof Date) {
                        parsed = input;
                    }
                    if (!parsed) {
                        $parse(attr.ngModel).assign(scope, undefined);
                        return;
                    }
                    if (!scope.$eval(attr.ngModel) || !moment(parsed).isSame(moment(scope.$eval(attr.ngModel)), 'day')) {
                        $parse(attr.ngModel).assign(scope, parsed);
                        ngModelCtrl.$setViewValue(parsed);
                        ngModelCtrl.$render();
                    }
                    return scope.$eval(attr.ngModel);
                }


                function numerical(input) {
                    if (input instanceof Date && scope.$eval(attr.isOpen)) {
                        return input;
                    }
                    var text = element.val();
                    var clean = text.replace(/[^0-9|\.]+/g, '');
                    if (text !== clean) {
                        element.val(clean);
                    }
                    return clean;
                }

                element.on('click', function () {
                    $parse(attr.isOpen).assign(scope, false);
                    this.select();
                });
                ngModelCtrl.$parsers.push(numerical);
                ngModelCtrl.$parsers.push(fromUser);
            }
        };
    }
]);

app.directive('coupledDate', ['_', 'moment', '$parse',
    function (_, moment, $parse) {
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, element, attr, ngModelCtrl) {
                scope.$watch(attr.dateFrom, function (newValue, oldValue, scope) {
                    var future = moment(newValue).add('d', Number(attr.difference)).toDate();
                    $parse(attr.ngModel).assign(scope, future);
                    console.log("ChangePLOX");
                });
                //Validation Part:
                element.on('blur', function (event) {
                    scope.$apply(function () {
                        var from = moment(scope.$eval(attr.dateFrom));
                        var till = moment(scope.$eval(attr.ngModel));
                        //TODO: How does Validation work on HTML side?
                        from.isBefore(till) ? console.log("Valid") : console.log("Invalid");
                    });
                });
            }
        };
    }
]);
