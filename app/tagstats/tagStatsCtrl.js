// Generated by CoffeeScript 1.8.0
(function () {
	var TagStatsCtrl,
			__hasProp = {}.hasOwnProperty,
			__extends = function (child, parent) {
				for (var key in parent) {
					if (__hasProp.call(parent, key)) child[key] = parent[key];
				}
				function ctor() {
					this.constructor = child;
				}

				ctor.prototype = parent.prototype;
				child.prototype = new ctor();
				child.__super__ = parent.prototype;
				return child;
			};

	TagStatsCtrl = (function (_super) {
		__extends(TagStatsCtrl, _super);

		TagStatsCtrl.register();

		TagStatsCtrl.inject('common', '$rootScope', '$scope', '$interval', 'datacontext', 'stats.service', 'miniChartOption', 'tag.service', 'datepicker.service', 'tagstats.service', 'login.service');

		function TagStatsCtrl(common, $rootScope, $scope, $interval, datacontext, statsService, miniChartOption, tagService, datepicker, tagStatsService, login) {
			var fromDate, getStatsMap, getTagsExpenses, refreshTagsExpenses, showBars, stripTags, toDate, vm;
			this.common = common;
			vm = this;
			vm.tagStats = null;
			vm.includeTags = [];
			vm.excludeTags = [];
			fromDate = null;
			toDate = null;
			vm.sliderValuesChanged = function (e, data) {
				fromDate = data.values.min.getTime() / 1000;
				toDate = data.values.max.getTime() / 1000;
				refreshTagsExpenses(fromDate, toDate);
				return $rootScope.$apply(function () {
					vm.sliderRangeStart = data.values.min;
					return vm.sliderRangeEnd = data.values.max;
				});
			};
			vm.sliderValuesChanging = function (e, data) {
				fromDate = data.values.min.getTime();
				return toDate = data.values.max.getTime();
			};
			vm.loadTags = function () {
				var def;
				def = common.defer();
				login.getUserTags().then(function (data) {
					return def.resolve(data);
				});
				return def.promise;
			};
			stripTags = function (tags) {
				return tags.map(function (tag) {
					return tag.text;
				});
			};
			vm.tagFilterChange = function () {
				var stripedExcludeTags, stripedIncludeTags;
				stripedIncludeTags = stripTags(vm.includeTags);
				stripedExcludeTags = stripTags(vm.excludeTags);
				return refreshTagsExpenses(fromDate, toDate, stripedIncludeTags, stripedExcludeTags);
			};
			vm.datePickerTexts = datepicker.getTexts();
			vm.dateRanges = datepicker.getRanges();
			$scope.$watch('vm.chartDateRange', function (newVal) {
				if (!vm.tagStats || !newVal || !newVal.startDate || !newVal.endDate) {
					return;
				}
				fromDate = newVal.startDate.unix();
				toDate = newVal.endDate.unix();
				return refreshTagsExpenses(fromDate, toDate);
			});
			vm.miniOptions = miniChartOption;
			vm.getBarWidth = tagStatsService.getBarWidth;
			vm.getTagColorStyle = tagService.getTagColorStyle;
			refreshTagsExpenses = function (from, to, includedTags, excludedTags) {
				return getTagsExpenses(from, to, includedTags, excludedTags).then(function () {
					showBars();
					return vm.setSliderValues(new Date(from * 1000), new Date(to * 1000));
				});
			};
			getTagsExpenses = function (min, max, includedTags, excludedTags) {
				if (includedTags == null) {
					includedTags = [];
				}
				if (excludedTags == null) {
					excludedTags = [];
				}
				return tagStatsService.getTagStats(min, max, includedTags, excludedTags).success(function (data) {
					return vm.tagStats = data;
				});
			};
			getStatsMap = function () {
				return statsService.transactionsForChart().success(function (data) {
					var maxDate, minDate;
					minDate = statsService.minDate();
					maxDate = statsService.maxDate();
					vm.chartDateRange = {
						startDate: moment(minDate),
						endDate: moment(maxDate)
					};
					vm.miniData = data;
					vm.initializeSlider({
						defaultValues: {
							min: new Date(minDate),
							max: new Date(maxDate)
						},
						bounds: {
							min: new Date(minDate),
							max: new Date(maxDate)
						},
						step: {
							days: 1
						},
						arrows: false
					});
					return getTagsExpenses(minDate / 1000, maxDate / 1000);
				});
			};
			showBars = function () {
				var callback;
				callback = function () {
					return $('.bar-wrap').addClass('open');
				};
				return common.$timeout(callback, 200);
			};
			this.activate([getStatsMap()]).then(function () {
				return showBars();
			});
		}

		return TagStatsCtrl;

	})(BaseCtrl);

}).call(this);

//# sourceMappingURL=tagStatsCtrl.js.map