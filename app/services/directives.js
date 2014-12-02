(function() {
    'use strict';

    angular
        .module('app')
        .directive('ngEnter', function() {
            return function(scope, element, attrs) {
                element.bind('keydown keypress', function(event) {
                    if (event.which === 13) {
                        scope.$apply(function() {
                            scope.$eval(attrs.ngEnter);
                        });

                        event.preventDefault();
                    }
                });
            };
        })
        .directive('ngArrow', function() {
            return function(scope, element, attrs) {
                element.bind('keydown keypress', function(event) {
                    if (event.which === 38 || event.which === 40) {
                        scope.$apply(function() {
                            scope.$eval(attrs.ngArrow);
                        });

                        event.preventDefault();
                    }
                });
            };
        })
        .directive('usDateTimePicker', function() {
            return function(scope, element) {
                $(element).datetimepicker({
                    mask: true,
                    lang: 'ru',
                    closeOnDateSelect: true,
                    //                    format: 'd.m.Y H:i',
                    format: 'd.m.Y',
                    onChangeDateTime: function(date) {
                        var d = new Date(date);
                        var time = scope.$parent.transaction.time.replace(':', '');
                        var hours = time.slice(0, 2);
                        var minutes = time.slice(2, 4);
                        d.setHours(hours);
                        d.setMinutes(minutes);
                        scope.$parent.transaction.timestamp = d.getTime();
                    }
                });
            };
        })
        .directive('onTransitionEnd', function() {
            function transitionEndEventName() {
                var i,
                    el = document.createElement('div'),
                    transitions = {
                        'transition': 'transitionend',
                        'OTransition': 'otransitionend', // oTransitionEnd in very old Opera
                        'MozTransition': 'transitionend',
                        'WebkitTransition': 'webkitTransitionEnd'
                    };

                for (i in transitions) {
                    if (transitions.hasOwnProperty(i) && el.style[i] !== undefined) {
                        return transitions[i];
                    }
                }
            }

            var transitionEnd = transitionEndEventName();

            function link(scope, element) {
                element.on(transitionEnd, function() {
                    scope.transtionEnd();
                });
            }

            return {
                restrict: 'A',
                scope: {
                    transtionEnd: '=onTransitionEnd'
                },
                link: link
            };
        })
        .directive('focusMe', function($timeout) {
            return {
                scope: {
                    trigger: '=focusMe'
                },
                link: function(scope, element) {
                    scope.$watch('trigger', function(value) {
                        if (value === true) {
                            $timeout(function() {
                                if (element.tagName !== 'INPUT') {
                                    element = element.context ? $(element.context).find('input').first() : element.find('input').first();
                                }
                                element[0].focus();
                            });
                        }
                    });
                }
            };
        })
        .directive('overlay', function($rootScope) {
            return function(scope, element) {
                element.css('display', 'block');
                element.click(function() {
                    $rootScope.$apply(function() {
                       $rootScope.showImage = false;
                       $rootScope.imgUrl = '';
                    })
                });
            };
        })
        .directive('validateAmount', function() {
            return function(scope, element) {
                element.keydown(function(e) {
                    // Allow: backspace, delete, tab, escape, enter and .
                    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 110, 190]) !== -1 ||
                        // Allow: Ctrl+A
                        (e.keyCode == 65 && e.ctrlKey === true) ||
                        // Allow: home, end, left, right
                        (e.keyCode >= 35 && e.keyCode <= 39)) {
                        // let it happen, don't do anything
                        return;
                    }
                    // Ensure that it is a number and stop the keypress
                    if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                        e.preventDefault();
                    }
                });
            };
        })
        .directive('tip', function() {
            return function(scope, element) {
                element.hover(function() {
                    var c = d3.select(this);
                    console.log(c.datum());
                });
            };
        })
        .directive('usSlider', function() {
            return {
                restrict: 'E',
                scope: {
                    options: '=options',
                    rangeStart: '=start',
                    rangeEnd: '=end',
                    onChanged: '=changed',
                    onChanging: '=changing'
                },
                link: function(scope, element) {

                    var slider;

                    function initialize(options) {
                        slider = element.html('<div id="slider"></div>')
                            .find('#slider')
                            .dateRangeSlider(options);
                        if (scope.onChanged)
                            slider.bind('valuesChanged', scope.onChanged);

                        if (scope.onChanging)
                            slider.bind('valuesChanging', scope.onChanging);

                    }

                    scope.$parent.vm.initializeSlider = initialize;

                    scope.$parent.vm.setSliderBounds = function(left, right) {
                        slider.dateRangeSlider('bounds', left, right);
                    };

                    scope.$parent.vm.setSliderValues = function(left, right) {
                        slider.dateRangeSlider('values', left, right);
                    };

                    function updateSlider(start, end) {
                        if (!slider)
                            return;
                        slider.dateRangeSlider('values', end, start);
                    }

                    scope.$watch('rangeStart', function(newValue) {
                        updateSlider(newValue, scope.rangeEnd);
                    });

                    scope.$watch('rangeEnd', function(newValue) {
                        updateSlider(scope.rangeStart, newValue);
                    });
                }
            };
        })
        .directive('usTagstats', function() {
            return {
                restrict: 'E',
                scope: {
                    stats: '='
                },
                link: function(scope, element) {
                    var vis = d3.select(element[0])
                        .append('svg')
                        .attr('viewBox', '0 0 1000 1200')
                        .attr('width', '100%');

                    function dataIdentity(d) {
                        return d.tags;
                    }

                    scope.$watchCollection('stats', function(newVal) {
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
                        vis.attr('viewBox', '0 0 1000 ' + (30 * newVal.length).toString());

                        var join = vis.selectAll('rect').data(newVal, dataIdentity);

                        var j = join.enter();
                        var g = j.append('g');

                        g.append('rect')
                            .attr('x', 0)
                            .attr('y', function(d, i) {
                                return i * 40;
                            })
                            .attr('height', 40)
                            .attr('width', "100%")
                            .style('fill', '#f4a755');

                        g.append('rect')
                            .attr('x', 0)
                            .attr('y', function(d, i) {
                                return i * 40;
                            })
                            .attr('height', 30)
                            .attr('width', 0)
                            .style('fill', 'rgb(233, 188, 6)')
                            .style('opacity', 1)
                            .transition()
                            .delay(500)
                            .duration(500)
                            .attr('width', function(d) {
                                return x(d.percent);
                            })
                            .ease('easein');

                        // join.exit()
                        //     .transition()
                        //     .delay(500)
                        //     .duration(500)
                        //     .attr('height', 0)
                        //     .attr('width', 0)
                        //     .style('opacity', 0)
                        //     .remove();

                        join = vis.selectAll('text').data(newVal, dataIdentity);

                        join.enter().append('text')
                            .attr('x', 0)
                            .attr('y', function(d, i) {
                                return i * 40 + 23;
                            })
                            .text(function(d) {
                                return d.percent.toString() + '%';
                            })
                            .style('opacity', 0);

                        join.transition()
                            .delay(500)
                            .duration(500)
                            .attr('x', function(d) {
                                return x(d.percent) + 10;
                            })
                            .attr('y', function(d, i) {
                                return i * 40 + 23;
                            })
                            .style('opacity', 1)
                            .ease('easein');
// join.exit()
//     .transition()
//     .delay(500)
//     .duration(500)
//     .attr('x', 0)
//     .style('opacity', 0)
//     .remove();

                    });
                }
            };
        });
})();
