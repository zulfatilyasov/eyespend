/**
 * @license ng-bs-daterangepicker v0.0.1
 * (c) 2013 Luis Farzati http://github.com/luisfarzati/ng-bs-daterangepicker
 * License: MIT
 */
(function(angular) {
    'use strict';

    angular.module('ngBootstrap', []).directive('datepicker', ['$compile', '$parse', 'commonConfig', '$rootScope', 'datepicker.service',
        function($compile, $parse, commonConfig, $rootScope, datepicker) {
            return {
                restrict: 'E',
                require: '?ngModel',
                link: function($scope, $element, $attributes, ngModel) {
                    if ($attributes.type !== 'daterange' || ngModel === null) return;

                    var initialMessage = null;
                    var options = {};
                    options.format = $attributes.format || 'YYYY-MM-DD';
                    options.intervalFormat = $attributes.intervalFormat || 'D MMMM, YYYY';
                    options.separator = $attributes.separator || ' - ';
                    options.opens = $attributes.opens || '';
                    options.minDate = $attributes.minDate && moment($attributes.minDate);
                    options.maxDate = $attributes.maxDate && moment($attributes.maxDate);
                    options.dateLimit = $attributes.limit && moment.duration.apply(this, $attributes.limit.split(' ').map(function(elem, index) {
                        return index === 0 && parseInt(elem, 10) || elem;
                    }));

                    function format(date) {
                        return date.format(options.format);
                    }

                    function formatted(dates) {
                        return [format(dates.startDate), format(dates.endDate)].join(options.separator);
                    }

                    ngModel.$formatters.unshift(function(modelValue) {
                        if (!modelValue) return '';
                        return modelValue;
                    });

                    ngModel.$parsers.unshift(function(viewValue) {
                        return viewValue;
                    });

                    ngModel.$render = function() {
                        if (!ngModel.$viewValue || !ngModel.$viewValue.startDate) return;
                        $element.val(formatted(ngModel.$viewValue));
                    };

                    $scope.$watch($attributes.ngModel, function(modelValue) {
                        if (!modelValue || (!modelValue.startDate)) {
                            ngModel.$setViewValue({
                                startDate: moment().startOf('day'),
                                endDate: moment().startOf('day')
                            });
                            if (initialMessage)
                                $element.find('span').first().html(initialMessage);
                            return;
                        }
                        $element.data('daterangepicker').startDate = modelValue.startDate;
                        $element.data('daterangepicker').endDate = modelValue.endDate;
                        $element.data('daterangepicker').updateView();
                        $element.data('daterangepicker').updateCalendars();
                        $element.data('daterangepicker').updateInputText();
                    });

                    $rootScope.$on(commonConfig.config.localeChange, function(event, args) {
                        init();
                    });

                    function init() {
                        options.ranges = datepicker.getRanges();
                        options.locale = datepicker.getTexts();
                        $element.daterangepicker(options, function(start, end) {
                            if (start.unix() == end.unix())
                                return;
                            if (!initialMessage)
                                initialMessage = $element.find('span').first().html();
                            console.log(options.intervalFormat);
                            $element.find('span').first().html(start.format(options.intervalFormat) + ' - ' + end.format(options.intervalFormat));
                            $scope.$apply(function() {
                                ngModel.$setViewValue({
                                    startDate: start,
                                    endDate: end
                                });
                                ngModel.$render();
                            });
                        });
                    }
                    init();
                }
            };
        }
    ]);

})(angular);
