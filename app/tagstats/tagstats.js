(function() {
    'use strict';

    var controllerId = 'tagstats';

    angular
        .module('app')
        .controller(controllerId, ['common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service', tagstats]);

    function tagstats(common, $rootScope, $scope, $interval, datacontext, statsService) {
        var vm = this;

        vm.sliderValuesChanged = function(event, data) {
            $rootScope.$apply(function() {
                vm.sliderRangeStart = data.values.min;
                vm.sliderRangeEnd = data.values.max;
            });
        };

        function updateStats() {
            vm.tagStats = [];
            datacontext
                .getTagsExpenses(new Date(1349538476000).getTime() / 1000, new Date(1412593875000).getTime() / 1000, [])
                .success(
                    function(data) {
                        console.log(data);
                        vm.tagStats = data.slice(0, 30);
                    });
        }

        $scope.$watch('vm.sliderRangeStart', updateStats);
        $scope.$watch('vm.sliderRangeEnd', updateStats);

        vm.sliderValuesChanging = function(e, data) {
            var fromDate = data.values.min.getTime();
            var toDate = data.values.max.getTime();
        };

        vm.miniOptions = {
            lineMode: 'linear',
            series: [{
                y: 'value',
                thickness: '2px',
                color: 'rgb(255, 248, 140)',
                striped: true,
                type: 'area',
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

        function getStats() {
            return statsService.transactionsForChart()
                .success(function(data) {
                    vm.chartDateRange = {
                        startDate: moment(statsService.minDate()),
                        endDate: moment(statsService.maxDate())
                    };

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
                });
        }

        function activate() {
            common
                .activateController([getStats()], controllerId)
                .then(function() {});
        }

        activate();
    }
})();
