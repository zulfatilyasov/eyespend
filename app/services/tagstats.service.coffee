angular.module('app').factory 'tagstats.service', 
 ['tag.service', 'common', 'datacontext',

 (tagService, common, datacontext) ->
    new class tagStatsService
        maxBarWidth = 362
        offset = 80
        strech = 0

        getBarWidth : (percent) -> (percent / 100) * maxBarWidth +  'px'

        getTagStats : (min,max)->
            def = common.defer()
            datacontext
                .getTagsExpenses(min, max, [])
                .success (data) ->
                    stats =  data.slice(0, 11)
                    # maxPercent = (stats.reduce (a,b) -> if a.percent > b.percent then a else b).percent
                    # maxWidth = (maxPercent / 100) * maxBarWidth
                    # strech = maxBarWidth  - offset - maxWidth if maxWidth < maxBarWidth - offset 

                    for tagstat in stats
                        tagstat.tags = tagService.colorAndSaveTags tagstat.tags
                    def.resolve stats

                .error ->
                    def.reject()
                
                

            def.promise            
       ]