class TagStatsCtrl extends BaseCtrl
	@register()
	@inject 'common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service', 'miniChartOption', 'tag.service', 'datepicker.service', 'tagstats.service', 'login.service', 'date'
	constructor: (@common, $rootScope, $scope, $interval, datacontext, statsService, miniChartOption, tagService, datepicker, tagStatsService, login, date) ->
		vm = @
		vm.tagStats = null
		vm.includeTags = []
		vm.excludeTags = []
		fromDate = null
		toDate = null

		vm.sliderValuesChanged = (e, data) ->
			fromDate = data.values.min.getTime() / 1000
			toDate = data.values.max.getTime() / 1000
			refreshTagsExpenses(fromDate, toDate)
			$rootScope.$apply ->
				vm.sliderRangeStart = data.values.min
				vm.sliderRangeEnd = data.values.max

		vm.sliderValuesChanging = (e, data) ->
			fromDate = data.values.min.getTime()
			toDate = data.values.max.getTime()
			updateDateInterval(date.withoutTimeShort(fromDate), date.withoutTimeShort(toDate))

		vm.loadTags = ->
			def = common.defer()
			login
			.getUserTags()
			.then (data) ->
				def.resolve(data)
			def.promise;

		stripTags = (tags)->
			tags.map (tag) -> tag.text

		vm.tagFilterChange = ->
			stripedIncludeTags = stripTags vm.includeTags
			stripedExcludeTags = stripTags vm.excludeTags
			refreshTagsExpenses(fromDate, toDate, stripedIncludeTags, stripedExcludeTags)

		vm.datePickerTexts = datepicker.getTexts()
		vm.dateRanges = datepicker.getRanges()

		$scope.$watch 'vm.chartDateRange', (newVal) ->
			if !newVal or !newVal.startDate or !newVal.endDate
				return;

			fromDate = newVal.startDate.unix()
			toDate = newVal.endDate.unix()

			if !vm.tagStats
				return
			refreshTagsExpenses(fromDate, toDate)

		vm.miniOptions = miniChartOption

		vm.getBarWidth = tagStatsService.getBarWidth

		vm.getTagColorStyle = tagService.getTagColorStyle

		refreshTagsExpenses = (from, to, includedTags, excludedTags) ->
			getTagsExpenses(from, to, includedTags, excludedTags)
			.then ->
				showBars()
				vm.setSliderValues(new Date(from * 1000), new Date(to * 1000))

		getTagsExpenses = (min, max, includedTags = [], excludedTags = []) ->
			tagStatsService
			.getTagStats(min, max, includedTags, excludedTags)
			.success (data) ->
				vm.tagStats = data

		getSliderOptions = (minDate, maxDate) ->
			defaultValues:
				min: new Date minDate
				max: new Date maxDate
			bounds:
				min: new Date minDate
				max: new Date maxDate
			step:
				days: 1
			arrows: false

		getStats = ->
			statsService
			.transactionsForChart()
			.success (data) ->
				minDate = statsService.minDate()
				maxDate = statsService.maxDate()

				vm.chartDateRange =
					startDate: moment minDate
					endDate: moment maxDate

				vm.miniData = data

				vm.initializeSlider getSliderOptions(minDate, maxDate)

				getTagsExpenses(minDate / 1000, maxDate / 1000)

		updateDateInterval = (fromDate, toDate) ->
			$('datepicker span').text(fromDate + ' - ' + toDate)

		showBars = ->
			callback = -> $('.bar-wrap').addClass('open')
			common.$timeout callback, 200

		@activate([getStats()])
		.then ->
			showBars()
