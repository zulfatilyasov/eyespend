controllerId = "transactions"
angular.module("app").controller controllerId,
[
  "common"
  "commonConfig"
  "$window"
  "config"
  "$rootScope"
  "$scope"
  "date"
  "transaction.service"
  "$translate"
  "login.service"
  "debounce"
  "map"
  "datepicker.service"
  (
    common,
    commonConfig,
    $window,
    config,
    $rootScope,
    $scope,
    date,
    transactionService,
    $translate,
    login,
    debounce,
    map,
    datepicker
  ) ->
    vm = @
    logError = common.logger.getLogFn(controllerId, "logError")
    fromUnixDate = null
    toUnixDate = null
    vm.tags = []
    vm.trs = []
    vm.newTransactions = []
    vm.newTnx =
      latitude: null
      longitude: null

    vm.withPhotoVal = false
    vm.onlyWithPhoto = false
    vm.isAdding = false
    vm.isFiltering = false
    vm.selectedTnx = null
    vm.sort = null
    vm.showTransactionForm = false
    vm.showFilterForm = false
    vm.curDateTime = date.withoutTime(date.now())
    vm.isLoading = false
    
    vm.getTagColorStyle = (color) ->
      "transparent " + color + " transparent transparent"

    $(window).resize ->
      $scope.$apply ->
        _setWidgetAndTableHeight()

    _setWidgetAndTableHeight = ->
      vm.tableHeight = _getTableHeight()
      vm.widgetHeight = vm.tableHeight + 68

    _getTableHeight = ->
      theight = $window.innerHeight - 182
      theight - (theight % 44) - 2

    _setWidgetAndTableHeight()  if $(window).width() > 587

    $scope.$watch "vm.filterDateRange", (newVal) ->
      return  if not newVal or not newVal.startDate or not newVal.endDate
      vm.filterByDate newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000

    $scope.$watch "vm.filterMobileDateRange", (newVal) ->
      return  if not newVal or not newVal.startDate or not newVal.endDate
      setDates newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000

    $scope.$watch "vm.withPhotoVal", (newVal, oldVal) ->
      return  if newVal is oldVal
      $rootScope.showSpinner = true
      vm.onlyWithPhoto = newVal
      transactionService.getFirstPageWithFilters(fromUnixDate, toUnixDate, vm.tags, newVal).success (data) ->
        $rootScope.showSpinner = false
        vm.trs = data.transactions
        vm.total = data.total

    $scope.$watch "vm.onlyWithPhotoMobile", (newVal, oldVal) ->
      return  if newVal is oldVal
      vm.onlyWithPhoto = newVal

    selectTransaction = (transaction) ->
      if vm.editing
        vm.editing = false
        original = transactionService.getTransasctionById(vm.selectedTnx.id)
        transactionService.copy original, vm.selectedTnx
      vm.selectedTnx = transaction

    vm.addNewTxn = (isDesktop) ->
      timestamp = date.now()
      if isDesktop
        vm.trs.unshift
          timestamp: timestamp
          date: date.withoutTimeShort(timestamp)
          time: date.onlyTime(timestamp)
          new: true

      vm.newTnx.dateTime = date.format(timestamp)
      vm.isAdding = true  if vm.isAdding is false

    vm.tableClicked = ($event) ->
      if $event.target
        $target = $($event.target)
        $tr = $target.parents("tr")
        index = parseInt($tr.attr("data-index"))
        transaction = vm.trs[index]
        return  unless transaction
        if $target.is(".edit-transaction") and vm.selectedTnx and vm.selectedTnx.id is transaction.id
          vm.editTransaction index
        else if $target.is(".showMap")
          map.showAddress transaction
        else if $target.is(".pickAddress")
          map.pickAddress transaction
        else if $target.is(".showPicture")
          showImage transaction.imgUrl
        else if $target.is(".save")
          vm.saveTnx transaction
        else if $target.is(".remove-tr")
          vm.remove transaction
        else if $target.is(".transaction-tag")
          text = $target.text().trim()
          vm.addTag text
        else selectTransaction transaction  unless $tr.is(".edited")

    vm.editTransaction = (index) ->
      vm.editing = true
      common.$timeout ->
        $("[data-index=\"" + index + "\"]").find(".amount").focus()
    
    applyfilters = ->
      $rootScope.showSpinner = true
      transactionService.getFirstPageWithFilters(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
      .success (data) ->
        $rootScope.showSpinner = false
        vm.trs = data.transactions
        vm.total = data.total
        vm.richedTheEnd = vm.trs.length < transactionService.batchSize
      .error (msg) ->
        $rootScope.showSpinner = false
        logError msg


    setDates = (fromDate, toDate) ->
      if fromDate
        fromUnixDate = fromDate
        vm.minDate = date.format(fromDate)
      if toDate
        toUnixDate = toDate
        vm.maxDate = date.format(toDate)

    _tagIsAlreadyAdded = (tag) ->
      vm.tags.some (t) ->
        t.text is tag

    dropFilters = ->
      vm.tags = []
      setDates 9, 9
      applyfilters()
      vm.filterDateRange = null
      vm.richedTheEnd = false

    filtersApplied = ->
      vm.tags.length or (vm.filterDateRange and fromUnixDate isnt toUnixDate)

    removeTransaction = (transaction) ->
      if transaction.new
        removeTransactionById transaction.id
      return  if not vm.selectedTnx or not transaction or vm.selectedTnx.id isnt transaction.id
      transactionService.remove(vm.selectedTnx.id).then (->
        vm.editing = false  if vm.editing
        vm.editingMobile = false  if vm.editingMobile
        removeTransactionById vm.selectedTnx.id
        vm.selectedTnx = null
      ), (msg) ->
        logError msg

    _transactionEmpty = (transaction) ->
      not transaction.amountInBaseCurrency and
      not transaction.tags.length and
      not transaction.latitude and
      not transaction.longitude

    removeTransactionById = (id) ->
      index = transactionService.getTransactionIndex(id, vm.trs)
      vm.trs.splice index, 1

    _getTransactions = ->
      vm.isLoading = true
      transactionService.getTransaxns().success (data) ->
        vm.trs = data.transactions
        vm.total = data.total
        vm.sort = transactionService.sortOptions
        vm.richedTheEnd = true  if vm.trs.length < transactionService.batchSize
        common.$timeout ->
          vm.isLoading = false

    activate = ->
      promises = [
        _getTransactions()
        vm.loadTags()
      ]
      $rootScope.showSpinner = true
      common.activateController(promises, controllerId).then ->
        vm.transactionsLoaded = true
        $rootScope.showSpinner = false
        common.$timeout (->
          $(".nano").debounce "update", ((event, values) ->
            vm.loadMoreTransactions()  if values.maximum is values.position
          ), 100
        ), 200

    vm.showAddress = map.showAddress
    vm.pickAddress = map.pickAddress

    vm.closeMobileInfo = ->
      vm.editingMobile = false  if vm.editingMobile
      vm.isAdding = false  if vm.isAdding
      vm.selectedTnx = null

    vm.changeSorting = (column) ->
      vm.sort = transactionService.updateSorting(column)
      $rootScope.showSpinner = true
      transactionService.sort(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto).success (data) ->
        vm.trs = data.transactions
        vm.total = data.total
        vm.richedTheEnd = vm.trs.length < transactionService.batchSize
        $rootScope.showSpinner = false

    vm.loadTags = (query) ->
      def = common.defer()
      login.getUserTags(query).then (data) ->
        def.resolve data
      def.promise

    vm.getSortingForColumn = transactionService.getSortingForColumn
    vm.tagFilterChange = debounce(applyfilters, 0, false)
    moment.locale config.local
    vm.applyFilters = applyfilters

    vm.getTags = ->
      tagsStr = ""
      i = 0
      len = vm.tags.length

      while i < len
        tagsStr += vm.tags[i].text + "; "
        i++
      tagsStr

    vm.filterByDate = (fromDate, toDate) ->
      return  if fromDate is toDate
      setDates fromDate, toDate
      applyfilters()

    vm.showPeriod = ->
      (vm.minDate or vm.maxDate) and vm.minDate isnt vm.maxDate

    vm.lastWeekTransactions = ->
      vm.tags = []
      weekBefore = (new Date()).setDate((new Date()).getDate() - 7)
      today = (new Date()).getTime()
      vm.filterByDate weekBefore, today

    vm.lastMonthTransactions = ->
      vm.tags = []
      monthBefore = (new Date()).setDate((new Date()).getDate() - 30)
      today = (new Date()).getTime()
      vm.filterByDate monthBefore, today

    showImage = (imgUrl) ->
      $rootScope.showImage = true
      $rootScope.imgUrl = imgUrl

    vm.downloadExcel = ->
      return  if vm.excelProgress
      vm.excelProgress = true
      transactionService.getExcelFile(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto).success ->
        vm.excelProgress = false

    vm.loadMoreTransactions = ->
      return  if vm.isLoading or vm.richedTheEnd
      vm.isLoading = true
      transactionService.getTransaxns(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
      .success (result) ->
        loadedTransactions = result.transactions
        vm.total = result.total
        if loadedTransactions and loadedTransactions.length and loadedTransactions.length > vm.trs.length
          vm.trs = loadedTransactions
        else
          vm.richedTheEnd = true
        common.$timeout ->
          console.log "more trs attached"
          vm.isLoading = false
      .error ->
        vm.isLoading = false
        logError "error loading next batch"

    filtersHeight = 0
    vm.toggleFiltering = ->
      dropFilters()  if vm.isFiltering and filtersApplied()
      vm.isFiltering = not vm.isFiltering
      common.$timeout ->
        if vm.isFiltering
          filtersHeight = $(".filters").height()
          vm.widgetHeight += filtersHeight
        else
          vm.widgetHeight -= filtersHeight

    vm.toggleEditingMobile = ->
      vm.editedTnx = transactionService.copy(vm.selectedTnx)
      vm.editedTnx.dateTime = date.format(vm.selectedTnx.timestamp)
      vm.editingMobile = true

    vm.saveTnx = (transaction) ->
      return  if $(document.activeElement).parent().is(".tags")
      if transaction.new
        transactionService.create(transaction).then (createdTxn) ->
          transaction.latitude = createdTxn.latitude
          transaction.longitude = createdTxn.longitude
          transaction.new = false
      else
        transactionService.update(transaction).then (->
          vm.editing = false  if vm.editing
          if vm.editingMobile
            vm.editingMobile = false
            transactionService.copy transaction, vm.selectedTnx
        ), (msg) ->
          vm.editError = msg


    vm.remove = (transaction) ->
      if _transactionEmpty(transaction)
        removeTransaction transaction
      else removeTransaction transaction  if confirm("Удалить запись?")

    vm.addTnx = ->
      newTransactionIsValid = validateAndAddErrors()
      return  unless newTransactionIsValid
      transactionService.create(vm.newTnx).then ((tnx) ->
        vm.trs.unshift tnx
        vm.newTnx = {}
      ), (msg) ->
        vm.createError = msg

    vm.addTag = (tagText) ->
      return  if _tagIsAlreadyAdded(tagText)
      vm.tags.push text: tagText
      vm.toggleFiltering()  unless vm.isFiltering
      applyfilters()

    $rootScope.$on commonConfig.config.localeChange, (event, data) ->
      if data.locale is "ru"
        $(".tags-td .host .input").attr("placeholder", translationsRu.ADD_TAG).css "width", "110px"
        $(".tags-filter .host .input").attr "placeholder", translationsRu.SEARCH_BY_TAGS
      else
        $(".tags-td .host .input").attr("placeholder", translationsEn.ADD_TAG).css "width", "60px"
        $(".tags-filter .host .input").attr "placeholder", translationsEn.SEARCH_BY_TAGS

    $scope.$on "$destroy", ->
      vm.trs = []
      transactionService.destroy()

    activate()
    return
]