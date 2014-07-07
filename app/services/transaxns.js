(function () {

    'use strict';

    var serviceId = "transaxns";
    angular.module('app').factory(serviceId, ['datacontext', 'common', 'color', 'date', '$rootScope', 'map', transaxns]);

    function transaxns(datacontext, common, color, date, $rootScope, map) {
        var transactions = [],
            _userTags = [],
            sortOptions = {
                column: 'timestamp',
                descending: true
            },
            offset = 0,
            count = 30;

        function sortByDateDesc(a, b) {
            var d1 = parseInt(a.timestamp);
            var d2 = parseInt(b.timestamp);
            if (d1 > d2) {
                return -1;
            } else if (d1 < d2) {
                return 1;
            } else {
                return 0;
            }
        }

        function updateSorting(column) {
            if (sortOptions.column == column) {
                sortOptions.descending = !sortOptions.descending;
            } else {
                sortOptions.column = column;
                sortOptions.descending = false;
            }
            return sortOptions;
        }

        function sort(fromDate, toDate, tags, onlyWithPhoto) {
            var def = common.defer();

            offset = 0;
            var tagsArray = _convertTagsToArray(tags);
            datacontext.getTransaxns(sortOptions.column, sortOptions.descending, offset, count, fromDate || '', toDate || '', tagsArray, onlyWithPhoto)
                .success(function (data) {
                    var sortedTransactions = data.transactions;
                    angular.forEach(sortedTransactions, function (t) {
                        _colorAndSaveTags(t.tags);
                    });
                    offset = sortedTransactions.length;
                    transactions = sortedTransactions;
                    def.resolve({transactions: transactions.slice(0), total: data.total});
                });

            return def.promise;
        }

        function getUserTags() {
            return _userTags;
        }

        function getTransactionIndex(transactionId, array) {
            for (var i = 0, len = array.length; i < len; i++) {
                if (array[i].id === transactionId) {
                    return i;
                }
            }
        }

        function getExcelFile(fromDate, toDate, tags, withPhoto) {
            var tagsArray = _convertTagsToArray(tags);
            datacontext.getExcelFileUrl(
                sortOptions.column,
                sortOptions.descending,
                offset,
                count,
                    fromDate || '',
                    toDate || '',
                tagsArray,
                withPhoto)
                .success(function (data) {
                    location.href = data;
                });
        }

        function getSortingForColumn(column) {
            if (sortOptions.column !== column) {
                return 'sorting';
            } else {
                if (sortOptions.descending === true) {
                    return 'sorting_desc';
                } else if (sortOptions.descending === false) {
                    return 'sorting_asc';
                } else {
                    return '';
                }
            }
        }

        function _convertTagsToArray(tags) {
            var result = [ ];
            if (!tags)
                return result;
            for (var i = 0, len = tags.length; i < len; i++) {
                result.push(tags[i].text);
            }
            return result;
        }

        function getFirstPageWithFilters(fromDate, toDate, tags, withPhoto) {
            offset = 0;
            return getTransaxns(fromDate, toDate, tags, withPhoto);
        }

        function _colorAndSaveTags(tags) {
            if (!tags)
                return;
            for (var i = tags.length - 1; i >= 0; i--) {
                if (!tags[i].text) {
                    var text = tags[i];
                    tags[i] = {
                        text: text,
                        color: _getTagColor(text)
                    };
                }
                else {
                    tags[i].color = _getTagColor(tags[i].text);
                }
                if (_userTagsContains(tags[i]) === false) {
                    _userTags.push(angular.copy(tags[i]));
                }
            }
        }

        function _userTagsContains(tag) {
            return _userTags.some(function (t) {
                return t.text === tag.text;
            });
        }

        function _getTagColor(tagText) {
            var tag = _userTags.filter(function (t) {
                return t.text === tagText;
            });
            if (tag.length && tag[0].color) {
                return tag[0].color;
            } else {
                return color.get(true, 0.3);
            }
        }


        function getTotalAmout(txns) {
            var sum = 0;
            for (var i = 0; txns && i < txns.length; i++) {
                sum += parseInt(txns[i].amountInBaseCurrency);
            }
            return sum;
        }

        function getTransactionsAndTotals() {
            var def = common.defer();
            datacontext.getTransactionsAndTotals(count)
                .then(function (resp) {
                    var trs = resp.data.transactions;
                    var totals = resp.data.totals;
                    $rootScope.hideContent = false;
                    if (trs && trs instanceof Array) {
                        transactions = trs;
                        offset = transactions.length;
                        transactions.forEach(function (t) {
                            _colorAndSaveTags(t.tags);
                        });
                        def.resolve({data: {transactions: transactions.slice(0), totals: totals}});
                    }
                    else {
                        def.reject();
                    }
                }, function (resp) {
                    console.log(resp)
                });

            return def.promise;
        }

        function getTransaxns(fromDate, toDate, tags, withPhoto) {
            var def = common.defer();

            var tagsArray = _convertTagsToArray(tags);
            datacontext.getTransaxns(sortOptions.column, sortOptions.descending, offset, count, fromDate || '', toDate || '', tagsArray, withPhoto)
                .then(function (resp) {
                    var trs = resp.data.transactions;
                    var total = resp.data.total;
                    $rootScope.hideContent = false;
                    if (trs && trs instanceof Array) {
                        if (offset > 0) {
                            transactions = transactions.concat(trs);
                            offset += trs.length;
                        }
                        else {
                            transactions = trs;
                            offset = trs.length;
                        }
                        transactions.forEach(function (t) {
                            _colorAndSaveTags(t.tags);
                        });
                        def.resolve({data: {transactions: transactions.slice(0), total: total}});
                    }
                    else {
                        def.reject();
                    }
                }, function (resp) {
                    console.log(resp)
                });

            return def.promise;
        }

        function getLocalTransaxns() {
            return transactions.slice(0);
        }

        function copy(source, target) {
            if (!target)
                target = {};
            target.id = source.id;
            target.amountInBaseCurrency = source.amountInBaseCurrency;
            target.latitude = source.latitude;
            target.longitude = source.longitude;
            target.timestamp = source.timestamp;
            target.tags = angular.copy(source.tags);
//            target.tags = [];
//            for (var i = 0, len = source.tags.length; i < len; i++) {
//                target.tags.push({
//                    text: source.tags[i].text
//                });
//            }
            _colorAndSaveTags(target.tags);
        }

        function _serverFormatTnx(tnx) {
            var serverFormattedTnx = angular.copy(tnx);
            serverFormattedTnx.tags = _convertTagsToArray(serverFormattedTnx.tags);
            return serverFormattedTnx;
        }

        function update(tnx) {
            var def = common.$q.defer();
            map.setTransactionCoords(tnx);
            datacontext.updateTransaction(_serverFormatTnx(tnx))
                .then(function () {
                    var transaction = transactions.filter(function (t) {
                        return t.id === tnx.id;
                    });

                    if (!transaction.length) {
                        console.log("transaction not found");
                        def.reject("Не удалось найти транзкцию");
                        return;
                    }
                    copy(tnx, transaction[0]);
                    def.resolve();
                },
                function () {
                    def.reject("При сохранении проихошла ошибка.")
                }
            );
            return def.promise;
        }

        function create(tnx) {
            var def = common.$q.defer();
            var txnCopy = {};
            copy(tnx, txnCopy);
            if (!txnCopy.timestamp) {
                txnCopy.timestamp = date.now();
            }
            txnCopy.timestamp = date.toUnix(txnCopy.timestamp);
            txnCopy.tags = _convertTagsToArray(txnCopy.tags);
            map.setTransactionCoords(txnCopy);
            datacontext.createTransaction(txnCopy)
                .then(function (response) {
                    var createdTnx = response.data;
                    _colorAndSaveTags(createdTnx.tags);
                    transactions.push(createdTnx);
                    def.resolve(createdTnx);
                }, function () {
                    def.reject();
                });
            return def.promise;
        }

        function remove(transactionGuid) {
            var def = common.$q.defer();
            datacontext.deleteTransaction(transactionGuid)
                .then(function () {
                    var index = getTransactionIndex(transactionGuid, transactions);
                    transactions.splice(index, 1);
                    def.resolve();
                },
                function () {
                    def.reject("При удалении произошла ошибка.")
                }
            );
            return def.promise;
        }

        return {
            getLocalTransaxns: getLocalTransaxns,
            getTransaxns: getTransaxns,
            updateSorting: updateSorting,
            getSortingForColumn: getSortingForColumn,
            getFirstPageWithFilters: getFirstPageWithFilters,
            create: create,
            getUserTags: getUserTags,
            sortOptions: sortOptions,
            sort: sort,
            sortByDateDesc: sortByDateDesc,
            update: update,
            getTransactionIndex: getTransactionIndex,
            remove: remove,
            copy: copy,
            getExcelFile: getExcelFile,
            getTransactionsAndTotals: getTransactionsAndTotals
        };
    }
})();
