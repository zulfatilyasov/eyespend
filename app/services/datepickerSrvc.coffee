angular.module('app').factory 'datepicker.service', ['config', (config) ->
    new class DatePickerSrvc
        getTexts : ->
            if config.local is 'ru'
                cancelLabel: 'Отмена'
                applyLabel: 'ok'
                fromLabel: 'От'
                toLabel: 'До'
                customRangeLabel: 'Выбрать интервал'
                firstDay: 1
            else
                cancelLabel: 'Cancel'
                applyLabel: 'Ok'
                fromLabel: 'From'
                toLabel: 'To'
                firstDay: 0
                customRangeLabel: 'Select interval'

        getRanges : ->
            if config.local is 'ru'
                'Последние 7 дней': [moment().subtract(6, 'days'), moment()]
                'Последние 30 дней': [moment().subtract(29, 'days'), moment()]
            else
                'Last 7 days': [moment().subtract(6, 'days'), moment()]
                'Last 30 days': [moment().subtract(29, 'days'), moment()]
       ]