(function() {
    'use strict';
    var controllerId = 'stats';
    angular.module('app').controller(controllerId, ['common', 'statsService', 'date', 'config', '$scope', stats]);

    function stats(common, statsService, date, config, $scope) {
        var vm = this;
        vm.data = null;
        $scope.$watch('vm.chartDateRange', function(newVal, oldVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            var fromDate = newVal.startDate.unix() * 1000;
            var toDate = newVal.endDate.unix() * 1000;
            if(vm.data)
                vm.data = statsService.changeDateRange(fromDate, toDate);
        });

        if (config.local == 'ru') {
            vm.datePickerTexts = {
                cancelLabel: 'Отмена',
                applyLabel: 'Ok',
                fromLabel: 'От',
                toLabel: 'До',
                customRangeLabel: 'Выбрать интервал',
                firstDay: 1,
                monthNames: 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split("_")
            };
            vm.dateRanges = {
                'Последние 7 дней': [moment().subtract('days', 6), moment()],
                'Последние 30 дней': [moment().subtract('days', 29), moment()]
            };
        } else {
            vm.datePickerTexts = {
                cancelLabel: 'Cancel',
                applyLabel: 'Ok',
                fromLabel: 'From',
                toLabel: 'To',
                firstDay: 0,
                customRangeLabel: 'Select interval',
                daysOfWeek: 'Su_Mo_Tu_We_Th_Fr_Sa'.split("_"),
                monthNames: 'jan_feb_mar_apr_may_jun_jul_aug_sep_okt_nov_dec'.split("_")
            };

            vm.dateRanges = {
                'Last 7 days': [moment().subtract('days', 6), moment()],
                'Last 30 days': [moment().subtract('days', 29), moment()]
            };
        }

        vm.options = {
            lineMode: 'cardinal',
            axes: {
                x: {
                    key: 'x',
                    labelFunction: function(value) {
                        return date.extraSmall(value);
                    },
                    type: 'date'
                },
                y: {
                    type: 'linear'
                }
            },
            series: [{
                y: 'value',
                thickness: '3px',
                color: '#e5603b',
                type: 'area',
                striped: true,
                label: 'График расходов'
            }],
            tension: 0.7,
            tooltip: {
                mode: 'scrubber',
                formatter: function(x, y) {
                    return date.extraSmall(x) + ": " + y;
                }
            },
            stacks: [],
            drawLegend: false,
            drawDots: true,
            mode: "thumbnail",
            columnsHGap: 5
        };

        function activate() {
            var promises = [getStats()];
            common.activateController(promises, controllerId)
                .then(function() {
                });
        }

        function getStats() {
            return statsService.transactionsForChart()
                .success(function(data) {
                    vm.data = data;
                });
        }

        activate();
    }
})();
