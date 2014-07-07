(function () {
    'use strict';

    var app = angular.module('app');

    app
        .directive('ngEnter', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 13) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        })
        .directive('ngArrow', function () {
            return function (scope, element, attrs) {
                element.bind("keydown keypress", function (event) {
                    if (event.which === 38 || event.which === 40) {
                        scope.$apply(function () {
                            scope.$eval(attrs.ngArrow);
                        });

                        event.preventDefault();
                    }
                });
            };
        })
        .directive('usDateTimePicker', function () {
            var minDate,
                maxDate;
            return function (scope, element, attrs) {
                $(element).datetimepicker({
                    mask: true,
                    lang: 'ru',
                    closeOnDateSelect: true,
                    format: 'd.m.Y H:i',
                    onChangeDateTime: function (date, input) {
                        if (attrs.editor) {
                            scope.vm.editedTnx.timestamp = (new Date(date)).getTime();
                            return;
                        }
                        if (!attrs.filter) {
                            scope.vm.newTnx.timestamp = date;
                            return;
                        }

                        var unixDate = (new Date(date)).getTime();
                        if (input.attr('id') == 'fromDate') {
                            minDate = unixDate;
                        } else {
                            maxDate = unixDate;
                        }
                        scope.vm.filterByDate(minDate, maxDate);
                    }
                });
            };
        })
        .directive('onTransitionEnd',function(){
            function transitionEndEventName () {
                var i,
                el = document.createElement('div'),
                transitions = {
                    'transition':'transitionend',
                    'OTransition':'otransitionend',  // oTransitionEnd in very old Opera
                    'MozTransition':'transitionend',
                    'WebkitTransition':'webkitTransitionEnd'
                };

                for (i in transitions) {
                    if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
                        return transitions[i];
                    }
                }
            }

            var transitionEnd = transitionEndEventName();

            function link(scope, element, atts){
                element.on(transitionEnd,function(){
                    scope.transtionEnd();
                });
            }

            return {
                restrict:'A',
                scope: {
                    transtionEnd: "=onTransitionEnd"
                },
                link:link
            };
        })
        .directive('focusMe', function($timeout) {
            return {
                scope: { trigger: '=focusMe' },
                link: function(scope, element) {
                    scope.$watch('trigger', function(value) {
                        console.log(value);
                        if(value === true) {
                            $timeout(function() {
                                element[0].focus();
                            });
                        }
                    });
                }
            };
        });
})();
