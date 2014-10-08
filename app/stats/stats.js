(function() {
    'use strict';
    var controllerId = 'stats';
    angular.module('app').controller(controllerId, ['common', '$rootScope', 'stats.service', 'date', 'config', '$scope', stats]);

    function stats(common, $rootScope, statsService, date, config, $scope) {
        var vm = this;
        vm.data = null;
        vm.interval = 'day';

        var fromDate = null;
        var toDate = null;

        $scope.$watch('vm.chartDateRange', function(newVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            fromDate = newVal.startDate.unix() * 1000;
            toDate = newVal.endDate.unix() * 1000;

            if (fromDate === toDate)
                return;
            if (vm.data) {
                vm.data = statsService.changeDateRange(fromDate, toDate, vm.interval);
            }
            vm.setSliderValues(new Date(fromDate), new Date(toDate));
            common.$timeout(function() {
                bindPopoverToCircles();
            });
        });

        $scope.$watch('vm.interval', function(newVal, oldVal) {
            vm.showRanges = false;

            if (newVal === oldVal)
                return;

            vm.miniData = statsService.reducePoints(newVal);

            var l = vm.miniData.length;

            vm.setSliderBounds(vm.miniData[0].x, vm.miniData[l - 1].x);

            if (fromDate <= statsService.minDate() || toDate >= statsService.maxDate()) {
                vm.setSliderValues(vm.miniData[0].x, vm.miniData[l - 1].x);

                if (vm.miniData[0].x < fromDate)
                    fromDate = vm.miniData[0].x;
                if (vm.miniData[l - 1].x > toDate)
                    toDate = vm.miniData[l - 1].x;
            }

            vm.data = statsService.changeDateRange(fromDate, toDate, newVal);

            common.$timeout(function() {
                bindPopoverToCircles();
            });
        });

        if (config.local == 'ru') {
            vm.datePickerTexts = {
                cancelLabel: 'Отмена',
                applyLabel: 'Ok',
                fromLabel: 'От',
                toLabel: 'До',
                customRangeLabel: 'Выбрать интервал',
                firstDay: 1,
                monthNames: 'янв_фев_мар_апр_май_июнь_июль_авг_сен_окт_ноя_дек'.split('_')
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
                daysOfWeek: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
                monthNames: 'jan_feb_mar_apr_may_jun_jul_aug_sep_okt_nov_dec'.split('_')
            };
            vm.dateRanges = {
                'Last 7 days': [moment().subtract('days', 6), moment()],
                'Last 30 days': [moment().subtract('days', 29), moment()]
            };
        }
        vm.options = {
            lineMode: 'linear',
            axes: {
                x: {
                    key: 'x',
                    labelFunction: function(value) {
                        return date.extraSmall(value);
                    },
                    type: 'linear'
                },
                y: {
                    key: 'value',
                    type: 'linear',
                    labelFunction: function(value) {
                        return value;
                    }
                }
            },
            series: [{
                y: 'value',
                thickness: '3px',
                color: 'rgb(233, 188, 6)',
                type: 'area',
                striped: true,
                label: 'График расходов'
            }],
            tension: 0.7,
            tooltip: {
                mode: 'none',
                formatter: function(x, y) {
                    return date.extraSmall(x) + ': ' + y;
                }
            },
            stacks: [],
            drawLegend: false,
            drawDots: true,
            mode: 'thumbnail',
            columnsHGap: 5
        };

        vm.miniOptions = {
            lineMode: 'linear',
            series: [{
                y: 'value',
                thickness: '2px',
                color: 'rgb(255, 248, 140)',
                striped: true
            }],
            tooltip: {
                mode: 'none'
            },
            tension: 0.7,
            stacks: [],
            drawLegend: false,
            drawDots: false,
            mode: 'thumbnail',
            columnsHGap: 5
        };

        function _updateDateInterval(mindate, maxdate) {
            $('datepicker span').text(mindate + ' - ' + maxdate);
        }

        function safeDigest() {
            if (!$scope.$$phase) {
                $rootScope.$apply();
            }
        }

        function bindPopoverToCircles() {
            var $tip = $('.stat-tip');
            $('circle').mouseenter(function() {
                var d3circle = d3.select(this);
                if (!d3circle)
                    return;
                var circleData = d3circle.datum();
                var startDate = circleData.x;
                var endDate = startDate.getNextDate(vm.interval);
                var unixStartDate = date.toUnix(startDate);
                var unixEndDate = date.toUnix(endDate);
                var intervalLabel = date.withoutTimeShort(unixStartDate);

                if (vm.interval === 'week') {
                    intervalLabel = date.extraSmall(unixStartDate) + ' - ' + date.extraSmall(unixEndDate);
                } else if (vm.interval === 'month') {
                    intervalLabel = moment(startDate).format('MMMM YYYY');
                }

                $('.tip-amount').text(circleData.y);
                $('.tip-date').text(intervalLabel);
                $tip.css('top', $(this).offset().top - $tip.height() - 15);
                $tip.css('left', $(this).offset().left - $tip.width() / 2 - 5);
                $tip.addClass('active');
            });
            $('circle').mouseleave(function() {
                $tip.removeClass('active');
            });

            if (vm.data.length < 2) {
                $('.x.axis .tick text').hide();
            }
        }



        vm.sliderValuesChanging = function(e, data) {
            fromDate = data.values.min.getTime();
            toDate = data.values.max.getTime();
            vm.data = statsService.changeDateRange(fromDate, toDate, vm.interval);
            _updateDateInterval(date.withoutTimeShort(fromDate), date.withoutTimeShort(toDate));
            common.$timeout(function() {
                bindPopoverToCircles();
            });
            safeDigest();
        };

        function getStats() {
            return statsService.transactionsForChart()
                .success(function(data) {
                    vm.chartDateRange = {
                        startDate: moment(statsService.minDate()),
                        endDate: moment(statsService.maxDate())
                    };

                    vm.data = data;
                    vm.miniData = data;

                    vm.initializeSlider({
                        defaultValues: {
                            min: new Date(statsService.minDate()),
                            max: new Date(statsService.maxDate())
                        },
                        bounds: {
                            min: new Date(statsService.minDate()),
                            max: new Date(statsService.maxDate())
                        },
                        step: {
                            days: 1
                        },
                        arrows: false
                    });

                    common.$timeout(function() {
                        bindPopoverToCircles();
                    });
                });
        }

        function activate() {
            var promises = [getStats()];
            common.activateController(promises, controllerId)
                .then(function() {

                });
        }

        activate();
    }
})();
