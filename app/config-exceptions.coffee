extendExceptionHandler = ($delegate, config, logger) ->
  appErrorPrefix = config.appErrorPrefix
  logError = logger.getLogFn("app", "error")
  (exception, cause) ->
    $delegate exception, cause
    throw exception
  # if (appErrorPrefix && exception.message.indexOf(appErrorPrefix) === 0) { return; }

  #    var errorData = { exception: exception, cause: cause };
  #    var msg = appErrorPrefix + exception.message;
  #    logError(msg, errorData, true);
                 
app = angular.module("app")
app.config [
  "$provide"
  ($provide) ->
    $provide.decorator "$exceptionHandler", [
      "$delegate"
      "config"
      "logger"
      extendExceptionHandler
    ]
]