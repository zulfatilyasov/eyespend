angular.module('app').factory 'tag.service', ['rcolor', (rcolor) ->
    new class TagService
        _userTags = []

        _getTagColor = (tagText) ->
            tag = (tg for tg in _userTags when tg.text is tagText)
            if tag.length and tag[0].color then tag[0].color else rcolor.get()

        _userTagsContains = (tag) ->
            return true for t in _userTags when t.text is tag.text

        colorAndSaveTags : (tags) ->
            if not tags then return
            for tag in tags
                if tag.text
                    tag.color = _getTagColor tag.text
                else
                    text = tag
                    tag =
                        text: text
                        color: _getTagColor(text)

                _userTags.push angular.copy(tag) unless _userTagsContains tag

                tag

        getTagColorStyle : (color) -> 'rgba(255,255,255,0)' + color + 'rgba(255,255,255,0) rgba(255,255,255,0)'

        getUserTags : ->
            _userTags
]
