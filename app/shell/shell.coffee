controllerId = 'shell'

angular
    .module 'app'
    .controller controllerId, ['common', 'debounce', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', 'cookie',

        (common, debounce, $rootScope, tmhDynamicLocale, config, login, $translate, cookie) ->
            vm = @
            vm.logout = login.logout
            vm.langsOpen = false
            vm.activePage = 'expenses'
            events = config.events
            $rootScope.showSpinner = false
            $rootScope.showSpinner = false
            $rootScope.lang = config.local
            tmhDynamicLocale.set config.local

            activate = ->
                promises = []
                common
                    .activateController promises, controllerId
                    .then ->
                        $rootScope.lang = config.local

            vm.togglePopover = ->
                vm.langsOpen = !vm.langsOpen

            $rootScope.closeImageOverlay = ->
                $rootScope.showImage = false
                $rootScope.imgUrl = ''

            vm.translate = (lang)->
                config.local = lang
                cookie.set 'lang', lang
                $translate.use lang
                if lang == 'ru' then moment.locale lang else moment.locale 'en-gb'
                tmhDynamicLocale.set lang
                $rootScope.lang = lang
                vm.togglePopover()

            toggleSpinner = (enable) ->
                $rootScope.showSpinner = enable

            $rootScope.$on '$routeChangeStart' , (event, next) ->
                toggleSpinner on if next.$$route.originalPath == '/'

            $rootScope.$on events.controllerActivateSuccess, ->
                toggleSpinner off

            $rootScope.$on events.spinnerToggle , (event, data) ->
                toggleSpinner on 

            activate()
            return
 	]