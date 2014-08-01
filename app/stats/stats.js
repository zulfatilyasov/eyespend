(function() {
    'use strict';
    var controllerId = 'stats';
    angular.module('app').controller(controllerId, ['common', '$rootScope', 'statsService', 'date', 'config', '$scope', stats]);

    function stats(common, $rootScope, statsService, date, config, $scope) {
        var vm = this;
        vm.data = null;
        var fromDate = null;
        var toDate = null
        $scope.$watch('vm.chartDateRange', function(newVal, oldVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            fromDate = newVal.startDate.unix() * 1000;
            toDate = newVal.endDate.unix() * 1000;
            if (vm.data)
                vm.data = statsService.changeDateRange(fromDate, toDate);
        });

        $scope.$watch('vm.interval', function(newVal, oldVal) {
            if(newVal === oldVal)
                return;
            vm.data = statsService.reducePoints(newVal);
        })

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
                color: '#3FB8AF',
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
        vm.interval = 1;


        function activate() {
            var promises = [getStats()];
            common.activateController(promises, controllerId)
                .then(function() {
                    initDateRangeSlider();
                });
        }

        function initDateRangeSlider() {
            $(".no-slider").noUiSlider({
                connect: true,
                range: {
                    'min': statsService.minDate(),
                    'max': statsService.maxDate()
                },
                // step: vm.interval * 24 * 60 * 60 * 1000,
                start: [statsService.minDate(), statsService.maxDate()],
                serialization: {
                    lower: [
                        $.Link({
                            target: $("#start"),
                            method: lowerChange
                        })
                    ],
                    upper: [
                        $.Link({
                            target: $("#end"),
                            method: upperChange
                        })
                    ],
                    format: {
                        decimals: 0
                    }
                }
            });
            common.$timeout(function() {
                setLeftDateTipPosition();
                setRightDateTipPosition();
                $('.date-tip').show(200);
            }, 800);
        }

        function setLeftDateTipPosition() {
            var left = getLeftPostion('.noUi-handle-lower');
            setLeftPosition('#start', left);
        }

        function setRightDateTipPosition() {
            var left = getLeftPostion('.noUi-handle-upper');
            setLeftPosition('#end', left);
        }

        function safeDigest() {
            if (!$scope.$$phase) {
                $rootScope.$apply();
            }
        }

        function upperChange(value) {
            value = parseInt(value);
            if (!value)
                return;
            setDate('#end', value);
            setRightDateTipPosition();
            toDate = value;
            vm.data = statsService.changeDateRange(fromDate, toDate);
            safeDigest();
        }


        function lowerChange(value) {
            value = parseInt(value);
            if (!value)
                return;
            setDate('#start', value);
            setLeftDateTipPosition();
            fromDate = value;
            vm.data = statsService.changeDateRange(fromDate, toDate);
            safeDigest();
        }

        function getLeftPostion(el) {
            return $(el).offset().left;
        }

        function setLeftPosition(el, l) {
            $(el).css('left', l + 'px')
        }

        function setDate(el, value) {
            $(el).html(date.withoutTime(value));
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
