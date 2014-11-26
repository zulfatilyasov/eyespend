serviceId = "stats.service"
angular.module("app").factory serviceId, [
  "datacontext"
  "common"
  "date"
  (
    datacontext
    common
    date
  ) ->
    transactions = null
    reducedTransactions = []

    transactionsForChart = (timeOffset) ->
      def = common.defer()
      datacontext.getTransactionsForChart(timeOffset)
      .success (data) ->
        transactions = []
        i = 0

        while i < data.length
          transactions.push
            value: data[i].amountInBaseCurrency
            x: date.toUTC(new Date(data[i].date))

          i++
        def.resolve transactions
      .error ->
        def.reject()

      def.promise

    changeDateRange = (fromDate, toDate, interval) ->
      source = (if interval is "day" then transactions else reducedTransactions)
      return source  if not fromDate and not toDate
      source.filter (t) ->
        timestamp = t.x.getTime()
        timestamp <= toDate and timestamp >= fromDate

    minDate = ->
      first = transactions[0]
      first.x.getTime()

    maxDate = ->
      last = transactions[transactions.length - 1]
      last.x.getTime()

    # adjust when day is sunday
    sumOnInterval = (fromDate, toDate) ->
      intervalSum = 0
      i = 0

      while i < transactions.length
        intervalSum += transactions[i].value  if transactions[i].x <= toDate and transactions[i].x >= fromDate
        i++
      intervalSum

    reducePoints = (interval) ->
      return transactions  if not interval or interval is "day"
      reducedTransactions = []
      minDateUnix = minDate()
      maxDateUnix = maxDate()
      minD = new Date(minDateUnix)
      curDate = (if interval is "week" then minD.getMonday() else minD.getFirstDayOfMonth())
      curDateUnix = curDate.getTime()
      i = 0

      while curDateUnix < maxDateUnix
        nextDate = curDate.getNextDate(interval)
        intervalSum = sumOnInterval(curDateUnix, nextDate.getTime())
        reducedTransactions.push
          value: Math.floor(intervalSum)
          x: new Date(curDateUnix)

        curDate = nextDate.addDays(1)
        curDateUnix = curDate.getTime()
        i++
      reducedTransactions

    Date::addDays = (days) ->
      dat = new Date(@valueOf())
      dat.setDate dat.getDate() + days
      dat

    Date::getMonday = ->
      d = new Date(@valueOf())
      day = d.getDay()
      diff = d.getDate() - day + ((if day is 0 then -6 else 1))
      new Date(d.setDate(diff))

    Date::getFirstDayOfMonth = ->
      date = new Date(@valueOf())
      y = date.getFullYear()
      m = date.getMonth()
      new Date(y, m, 1)

    Date::getLastDayOfMonth = ->
      date = new Date(@valueOf())
      y = date.getFullYear()
      m = date.getMonth()
      new Date(y, m + 1, 0)

    Date::getNextDate = (interval) ->
      curDate = new Date(@valueOf())
      return curDate.addDays(6)  if interval is "week"
      curDate.getLastDayOfMonth()  if interval is "month"

    transactionsForChart: transactionsForChart
    changeDateRange: changeDateRange
    minDate: minDate
    maxDate: maxDate
    reducePoints: reducePoints
]
