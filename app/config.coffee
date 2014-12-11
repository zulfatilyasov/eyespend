app = angular.module("app")


toastr.options.timeOut = 4000
toastr.options.positionClass = "toast-top-right"

cookie =
  get: (name) ->
    matches = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"))
    (if matches then decodeURIComponent(matches[1]) else undefined)

  set: (name, value) ->
    now = new Date()
    yearAfterNow = new Date(new Date(now).setMonth(now.getMonth() + 12))
    document.cookie = name + "=" + value + "; path=/; expires=" + yearAfterNow.toUTCString()

  remove: (name) ->
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;"

app.value "cookie", cookie

getLang = ->
  hostName = window.location.hostname
  (if hostName.indexOf(".com") >= 0 then "en" else "ru")

lang = cookie.get("lang")
lang = getLang()  unless lang

if lang is "ru"
  moment.locale "ru"
else
  moment.locale "en-gb"

events =
  controllerActivateSuccess: "controller.activateSuccess"
  spinnerToggle: "spinner.toggle"
  localeChange: "locale.change"
  locationSet: "location.set"

app.value "config",
  appErrorPrefix: "[HT Error] "
  events: events
  version: "1.0"
  local: lang

app.config [
  "$logProvider"
  ($logProvider) ->
    $logProvider.debugEnabled true  if $logProvider.debugEnabled
]

app.config [
  "tmhDynamicLocaleProvider"
  (tmhDynamicLocaleProvider) ->
    tmhDynamicLocaleProvider.localeLocationPattern "locales/angular-locale_{{locale}}.js"
]

app.config [
  "commonConfigProvider"
  (cfg) ->
    cfg.config.controllerActivateSuccessEvent = events.controllerActivateSuccess
    cfg.config.spinnerToggleEvent = events.spinnerToggle
    cfg.config.localeChange = events.localeChange
]

app.config [
  "$translateProvider"
  ($translateProvider) ->
    $translateProvider
      .translations("ru", translationsRu)
      .translations("en", translationsEn  )
      .preferredLanguage lang
]

app.config ($httpProvider) ->
  $httpProvider.interceptors.push "authInterceptor"