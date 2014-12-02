class TagStatsCtrl extends BaseCtrl
  @register()

  @inject 'common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service',
   'miniChartOption', 'tag.service', 'datepicker.service', 'tagstats.service', 'login.service', 'date','$window'

  constructor: (@common, $rootScope, $scope, $interval, datacontext,
  statsService, miniChartOption, tagService, datepicker, tagStatsService, login, date, $window) ->
    vm = @
    vm.tagStats = null
    vm.includeTags = []
    vm.excludeTags = []
    fromDate = null
    toDate = null
    recordLimit = 20
    recordOffset = 0

    vm.draggableOptions =
      placeholder: 'keep'

    $(window).resize ->
      $scope.$apply ->
        _setWidgetAndTableHeight()

    _setWidgetAndTableHeight = ->
      vm.tableHeight = _getTableHeight()
      vm.widgetHeight = vm.tableHeight + 79

    _getTableHeight = ->
      theight = $window.innerHeight - 150
      theight - (theight % 42)

    _setWidgetAndTableHeight()  if $(window).width() > 587

    vm.sliderValuesChanged = (e, data) ->
      fromDate = data.values.min.getTime() / 1000
      toDate = data.values.max.getTime() / 1000
      refreshTagsExpenses()
      $rootScope.$apply ->
        vm.sliderRangeStart = data.values.min
        vm.sliderRangeEnd = data.values.max

    tagIsNotAdded  = (array, tagText) ->
      t = array.filter (t) -> t.text is tagText
      t.length < 1

    addTagToArray = (tagText, array) ->
      array.push
        text:tagText
      vm.tagFilterChange()

    vm.tagDropped = (event, tag) ->
      $target = $ event.target
      tagText = tag.draggable.text().trim()

      if $target.is('.include') and tagIsNotAdded(vm.includeTags, tagText)
        addTagToArray(tagText, vm.includeTags)
      if $target.is('.exclude') and tagIsNotAdded(vm.excludeTags, tagText)
        addTagToArray(tagText, vm.excludeTags)

      tag.draggable.hide()

    updateDateInterval = (begin, end) ->
      $('datepicker span').text(begin + ' - ' + end)

    vm.sliderValuesChanging = (e, data) ->
      fromDate = data.values.min.getTime()
      toDate = data.values.max.getTime()
      intervalBegin = date.withoutTimeShort(fromDate)
      intervalEnd = date.withoutTimeShort(toDate)
      updateDateInterval intervalBegin, intervalEnd

    vm.loadTags = (query) ->
      def = common.defer()
      login
      .getUserTags(query)
      .then (data) ->
        def.resolve(data)
      def.promise

    stripTags = (tags)->
      tags.map (tag) -> tag.text

    vm.tagFilterChange = ->
      refreshTagsExpenses()

    vm.datePickerTexts = datepicker.getTexts()
    vm.dateRanges = datepicker.getRanges()


    $scope.$watch 'vm.chartDateRange', (newVal) ->
      if !newVal or !newVal.startDate or !newVal.endDate
        return
      fromDate = newVal.startDate.unix()
      toDate = newVal.endDate.unix()

      if !vm.tagStats
        return
      refreshTagsExpenses()

    vm.miniOptions = miniChartOption

    vm.getBarWidth = tagStatsService.getBarWidth

    vm.getTagColorStyle = tagService.getTagColorStyle

    vm.dragStart = ->
      vm.isDragging = true

    vm.dragStop = ->
      vm.isDragging = false

    refreshTagsExpenses =
      (from = fromDate, to = toDate, includeTags = vm.includeTags, excludeTags = vm.excludeTags) ->
        getTagsExpenses(from, to, stripTags(includeTags), stripTags(excludeTags))
        .then ->
          showBars()
          vm.setSliderValues(new Date(from * 1000), new Date(to * 1000))

    getTagsExpenses = (min, max, includedTags = [], excludedTags = [], limit = recordLimit, offset = recordOffset) ->
      timeOffset = date.getTimeZoneOffset()
      tagStatsService
      .getTagStats(min, max, includedTags, excludedTags, limit, offset, timeOffset)
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
        fromDate = minDate / 1000
        toDate = maxDate / 1000

        vm.chartDateRange =
          startDate: moment minDate
          endDate: moment maxDate

        vm.miniData = data

        vm.initializeSlider getSliderOptions(minDate, maxDate)

        getTagsExpenses(minDate / 1000, maxDate / 1000)


    showBars = ->
      callback = -> $('.bar-wrap').addClass('open')
      common.$timeout callback, 200

    @activate([getStats()])
      .then ->
        showBars()

        callback = ->
          $('.nano').bind 'update', ->
            $('.tag-stat-filters').css 'top', $('.nano-content').scrollTop()

        common.$timeout callback, 200
