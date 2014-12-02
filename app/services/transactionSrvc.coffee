serviceId = "transaction.service"
angular.module("app").factory serviceId, [
  "datacontext"
  "common"
  "rcolor"
  "date"
  "$rootScope"
  "map"
  "tag.service"
  (
    datacontext
    common
    rcolor
    date
    $rootScope
    map
    tagSerivce
  ) ->
    transactions = []
    _userTags = []
    offset = 0
    count = 30
    sortOptions =
      column: "timestamp"
      descending: true


    sortByDateDesc = (a, b) ->
      d1 = parseInt(a.timestamp)
      d2 = parseInt(b.timestamp)
      if d1 > d2
        -1
      else if d1 < d2
        1
      else
        0

    updateSorting = (column) ->
      if sortOptions.column is column
        sortOptions.descending = not sortOptions.descending
      else
        sortOptions.column = column
        sortOptions.descending = false
      sortOptions

    sort = (fromDate, toDate, tags, onlyWithPhoto) ->
      def = common.defer()
      offset = 0
      tagsArray = _convertTagsToArray(tags)
      datacontext
      .getTransaxns(sortOptions.column, sortOptions.descending,
       offset, count, fromDate or "", toDate or "", tagsArray, onlyWithPhoto)
      .success (data) ->
        sortedTransactions = data.transactions
        extendTransactions sortedTransactions
        offset = sortedTransactions.length
        transactions = sortedTransactions
        def.resolve
          transactions: angular.copy(transactions)
          total: data.total

      def.promise

    extendTransactions = (transactions) ->
      angular.forEach transactions, (t) ->
        t.date = date.withoutTimeShort(t.timestamp)
        t.time = date.onlyTime(t.timestamp)
        t.tags = tagSerivce.colorAndSaveTags(t.tags)

    getUserTags = ->
      tagSerivce.getUserTags()

    getTransactionIndex = (transactionId, array) ->
      i = 0
      len = array.length

      while i < len
        return i  if array[i].id is transactionId
        i++
      return

    getExcelFile = (fromDate, toDate, tags, withPhoto) ->
      tagsArray = _convertTagsToArray(tags)
      datacontext
      .getExcelFileUrl(sortOptions.column, sortOptions.descending, offset,
       count, fromDate or "", toDate or "", tagsArray, withPhoto)
      .success (data) ->
        location.href = data.url

    getSortingForColumn = (column) ->
      if sortOptions.column isnt column
        "sorting"
      else
        if sortOptions.descending is true
          "sorting_desc"
        else if sortOptions.descending is false
          "sorting_asc"
        else
          ""

    _convertTagsToArray = (tags) ->
      result = []
      return result  unless tags
      i = 0
      len = tags.length

      while i < len
        result.push tags[i].text
        i++
      result

    getFirstPageWithFilters = (fromDate, toDate, tags, withPhoto) ->
      offset = 0
      getTransaxns fromDate, toDate, tags, withPhoto

    getTransaxns = (fromDate, toDate, tags, withPhoto) ->
      def = common.defer()
      tagsArray = _convertTagsToArray(tags)
      datacontext
      .getTransaxns(sortOptions.column, sortOptions.descending, offset, count,
        fromDate = "", toDate = "", tagsArray, withPhoto)
      .then ((resp) ->
        trs = resp.data.transactions
        total = resp.data.total
        if trs and trs instanceof Array
          if offset > 0
            transactions = transactions.concat(trs)
            offset += trs.length
          else
            transactions = trs
            offset = trs.length
          extendTransactions transactions
          def.resolve data:
            transactions: angular.copy(transactions)
            total: total
        else
          def.reject()
        return
      ), (resp) ->
        console.log resp

      def.promise

    getLocalTransaxns = ->
      angular.copy transactions

    copy = (source, target) ->
      target = {}  unless target
      target.id = source.id
      target.amountInBaseCurrency = source.amountInBaseCurrency
      target.latitude = source.latitude
      target.longitude = source.longitude
      target.timestamp = source.timestamp
      target.date = source.date
      target.time = source.time
      target.timeOffset = source.timeOffset
      target.tags = angular.copy(source.tags)
      target.tags = tagSerivce.colorAndSaveTags(target.tags)
      target

    getTransasctionById = (id) ->
      i = 0
      len = transactions.length

      while i < len
        return copy(transactions[i])  if transactions[i].id is id
        i++
      null

    _serverFormatTnx = (tnx) ->
      serverFormattedTnx = angular.copy(tnx)
      serverFormattedTnx.tags = _convertTagsToArray(serverFormattedTnx.tags)
      serverFormattedTnx

    dateTimeToTimestamp = (dateTime) ->
      dateTime = dateTime.replace(/\./g, "")
      dateTime = dateTime.replace(/\s/g, "")
      dateTime = dateTime.replace(/\:/g, "")
      day = dateTime.slice(0, 2)
      month = parseInt(dateTime.slice(2, 4)) - 1
      year = dateTime.slice(4, 8)
      hours = dateTime.slice(8, 10)
      minutes = dateTime.slice(10, 12)
      resultDate = new Date(year, month, day, hours, minutes)
      resultDate.getTime()

    setTxnTime = (txn) ->
      txn.timestamp = dateTimeToTimestamp(txn.dateTime)  if txn.dateTime
      txn.timestamp = date.addTimeToTimestamp(txn.timestamp, txn.time)  if txn.timestamp and txn.time
      txn.timeOffset = date.getTimeZoneOffset()

    create = (tnx) ->
      def = common.$q.defer()
      tnx.amountInBaseCurrency = 0  unless tnx.amountInBaseCurrency
      txnCopy = {}
      setTxnTime tnx
      copy tnx, txnCopy
      txnCopy.timestamp = date.now()  unless txnCopy.timestamp
      extendTransactions [tnx]
      txnCopy.tags = _convertTagsToArray(txnCopy.tags)
      datacontext.createTransaction(txnCopy)
      .then ((response) ->
        createdTnx = response.data
        tnx.id = createdTnx.id
        transactions.push tnx
        def.resolve tnx
      ), ->
        def.reject()

      def.promise

    update = (tnx) ->
      def = common.$q.defer()
      setTxnTime tnx
      tnx.tags = tagSerivce.colorAndSaveTags(tnx.tags)
      datacontext.updateTransaction(_serverFormatTnx(tnx)).then (->
        transaction = transactions.filter((t) ->
          t.id is tnx.id
        )
        unless transaction.length
          console.log "transaction not found"
          def.reject "Не удалось найти транзкцию"
        copy tnx, transaction[0]
        def.resolve()
      ), ->
        def.reject "При сохранении проихошла ошибка."
      def.promise

    remove = (transactionGuid) ->
      def = common.$q.defer()
      datacontext.deleteTransaction(transactionGuid).then (->
        index = getTransactionIndex(transactionGuid, transactions)
        transactions.splice index, 1
        def.resolve()
      ), ->
        def.reject "При удалении произошла ошибка."

      def.promise

    destroy = ->
      transactions = []
      offset = 0
    
    getLocalTransaxns: getLocalTransaxns
    getTransaxns: getTransaxns
    getTransasctionById: getTransasctionById
    updateSorting: updateSorting
    getSortingForColumn: getSortingForColumn
    getFirstPageWithFilters: getFirstPageWithFilters
    create: create
    getUserTags: getUserTags
    sortOptions: sortOptions
    sort: sort
    sortByDateDesc: sortByDateDesc
    update: update
    getTransactionIndex: getTransactionIndex
    remove: remove
    copy: copy
    getExcelFile: getExcelFile
    batchSize: count
    destroy: destroy
]
