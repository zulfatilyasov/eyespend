(function() {
    'use strict';
    var controllerId = 'stats';
    angular.module('app').controller(controllerId, ['common', '$rootScope', 'statsService', 'date', 'config', '$scope', stats]);

    function stats(common, $rootScope, statsService, date, config, $scope) {
        var vm = this;
        vm.data = null;
        var fromDate = null;
        var toDate = null;
        $scope.$watch('vm.chartDateRange', function(newVal) {
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            fromDate = newVal.startDate.unix() * 1000;
            toDate = newVal.endDate.unix() * 1000;
            if (vm.data) {
                vm.data = statsService.changeDateRange(fromDate, toDate);
            }
            console.log(new Date(fromDate));
            console.log(new Date(toDate));
            common.$timeout(function() {
                $('#slider').dateRangeSlider("bounds", new Date(fromDate), new Date(toDate));
            }, 200);
        });

        $scope.$watch('vm.interval', function(newVal, oldVal) {
            vm.showRanges = false;

            if (newVal === oldVal)
                return;

            vm.data = statsService.reducePoints(newVal);
            vm.miniData = vm.data;

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
        vm.interval = 'day';

        function _updateDateInterval(mindate, maxdate) {
            $('datepicker span').text(mindate + ' - ' + maxdate);
        }

        function activate() {
            var promises = [getStats()];
            common.activateController(promises, controllerId)
                .then(function() {
                    $('#slider').dateRangeSlider({
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
                        arrows: false,
                        formatter: function(val) {
                            var days = val.getDate(),

                                month = val.getMonth() + 1,
                                year = val.getFullYear();
                            if (days.toString().length < 2)
                                days = '0' + days;
                            if (month.toString().length < 2)
                                month = '0' + month;
                            return days + '.' + month + '.' + year;
                        }
                    }).bind('valuesChanging', function(e, data) {
                        // $rootScope.$apply(function() {
                        var minDate = data.values.min.getTime();
                        var maxDate = data.values.max.getTime();
                        vm.data = statsService.changeDateRange(minDate, maxDate);
                        _updateDateInterval(date.withoutTimeShort(minDate), date.withoutTimeShort(maxDate));
                        common.$timeout(function() {
                            bindPopoverToCircles();
                        });
                        // });
                        safeDigest();
                        // console.log('Something moved. min: ' + data.values.min + '  max: ' + data.values.max);
                    });
                });
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
            $(el).css('left', l + 'px');
        }

        function setDate(el, value) {
            $(el).html(date.withoutTime(value));
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
                    intervalLabel = date.withoutTimeShort(unixStartDate) + ' - ' + date.withoutTimeShort(unixEndDate);
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
        }

        function getStats() {
            return statsService.transactionsForChart()
                .success(function(data) {
                    vm.data = data;
                    vm.miniData = data;
                    common.$timeout(function() {
                        bindPopoverToCircles();
                    });
                });
        }
        activate();
    }
})();
