class TagStatsCtrl extends BaseCtrl
    @register()
    @inject 'common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service', 'miniChartOption','tag.service', 'datepicker.service', 'tagstats.service','login.service'
    constructor: (@common, $rootScope, $scope, $interval, datacontext, statsService, miniChartOption, tagService, datepicker, tagStatsService,login) ->
        vm = @

        vm.sliderValuesChanged = (event, data) ->
            $rootScope.$apply ->
                vm.sliderRangeStart = data.values.min
                vm.sliderRangeEnd = data.values.max

        vm.sliderValuesChanging = (e, data) ->
            fromDate = data.values.min.getTime()
            toDate = data.values.max.getTime()

        vm.loadTags = ->
            def = common.defer()
            login
                .getUserTags()
                .then (data) ->
                    def.resolve(data) 
            def.promise;

        vm.datePickerTexts = datepicker.getTexts()
        vm.dateRanges = datepicker.getRanges()

        vm.miniOptions = miniChartOption

        vm.getBarWidth = tagStatsService.getBarWidth

        vm.getTagColorStyle = tagService.getTagColorStyle

        getTagsExpenses = (min, max) ->
            vm.tagStats = []
            tagStatsService
                .getTagStats(min, max, [])
                .success (data) ->
                    vm.tagStats = data 

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

                    getTagsExpenses(minDate/1000, maxDate/1000)

        @activate([getStatsMap()])
            .then ->
                callback = -> $('.bar-wrap').addClass('open')
                common.$timeout callback, 500
                

