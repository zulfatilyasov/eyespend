class TagStats extends BaseCtrl
    @register()
    @inject 'common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service', 'miniChartOption','tag.service'
    constructor: (@common, $rootScope, $scope, $interval, datacontext, statsService, miniChartOption, tagService) ->
        vm = @
        maxBarWidth = 362
        offset = 80
        strech = 0

        vm.sliderValuesChanged = (event, data) ->
            $rootScope.$apply ->
                vm.sliderRangeStart = data.values.min
                vm.sliderRangeEnd = data.values.max

        vm.sliderValuesChanging = (e, data) ->
            fromDate = data.values.min.getTime()
            toDate = data.values.max.getTime()

        vm.miniOptions = miniChartOption

        vm.getBarWidth = (percent) -> (percent / 100) * maxBarWidth + strech +  'px'

        vm.getTagColorStyle = tagService.getTagColorStyle

        getTagsExpenses = (min, max) ->
            vm.tagStats = []
            datacontext
                .getTagsExpenses(min, max, [])
                .success (data) ->
                    vm.tagStats = data.slice(0, 11)
                    maxPercent = (vm.tagStats.reduce ((a,b) -> if a.percent > b.percent then a else b), 0).percent
                    maxWidth = (maxPercent / 100) * maxBarWidth
                    strech = maxBarWidth  - offset - maxWidth if maxWidth < maxBarWidth - offset
                    for tagstat in vm.tagStats
                        tagstat.tags = tagService.colorAndSaveTags tagstat.tags
                    return

        getStatsMap = ->
            statsService
                .transactionsForChart()
                .success (data) ->
                    minDate = statsService.minDate()
                    maxDate = statsService.maxDate()

                    vm.chartDateRange =
                        startDate: moment minDate
                        endDate: moment maxDate

                    vm.miniData = data

                    vm.initializeSlider
                        defaultValues:
                            min: new Date minDate
                            max: new Date maxDate
                        bounds:
                            min: new Date minDate
                            max: new Date maxDate
                        step:
                            days: 1
                        arrows: false

                    getTagsExpenses(minDate / 1000, maxDate / 1000)

        $scope.$watch 'vm.chartDateRange', (newVal) ->
            if (!newVal || !newVal.startDate || !newVal.endDate)
                return;
            fromDate = newVal.startDate.unix()
            toDate = newVal.endDate.unix()

            vm.setSliderValues(new Date(fromDate*1000), new Date(toDate*1000))
            getTagsExpenses(fromDate, toDate)
              .then ->
                  callback = -> $('.bar-wrap').addClass('open')
                  common.$timeout callback, 500

        @activate([getStatsMap()])
            .then ->
                callback = -> $('.bar-wrap').addClass('open')
                common.$timeout callback, 500


