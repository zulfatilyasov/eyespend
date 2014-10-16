class @BaseCtrl
    constructor: (@common)->
    
    activate: (promises, controllerId)->
        return @common.activateController(promises, controllerId)
                        .then -> console.log 'activated ' + controllerId
    register: (deps, name, module, controller) ->
        app.module(module).controller(name, deps, controller)
    
controllerId = 'shell'
angular
    .module 'app'
    .controller(controllerId, ['common', 'debounce', '$rootScope', 'tmhDynamicLocale', 'config', 'login', '$translate', 'cookie',
        class ShellCtrl extends BaseCtrl
            # register(['common', 'debounce', '$rootScope'], controllerId, 'app', @)
            constructor: (common, debounce, $rootScope, tmhDynamicLocale, config, login, $translate, @cookie) ->
                super common
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

                $rootScope.$on '$routeChangeStart' , (event, next) ->
                    toggleSpinner on if next.$$route.originalPath == '/'

                $rootScope.$on events.controllerActivateSuccess, ->
                    toggleSpinner off

                $rootScope.$on events.spinnerToggle, (event, data) ->
                    toggleSpinner on 
         
                @activate([], controllerId)
                    .then ->
                        $rootScope.lang = config.local

                @togglePopover = ->
                    @langsOpen = !@langsOpen

                @translate = (lang) ->
                    config.local = lang
                    cookie.set 'lang', lang
                    $translate.use lang
                    if lang == 'ru' then moment.locale lang else moment.locale 'en-gb'
                    tmhDynamicLocale.set lang
                    $rootScope.lang = lang
                    @togglePopover()

            
    ])