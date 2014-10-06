(function() {
    'use strict';
    var controllerId = 'tagstats';
    var app = angular.module('app');

    app.directive('usTagstats', function () {
        return {
            restrict: 'E',
            scope: {
                stats: '='
            },
            link: function (scope, element, attrs) {
                var vis = d3.select(element[0])
                            .append('svg')
                            .attr('viewBox', '0 0 1000 1200')
                            .attr('width', '100%');

                function dataIdentity(d) {
                    return d.tags;
                }

                scope.$watchCollection('stats', function (newVal, oldVal) {
                    //vis.selectAll('*').remove();
                    if (!newVal || newVal.length < 1) {
                        return;
                    }

                    var x = d3.scale.linear()
                                .domain([0, newVal[0].percent])
                                .range([0, 700]);

                    var op = d3.scale.linear()
                                .domain([0, newVal[0].percent])
                                .range([0.25, 1]);

                    vis.attr('height', 40 * newVal.length);
                    vis.attr('viewBox', '0 0 1000 '+ (40*newVal.length).toString());

                    var join = vis.selectAll('rect').data(newVal, dataIdentity);

                    join.enter().append('rect')
                            .attr('x', 0)
                            .attr('y', function(d, i) { return i * 40; })
                            .attr('height', 40)
                            .attr('width', 0)
                            .style('fill', 'rgb(233, 188, 6)')
                            .style('opacity', 0.25);

                    join.transition()
                            .delay(500)
                            .duration(500)
                            .attr('y', function(d, i) { return i * 40; })
                            .attr('width', function(d) { console.log(d.percent); return x(d.percent); })
                            .style('opacity', function(d) { return op(d.percent); })
                            .ease('easein');

                    join.exit()
                        .transition()
                        .delay(500)
                        .duration(500)
                        .attr('height', 0)
                        .attr('width', 0)
                        .style('opacity', 0)
                        .remove();

                    join = vis.selectAll('text').data(newVal, dataIdentity);

                    join.enter().append('text')
                            .attr('x', 0)
                            .attr('y', function(d, i) { return i * 40+23; })
                            .text(function(d) { return d.tags + " " + d.percent.toString() + "%"; })
                            .style('opacity', 0);

                    join.transition()
                            .delay(500)
                            .duration(500)
                            .attr('x', function (d) { return x(d.percent) + 10; })
                            .attr('y', function(d, i) { return i * 40 + 23; })
                            .style('opacity', 1)
                            .ease('easein');

                    join.exit()
                        .transition()
                        .delay(500)
                        .duration(500)
                        .attr('x', 0)
                        .style('opacity', 0)
                        .remove();
                });
            }
        }
    });

    app.directive('usSlider', function ($interval) {
        return {
            restrict: 'E',
            scope: {
                rangeStart: '=start',
                rangeEnd: '=end'
            },
            link: function (scope, element, attrs) {
                var slider = $(element[0]).html("<div id='slider'></div>")
                             .find('#slider')
                             .dateRangeSlider({
                                bounds: {
                                    min: new Date(1333772441000),
                                    max: new Date()
                                }
                              });

                slider.bind('valuesChanged', function(e, data) {
                    scope.$apply(function() {
                        scope.rangeStart = data.values.min;
                        scope.rangeEnd = data.values.max;
                    });
                });

                function updateSlider(start, end) {
                    slider.dateRangeSlider('values', end, start);
                }

                scope.$watch('rangeStart', function (newValue) {
                    updateSlider(newValue, scope.rangeEnd);
                });

                scope.$watch('rangeEnd', function (newValue) {
                    updateSlider(scope.rangeStart, newValue);
                });
            }
        };
    });

    app.controller(controllerId, ['common', '$rootScope', '$scope', '$interval', 'datacontext', tagstats]);

    function tagstats(common, $rootScope, $scope, $interval, datacontext) {
        var vm = this;

        function activate() {
            common.activateController([], controllerId);
        }

        activate();

        $scope.sliderRangeStart = new Date(1349538476000);
        $scope.sliderRangeEnd = new Date(1412593875000);

        function updateStats() {
            vm.tagStats = [ ];
            datacontext.getTagsExpenses($scope.sliderRangeStart.getTime()/1000, $scope.sliderRangeEnd.getTime()/1000,
                                        [ ]).success(
                function (data) {
                    vm.tagStats = data.slice(0, 30);
                });
        }

        $scope.$watch('sliderRangeStart', updateStats);
        $scope.$watch('sliderRangeEnd', updateStats);

    }
})();
