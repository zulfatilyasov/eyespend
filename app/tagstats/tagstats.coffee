class TagStats extends BaseCtrl
    @register()
    @inject 'common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service', 'miniChartOption'
    constructor: (@common, $rootScope, $scope, $interval, datacontext, statsService, miniChartOption) ->
        vm = @

        vm.sliderValuesChanged = (event, data) ->
            $rootScope.$apply ->
                vm.sliderRangeStart = data.values.min
                vm.sliderRangeEnd = data.values.max

        vm.sliderValuesChanging = (e, data) ->
            fromDate = data.values.min.getTime()
            toDate = data.values.max.getTime()

        vm.miniOptions = miniChartOption

        updateStats = ->
            vm.tagStats = []
            datacontext
                .getTagsExpenses(new Date(1349538476000).getTime() / 1000, new Date(1412593875000).getTime() / 1000, [])
                .success (data) ->
                    console.log(data)
                    vm.tagStats = data.slice(0, 30)

        $scope.$watch 'vm.sliderRangeStart', updateStats
        $scope.$watch 'vm.sliderRangeEnd', updateStats

        getStats = -> 
            statsService
                .transactionsForChart()
                .success (data) ->
                    vm.chartDateRange = 
                        startDate: moment statsService.minDate()
                        endDate: moment statsService.maxDate()

                    vm.miniData = data

                    vm.initializeSlider 
                        defaultValues: 
                            min: new Date statsService.minDate()
                            max: new Date statsService.maxDate()
                        bounds: 
                            min: new Date statsService.minDate()
                            max: new Date statsService.maxDate()
                        step: 
                            days: 1
                        arrows: false

        @activate([getStats()])

