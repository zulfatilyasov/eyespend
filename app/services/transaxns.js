(function() {

    'use strict';

    var serviceId = "transaxns";
    angular.module('app').factory(serviceId, ['datacontext', 'common', 'color', 'date', transaxns]);

    function transaxns(datacontext, common, color, date) {
        var transactions = [],
            userTags = [],
            sort = {
                column: 'Date',
                descending: true
            };

        function _sortByDateDesc(a, b) {
            var d1 = parseInt(a.Date);
            var d2 = parseInt(b.Date);
            if (d1 > d2) {
                return -1;
            } else if (d1 < d2) {
                return 1;
            } else {
                return 0;
            }
        }

        function updateSorting(column) {
            if (sort.column == column) {
                sort.descending = !sort.descending;
            } else {
                sort.column = column;
                sort.descending = false;
            }
            return sort;
        }

        function getSortingForColumn(column) {
            if (sort.column !== column) {
                return 'sorting';
            } else {
                if (sort.descending === true) {
                    return 'sorting_desc';
                } else if (sort.descending === false) {
                    return 'sorting_asc';
                } else {
                    return '';
                }
            }
        }

        function filterByTags(tags) {
            if (tags.length === 0) {
                return transactions.slice(0);
            }
            return transactions.filter(function(t) {
                for (var i = 0; i < tags.length; i++) {
                    for (var j = 0; j < t.tags.length; j++) {
                        if (t.tags[j].text === tags[i].text)
                            return true;
                    }
                }
            });
        }

        function filterByDate(fromDate, toDate) {
            return transactions.filter(function(t) {
                return (!fromDate || t.Date >= fromDate) && (!toDate || t.Date <= toDate);
            });
        }

        function _colorAndSaveTags(tags) {
            for (var i = tags.length - 1; i >= 0; i--) {
                tags[i].color = _getTagColor(tags[i].text);
                if (_userTagsContains(tags[i].text) === false) {
                    userTags.push(tags[i]);
                }
            }
        }

        function _userTagsContains(tagText) {
            return userTags.some(function(t) {
                return t.text === tagText;
            });
        }

        function _getTagColor(tagText) {
            var tag = userTags.filter(function(t) {
                return t.text === tagText;
            });
            if (tag.length && tag[0].color) {
                return tag[0].color;
            } else {
                return color.get(true, 0.3);
            }
        }

        function copy(tnx) {
            return {
                Id: tnx.Id,
                Date: tnx.Date,
                Amount: tnx.Amount,
                tags: tnx.tags,
                Address: tnx.Address
            };
        }

        function getTotalAmout() {
            var sum = 0;
            for (var i = 0; transactions && i < transactions.length; i++) {
                sum += parseInt(transactions[i].Amount);
            }
            return sum;
        }

        function getMinDate() {
            var minDate = transactions[transactions.length - 1].Date;
            return date.format(minDate);
        }

        function getMaxDate() {
            var maxDate = transactions[0].Date;
            return date.format(maxDate);
        }

        function getTransaxns() {
            var def = common.$q.defer();

            datacontext.getTransaxns()
                .then(function(tnxs) {
                    transactions = tnxs.data.sort(_sortByDateDesc);
                    transactions.forEach(function(t) {
                        _colorAndSaveTags(t.tags);
                    });
                    def.resolve(transactions.slice(0));
                });

            return def.promise;
        }

        function add(tnx) {

            if (!tnx.DateTime) {
                tnx.DateTime = date.now();
            } else {
                tnx.DateTime = date.toUnix(tnx.DateTime);
            }
            _colorAndSaveTags(tnx.Tags);
            var newTransaxn = {
                Id: 123,
                Amount: parseInt(tnx.Amount),
                tags: tnx.Tags.slice(0),
                Date: tnx.DateTime,
                Address: tnx.Place
            };
            transactions.push(newTransaxn);
            return newTransaxn;
        }

        return {
            getTransaxns: getTransaxns,
            updateSorting: updateSorting,
            getSortingForColumn: getSortingForColumn,
            filterByDate: filterByDate,
            filterByTags: filterByTags,
            getTotalAmout: getTotalAmout,
            add: add,
            getMinDate: getMinDate,
            getMaxDate: getMaxDate,
            userTags: userTags,
            sort: sort,
            copy: copy
        };
    }
})();
