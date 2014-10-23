class TagStats extends BaseCtrl
    @register()
    @inject 'common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service', 'miniChartOption','tag.service'
    constructor: (@common, $rootScope, $scope, $interval, datacontext, statsService, miniChartOption, tagService) ->
        vm = @

        vm.sliderValuesChanged = (event, data) ->
            $rootScope.$apply ->
                vm.sliderRangeStart = data.values.min
                vm.sliderRangeEnd = data.values.max

        vm.sliderValuesChanging = (e, data) ->
            fromDate = data.values.min.getTime()
            toDate = data.values.max.getTime()

        vm.miniOptions = miniChartOption

        vm.getBarWidth = (percent) ->
            (percent / 100) * 362 + 'px'

        vm.getTagColorStyle = (color) ->  
            'transparent ' + color + ' transparent transparent'

        updateStats = ->
            vm.tagStats = []
            datacontext
                .getTagsExpenses(new Date(1349538476000).getTime() / 1000, new Date(1412593875000).getTime() / 1000, [])
                .success (data) ->
                    vm.tagStats = data.slice(0, 11)
                    max = vm.tagStats.reduce (a,b) -> if a.percent > b.percent then a else b
                    console.log max
                    for tagstat in vm.tagStats
                        tagstat.tags = tagService.colorAndSaveTags tagstat.tags
                    return

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
            .then ->
                callback = ->
                    $('.bar-wrap').addClass('open')
                common.$timeout callback, 500
                

