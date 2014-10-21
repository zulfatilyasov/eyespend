class Shell extends BaseCtrl
    @register()
    @inject 'common', 'debounce', '$rootScope', 'tmhDynamicLocale', 'config', 'login.service', '$translate', 'cookie'
    constructor: (@common, debounce, $rootScope, tmhDynamicLocale, config, login, $translate, cookie) ->
        @logout = login.logout
        @langsOpen = false
        @activePage = 'expenses'
        events = config.events
        $rootScope.showSpinner = false
        $rootScope.showSpinner = false
        $rootScope.lang = config.local
        tmhDynamicLocale.set config.local

        $rootScope.closeImageOverlay = ->
            $rootScope.showImage = false
            $rootScope.imgUrl = ''

        toggleSpinner = (enable) ->
            $rootScope.showSpinner = enable

        @togglePopover = ->
            @langsOpen = !@langsOpen

        @translate = (lang) ->
            $rootScope.lang = config.local = lang
            cookie.set 'lang', lang
            $translate.use lang
            if lang == 'ru' then moment.locale lang else moment.locale 'en-gb'
            tmhDynamicLocale.set lang
            @togglePopover()

        $rootScope.$on '$routeChangeStart' , (event, next) ->
            toggleSpinner on if next.$$route.originalPath == '/'

        $rootScope.$on events.controllerActivateSuccess, ->
            toggleSpinner off

        $rootScope.$on events.spinnerToggle, (event, data) ->
            toggleSpinner on

        @activate([])
            .then ->
                $rootScope.lang = config.local

