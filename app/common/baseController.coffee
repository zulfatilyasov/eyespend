class @BaseCtrl
	constructor: (@common)->

	getName = (fun) ->
		ret = fun.toString()
		ret = ret.substr 'function '.length
		ret.substr 0, ret.indexOf '('

	activate: (promises)->
		return @common.activateController(promises, getName @constructor)
		.then -> console.log 'activated ' + getName @constructor

	@register: (moduleName = 'app') ->
		angular.module(moduleName).controller(getName(@), @)

	@inject: (args...) ->
		@$inject = args
