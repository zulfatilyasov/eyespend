(function() {

    'use strict';

    var serviceId = 'transaction.service';
    angular.module('app').factory(serviceId, ['datacontext', 'common', 'rcolor', 'date', '$rootScope', 'map', transaxns]);

    function transaxns(datacontext, common, rcolor, date, $rootScope, map) {
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
                .success(function(data) {
                    var sortedTransactions = data.transactions;
                    extendTransactions(sortedTransactions);
                    offset = sortedTransactions.length;
                    transactions = sortedTransactions;
                    def.resolve({
                        transactions: angular.copy(transactions),
                        total: data.total
                    });
                });

            return def.promise;
        }

        function extendTransactions(transactions) {
            angular.forEach(transactions, function(t) {
                t.date = date.withoutTimeShort(t.timestamp);
                t.time = date.onlyTime(t.timestamp);
                _colorAndSaveTags(t.tags);
            });
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
                .success(function(data) {
                    location.href = data.url;
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
            var result = [];
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
                } else {
                    tags[i].color = _getTagColor(tags[i].text);
                }
                if (_userTagsContains(tags[i]) === false) {
                    _userTags.push(angular.copy(tags[i]));
                }
            }
        }

        function _userTagsContains(tag) {
            return _userTags.some(function(t) {
                return t.text === tag.text;
            });
        }

        function _getTagColor(tagText) {
            var tag = _userTags.filter(function(t) {
                return t.text === tagText;
            });
            if (tag.length && tag[0].color) {
                return tag[0].color;
            } else {
                return rcolor.get();
            }
        }

        function getTransactionsAndTotals() {
            var def = common.defer();
            datacontext.getTransactionsAndTotals(count)
                .then(function(resp) {
                    var trs = resp.data.transactions;
                    var totals = resp.data.totals;
                    $rootScope.hideContent = false;
                    if (trs && trs instanceof Array) {
                        transactions = trs;
                        offset = transactions.length;
                        extendTransactions(transactions);
                        def.resolve({
                            data: {
                                transactions: angular.copy(transactions),
                                totals: totals
                            }
                        });
                    } else {
                        def.reject();
                    }
                }, function(resp) {
                    console.log(resp);
                });

            return def.promise;
        }

        function getTransaxns(fromDate, toDate, tags, withPhoto) {
            var def = common.defer();

            var tagsArray = _convertTagsToArray(tags);
            datacontext.getTransaxns(sortOptions.column, sortOptions.descending, offset, count, fromDate || '', toDate || '', tagsArray, withPhoto)
                .then(function(resp) {
                    var trs = resp.data.transactions;
                    var total = resp.data.total;
                    if (trs && trs instanceof Array) {
                        if (offset > 0) {
                            transactions = transactions.concat(trs);
                            offset += trs.length;
                        } else {
                            transactions = trs;
                            offset = trs.length;
                        }
                        extendTransactions(transactions);
                        def.resolve({
                            data: {
                                transactions: angular.copy(transactions),
                                total: total
                            }
                        });
                    } else {
                        def.reject();
                    }
                }, function(resp) {
                    console.log(resp);
                });

            return def.promise;
        }

        function getLocalTransaxns() {
            return angular.copy(transactions);
        }

        function copy(source, target) {
            if (!target)
                target = {};
            target.id = source.id;
            target.amountInBaseCurrency = source.amountInBaseCurrency;
            target.latitude = source.latitude;
            target.longitude = source.longitude;
            target.timestamp = source.timestamp;
            target.date = source.date;
            target.time = source.time;
            target.tags = angular.copy(source.tags);
            _colorAndSaveTags(target.tags);
            return target;
        }

        function getTransasctionById(id) {
            for (var i = 0, len = transactions.length; i < len; i++) {
                if (transactions[i].id === id)
                    return copy(transactions[i]);
            }
            return null;
        }

        function _serverFormatTnx(tnx) {
            var serverFormattedTnx = angular.copy(tnx);
            serverFormattedTnx.tags = _convertTagsToArray(serverFormattedTnx.tags);
            return serverFormattedTnx;
        }


        function dateTimeToTimestamp(dateTime) {
            dateTime = dateTime.replace(/\./g, '');
            dateTime = dateTime.replace(/\s/g, '');
            dateTime = dateTime.replace(/\:/g, '');
            var day = dateTime.slice(0, 2);
            var month = parseInt(dateTime.slice(2, 4)) - 1;
            var year = dateTime.slice(4, 8);
            var hours = dateTime.slice(8, 10);
            var minutes = dateTime.slice(10, 12);
            var date = new Date(year, month, day, hours, minutes);
            return date.getTime();
        }

        function setTxnTime(txn) {
            if (txn.dateTime)
                txn.timestamp = dateTimeToTimestamp(txn.dateTime);
            if (txn.timestamp && txn.time)
                txn.timestamp = date.addTimeToTimestamp(txn.timestamp, txn.time);
        }

        function create(tnx) {
            var def = common.$q.defer();
            if (!tnx.amountInBaseCurrency)
                tnx.amountInBaseCurrency = 0;
            var txnCopy = {};
            setTxnTime(tnx);
            map.setTxnCoords(tnx);
            copy(tnx, txnCopy);
            if (!txnCopy.timestamp) {
                txnCopy.timestamp = date.now();
            }
            extendTransactions([tnx]);
            txnCopy.tags = _convertTagsToArray(txnCopy.tags);
            datacontext.createTransaction(txnCopy)
                .then(function(response) {
                    var createdTnx = response.data;
                    tnx.id = createdTnx.id;
                    transactions.push(tnx);
                    def.resolve(tnx);
                }, function() {
                    def.reject();
                });
            return def.promise;
        }

        function update(tnx) {
            var def = common.$q.defer();
            setTxnTime(tnx);
            map.setTxnCoords(tnx);
            _colorAndSaveTags(tnx.tags);
            datacontext.updateTransaction(_serverFormatTnx(tnx))
                .then(function() {
                        var transaction = transactions.filter(function(t) {
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
                    function() {
                        def.reject("При сохранении проихошла ошибка.")
                    }
            );
            return def.promise;
        }

        function remove(transactionGuid) {
            var def = common.$q.defer();
            datacontext.deleteTransaction(transactionGuid)
                .then(function() {
                        var index = getTransactionIndex(transactionGuid, transactions);
                        transactions.splice(index, 1);
                        def.resolve();
                    },
                    function() {
                        def.reject("При удалении произошла ошибка.")
                    }
            );
            return def.promise;
        }

        function destroy() {
            transactions = [];
            offset = 0;
        }
        return {
            getLocalTransaxns: getLocalTransaxns,
            getTransaxns: getTransaxns,
            getTransasctionById: getTransasctionById,
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
            getTransactionsAndTotals: getTransactionsAndTotals,
            batchSize: count,
            destroy: destroy
        };
    }
})();
