(function() {
  'use strict';

  var app = angular.module('app');

  app
    .directive('ngEnter', function() {
      return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
          if (event.which === 13) {
            scope.$apply(function() {
              scope.$eval(attrs.ngEnter);
            });

            event.preventDefault();
          }
        });
      };
    })
    .directive('ngArrow', function() {
      return function(scope, element, attrs) {
        element.bind("keydown keypress", function(event) {
          if (event.which === 38 || event.which === 40) {
            scope.$apply(function() {
              scope.$eval(attrs.ngArrow);
            });

            event.preventDefault();
          }
        });
      };
    })
    .directive('usDateTimePicker', function() {
      return function(scope, element, attrs) {
        $(element).datetimepicker({
          mask: true,
          lang: 'ru',
          closeOnDateSelect: true,
          //                    format: 'd.m.Y H:i',
          format: 'd.m.Y',
          onChangeDateTime: function(date, input) {
            var d = new Date(date);
            var time = scope.$parent.transaction.time.replace(':', '');
            var hours = time.slice(0, 2);
            var minutes = time.slice(2, 4);
            d.setHours(hours);
            d.setMinutes(minutes);
            scope.$parent.transaction.timestamp = d.getTime();
          }
        });
      };
    })
    .directive('onTransitionEnd', function() {
      function transitionEndEventName() {
        var i,
          el = document.createElement('div'),
          transitions = {
            'transition': 'transitionend',
            'OTransition': 'otransitionend', // oTransitionEnd in very old Opera
            'MozTransition': 'transitionend',
            'WebkitTransition': 'webkitTransitionEnd'
          };

        for (i in transitions) {
          if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
            return transitions[i];
          }
        }
      }

      var transitionEnd = transitionEndEventName();

      function link(scope, element, atts) {
        element.on(transitionEnd, function() {
          scope.transtionEnd();
        });
      }

      return {
        restrict: 'A',
        scope: {
          transtionEnd: "=onTransitionEnd"
        },
        link: link
      };
    })
    .directive('focusMe', function($timeout) {
      return {
        scope: {
          trigger: '=focusMe'
        },
        link: function(scope, element) {
          scope.$watch('trigger', function(value) {
            if (value === true) {
              $timeout(function() {
                if (element.tagName !== 'INPUT') {
                  element = element.context ? $(element.context).find('input').first() : element.find('input').first();
                }
                element[0].focus();
              });
            }
          });
        }
      };
    });
})();
