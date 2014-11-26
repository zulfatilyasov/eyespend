angular.module('app').factory 'date',
  ['$filter', ($filter) ->
    new class DateSrv
      dateFilter = $filter 'date'
      now: ->
        (new Date()).getTime()

      toUnix: (date)->
        (new Date date).getTime()

      withoutTime: (date)->
        dateFilter date, 'dd MMMM yyyy'

      withoutTimeShort: (date)->
        dateFilter date, 'dd.MM.yyyy'

      extraSmall: (date)->
        dateFilter date, 'dd.MM.yy'

      onlyTime: (date)->
        dateFilter date, 'HH:mm'

      format: (date)->
        dateFilter date, 'dd.MM.yyyy HH:mm'

      addTimeToTimestamp: (timestamp, time) ->
        d = new Date()
        d.setTime timestamp
        time = time.replace ':', ''
        hours = time.slice 0, 2
        minutes = time.slice 2, 4
        d.setHours hours
        d.setMinutes minutes
        d.getTime()

      getTimeZoneOffset: ->
        offset = new Date().getTimezoneOffset() * -1
        offsetInSeconds = offset * 60

      toUTC: (date) ->
        new Date(date.getUTCFullYear(), date.getUTCMonth(),
        date.getUTCDate(),  date.getUTCHours(), date.getUTCMinutes(),date.getUTCSeconds())
  ]