(function() {
    'use strict';

    var controllerId = 'tagstats';

    angular
        .module('app')
        .controller(controllerId, ['common', '$rootScope', '$scope', '$interval', 'datacontext', tagstats]);

    function tagstats(common, $rootScope, $scope, $interval, datacontext) {
        var vm = this;

        vm.sliderValuesChanged = function(event, data) {
            $rootScope.$apply(function() {
                vm.sliderRangeStart = data.values.min;
                vm.sliderRangeEnd = data.values.max;
            });
        };

        vm.sliderRangeStart = new Date(1349538476000);
        vm.sliderRangeEnd = new Date(1412593875000);


        function updateStats() {
            vm.tagStats = [];
            datacontext
                .getTagsExpenses(vm.sliderRangeStart.getTime() / 1000, vm.sliderRangeEnd.getTime() / 1000, [])
                .success(
                    function(data) {
                        vm.tagStats = data.slice(0, 30);
                    });
        }

        $scope.$watch('vm.sliderRangeStart', updateStats);
        $scope.$watch('vm.sliderRangeEnd', updateStats);

        function activate() {
            common.activateController([], controllerId).then(function() {
                vm.initializeSlider({
                    bounds: {
                        min: new Date(1333772441000),
                        max: new Date()
                    }
                });
            });
        }

        activate();
    }
})();
