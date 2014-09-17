(function () {
  'use strict';
  var controllerId = 'transactions';
  angular.module('app').controller(controllerId, ['common', '$window', 'config', '$rootScope', '$scope', 'date', 'transaxns', '$translate', 'login', 'debounce', 'map', transactions]);

  function transactions(common, $window, config, $rootScope, $scope, date, transaxns, $translate, login, debounce, map) {
    var vm = this;
    var logInfo = common.logger.getLogFn(controllerId, 'log');
    var logError = common.logger.getLogFn(controllerId, 'logError');
    var fromUnixDate = null;
    var toUnixDate = null;
    vm.tags = [];
    vm.trs = [];
    vm.newTransactions = [];
    vm.newTnx = {
      latitude: null,
      longitude: null
    };
    vm.withPhotoVal = false;
    vm.onlyWithPhoto = false;
    vm.isAdding = false;
    vm.isFiltering = false;
    vm.selectedTnx = null;
    vm.sort = null;
    vm.showTransactionForm = false;
    vm.showFilterForm = false;
    vm.curDateTime = date.withoutTime(date.now());
    vm.isLoading = false;
    if ($(window).width() > 480) {
      setWidgetAndTableHeight();
    }

    function setWidgetAndTableHeight() {
      vm.tableHeight = getTableHeight();
      vm.widgetHeight = vm.tableHeight + 73;
    }

    function getTableHeight() {
      var theight = $window.innerHeight - 208;
      return theight - (theight % 42);
    }

    vm.getTagColorStyle = function (color) {
      return 'transparent ' + color + ' transparent transparent';
    };

    $(window).resize(function () {
      $scope.$apply(function () {
        setWidgetAndTableHeight();
      });
    });


    $scope.$watch('vm.filterDateRange', function (newVal) {
      if (!newVal || !newVal.startDate || !newVal.endDate)
        return;

      vm.filterByDate(newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000);
    });

    $scope.$watch('vm.filterMobileDateRange', function (newVal) {
      if (!newVal || !newVal.startDate || !newVal.endDate)
        return;

      setDates(newVal.startDate.unix() * 1000, newVal.endDate.unix() * 1000);
    });

    $scope.$watch('vm.withPhotoVal', function (newVal, oldVal) {
      if (newVal == oldVal)
        return;
      $rootScope.showSpinner = true;
      vm.onlyWithPhoto = newVal;
      transaxns.getFirstPageWithFilters(fromUnixDate, toUnixDate, vm.tags, newVal)
        .success(function (data) {
          $rootScope.showSpinner = false;
          vm.trs = data.transactions;
          vm.total = data.total;
        });
    });

    $scope.$watch('vm.onlyWithPhotoMobile', function (newVal, oldVal) {
      if (newVal == oldVal)
        return;
      vm.onlyWithPhoto = newVal;
    });

    function validateAndAddErrors() {
      if ($scope.newTransactionForm && !$scope.newTransactionForm.$valid) {
        $translate('CHECK_FORM_DATA').then(function (msg) {
          vm.createError = msg;
        });
        return false;
      }
      if (!vm.newTnx) {
        vm.createError = "некорректные данные";
        return false;
      }
      return true;
    }

    var selectTransaction = function (transaction) {
      if (vm.editing) {
        vm.editing = false;
        var original = transaxns.getTransasctionById(vm.selectedTnx.id);
        transaxns.copy(original, vm.selectedTnx)
      }
      vm.selectedTnx = transaction;
    };
    vm.addNewTxn = function (isDesktop) {
      var timestamp = date.now();
      if (isDesktop)
        vm.trs.unshift({
          timestamp: timestamp,
          date: date.withoutTimeShort(timestamp),
          time: date.onlyTime(timestamp),
          new: true
        });
      vm.newTnx.dateTime = date.format(timestamp);
      if (vm.isAdding == false)
        vm.isAdding = true;
    };

    vm.tableClicked = function ($event) {
      if ($event.target) {
        var $target = $($event.target);
        var $tr = $target.parents('tr');
        var index = parseInt($tr.attr('data-index'));
        var transaction = vm.trs[index];

        if (!transaction)
          return;

        if ($target.is('.edit-transaction') && vm.selectedTnx && vm.selectedTnx.id === transaction.id) {
          vm.editTransaction(index);
        } else if ($target.is('.showMap')) {
          map.showAddress(transaction);
        } else if ($target.is('.pickAddress')) {
          map.pickAddress(transaction);
        } else if ($target.is('.showPicture')) {
          showImage(transaction.imgUrl)
        } else if ($target.is('.save')) {
          vm.saveTnx(transaction)
        } else if ($target.is('.remove-tr')) {
          vm.remove(transaction);
        } else if ($target.is('.transaction-tag')) {
          var text = $target.text().trim();
          vm.addTag(text);
        } else if (!$tr.is('.edited')) {
          selectTransaction(transaction);
        }
      }
    };

    vm.editTransaction = function (index) {
      vm.editing = true;
      common.$timeout(function () {
        $("[data-index='" + index + "']").find('.amount').focus();
      });
    };

    vm.showAddress = map.showAddress;
    vm.pickAddress = map.pickAddress;

    vm.closeMobileInfo = function () {
      if (vm.editingMobile) {
        vm.editingMobile = false;
      }
      if (vm.isAdding)
        vm.isAdding = false;
      vm.selectedTnx = null;
    };

    vm.changeSorting = function (column) {
      vm.sort = transaxns.updateSorting(column);
      $rootScope.showSpinner = true;
      transaxns.sort(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
        .success(function (data) {
          vm.trs = data.transactions;
          vm.total = data.total;
          vm.richedTheEnd = vm.trs.length < transaxns.batchSize;
          $rootScope.showSpinner = false;
        });
    };

    vm.loadTags = function () {
      var def = common.defer();
      login.getUserTags()
        .then(function (data) {
          if (vm.userTags) {
            def.resolve(data);
            return;
          }
          vm.userTags = angular.copy(data);
          vm.selectedTag = vm.userTags[0];
          def.resolve(vm.userTags);
        });
      return def.promise;
    };

    vm.getSortingForColumn = transaxns.getSortingForColumn;

    vm.tagFilterChange = debounce(applyfilters, 0, false);

    moment.locale(config.local);

    if (config.local == 'ru') {
      moment.locale('ru');

      vm.datePickerTexts = {
        cancelLabel: 'Отмена',
        applyLabel: 'ok',
        fromLabel: 'От',
        toLabel: 'До',
        customRangeLabel: 'Выбрать интервал',
        firstDay: 1
      };

      vm.dateRanges = {
        'Последние 7 дней': [moment().subtract(6, 'days'), moment()],
        'Последние 30 дней': [moment().subtract(29, 'days'), moment()]
      };
    } else {
      moment.locale('en-gb');

      vm.datePickerTexts = {
        cancelLabel: 'Cancel',
        applyLabel: 'Ok',
        fromLabel: 'From',
        toLabel: 'To',
        firstDay: 0,
        customRangeLabel: 'Select interval'
      };

      vm.dateRanges = {
        'Last 7 days': [moment().subtract(6, 'days'), moment()],
        'Last 30 days': [moment().subtract(29, 'days'), moment()]
      };
    }


    function applyfilters() {
      $rootScope.showSpinner = true;
      transaxns.getFirstPageWithFilters(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
        .success(function (data) {
          $rootScope.showSpinner = false;
          vm.trs = data.transactions;
          vm.total = data.total;
          vm.richedTheEnd = vm.trs.length < transaxns.batchSize;
        })
        .error(function (msg) {
          $rootScope.showSpinner = false;
          logError(msg);
        });
    }

    vm.applyFilters = applyfilters;

    function setDates(fromDate, toDate) {
      if (fromDate) {
        fromUnixDate = fromDate;
        vm.minDate = date.format(fromDate);
      }
      if (toDate) {
        toUnixDate = toDate;
        vm.maxDate = date.format(toDate);
      }
    }

    vm.getTags = function () {
      var tagsStr = "";
      for (var i = 0, len = vm.tags.length; i < len; i++) {
        tagsStr += vm.tags[i].text + "; ";
      }
      return tagsStr;
    };

    vm.filterByDate = function (fromDate, toDate) {
      if (fromDate === toDate)
        return;
      setDates(fromDate, toDate);
      applyfilters();
    };

    vm.showPeriod = function () {
      return (vm.minDate || vm.maxDate) && vm.minDate != vm.maxDate;
    };

    vm.lastWeekTransactions = function () {
      vm.tags = [];
      var weekBefore = (new Date()).setDate((new Date()).getDate() - 7);
      var today = (new Date()).getTime();
      vm.filterByDate(weekBefore, today);
    };

    vm.lastMonthTransactions = function () {
      vm.tags = [];
      var monthBefore = (new Date()).setDate((new Date()).getDate() - 30);
      var today = (new Date()).getTime();
      vm.filterByDate(monthBefore, today);
    };

    function _tagIsAlreadyAdded(tag) {
      return vm.tags.some(function (t) {
        return t.text === tag;
      });
    }

    var showImage = function (imgUrl) {
      $rootScope.showImage = true;
      $rootScope.imgUrl = imgUrl;
    };

    vm.downloadExcel = function () {
      transaxns.getExcelFile(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto);
    };

    vm.loadMoreTransactions = function () {
      if (vm.isLoading || vm.richedTheEnd)
        return;
      vm.isLoading = true;
      transaxns.getTransaxns(fromUnixDate, toUnixDate, vm.tags, vm.onlyWithPhoto)
        .success(function (result) {
          var loadedTransactions = result.transactions;
          vm.total = result.total;
          if (loadedTransactions && loadedTransactions.length && loadedTransactions.length > vm.trs.length) {
            vm.trs = loadedTransactions;
          } else {
            vm.richedTheEnd = true;
          }
          common.$timeout(function () {
            console.log('more trs attached');
            vm.isLoading = false;
          });
        })
        .error(function () {
          vm.isLoading = false;
          logError('error loading next batch');
        });
    };

    function dropFilters() {
      vm.tags = [];
      setDates(9, 9);
      applyfilters();
      vm.filterDateRange = null;
      vm.richedTheEnd = false;
    }

    function filtersApplied() {
      return vm.tags.length || (vm.filterDateRange && fromUnixDate !== toUnixDate);
    }

    var filtersHeight = 0;
    vm.toggleFiltering = function () {
      if (vm.isFiltering && filtersApplied()) {
        dropFilters();
      }
      vm.isFiltering = !vm.isFiltering;
      common.$timeout(function () {
        if (vm.isFiltering) {
          filtersHeight = $('.filters').height();
          vm.widgetHeight += filtersHeight;
        } else
          vm.widgetHeight -= filtersHeight;
      });
    };

    vm.toggleEditingMobile = function () {
      vm.editedTnx = transaxns.copy(vm.selectedTnx);
      vm.editedTnx.dateTime = date.format(vm.selectedTnx.timestamp);
      vm.editingMobile = true;
    };

    vm.saveTnx = function (transaction) {
      if ($(document.activeElement).parent().is('.tags'))
        return;
      if (transaction.new) {
        return transaxns.create(transaction)
          .then(function (createdTxn) {
            transaction.latitude = createdTxn.latitude;
            transaction.longitude = createdTxn.longitude;
            transaction.new = false;
          });
      } else {
        return transaxns.update(transaction)
          .then(function () {
            if (vm.editing)
              vm.editing = false;
            if (vm.editingMobile) {
              vm.editingMobile = false;
              transaxns.copy(transaction, vm.selectedTnx);
            }
          },
          function (msg) {
            vm.editError = msg;
          }
        );
      }
    };

    function removeTransaction(transaction) {
      if (transaction.new) {
        removeTransactionById(transaction.id);
        return;
      }

      if (!vm.selectedTnx || !transaction || vm.selectedTnx.id !== transaction.id)
        return;

      transaxns.remove(vm.selectedTnx.id)
        .then(function () {
          if (vm.editing) {
            vm.editing = false;
          }
          if (vm.editingMobile) {
            vm.editingMobile = false;
          }
          removeTransactionById(vm.selectedTnx.id);
          vm.selectedTnx = null;
        },
        function (msg) {
          logError(msg);
        }
      );
    }

    vm.remove = function (transaction) {
      if (confirm("Удалить запись?")) {
        removeTransaction(transaction);
      }
    };

    function removeTransactionById(id) {
      var index = transaxns.getTransactionIndex(id, vm.trs);
      vm.trs.splice(index, 1);
    }

    vm.addTnx = function () {
      var newTransactionIsValid = validateAndAddErrors();
      if (!newTransactionIsValid)
        return;

      transaxns.create(vm.newTnx)
        .then(function (tnx) {
          vm.trs.unshift(tnx);
          vm.newTnx = {};
        },
        function (msg) {
          vm.createError = msg;
        }
      );
    };

    vm.addTag = function (tagText) {
      if (_tagIsAlreadyAdded(tagText)) {
        return;
      }
      vm.tags.push({
        text: tagText
      });
      if (!vm.isFiltering)
        vm.isFiltering = true;
      applyfilters();
    };

    function _getTransactions() {
      vm.isLoading = true;
      return transaxns.getTransaxns()
        .success(function (data) {
          vm.trs = data.transactions;
          vm.total = data.total;
          vm.sort = transaxns.sortOptions;
          if (vm.trs.length < transaxns.batchSize) {
            vm.richedTheEnd = true;
          }
          common.$timeout(function () {
            vm.isLoading = false;
          });
        });
    }

    function activate() {
      var promises = [_getTransactions(), vm.loadTags()];
      $rootScope.showSpinner = true;
      common.activateController(promises, controllerId)
        .then(function () {
          vm.transactionsLoaded = true;
          $rootScope.showSpinner = false;
          $(".nano").debounce("update", function (event, values) {
            if (values.maximum == values.position) {
              vm.loadMoreTransactions();
            }
          }, 100);
        });
    }

    $scope.$on('$destroy', function () {
      vm.trs = [];
      transaxns.destroy();
    });

    activate();
  }
})
();
