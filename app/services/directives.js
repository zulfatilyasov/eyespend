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
                            scope.vm.newTnx.DateTime = date;
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
        });
})();
