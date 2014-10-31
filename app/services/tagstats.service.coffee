angular.module('app').factory 'tagstats.service', ['tag.service', 'common', 'datacontext',
  (tagService, common, datacontext) ->
    new class TagStatsService
      maxBarWidth = 290
      ratio = 1

      getBarWidth: (percent) -> ((percent / 100) * maxBarWidth) * ratio + 'px'

      getTagStats: (min, max, includeTags, excludeTags)->
        def = common.defer()
        datacontext
          .getTagsExpenses(min, max, includeTags, excludeTags)
          .success (data) ->
            stats = data
            maxPercent = (stats.reduce ((a, b) -> if a.percent > b.percent then a else b), 0).percent
            longestBar = (maxPercent / 100) * maxBarWidth
            ratio = maxBarWidth / longestBar

            for tagstat in stats
              tagstat.tags = tagService.colorAndSaveTags tagstat.tags
              def.resolve stats

          .error ->
            def.reject()

          def.promise
      ]
