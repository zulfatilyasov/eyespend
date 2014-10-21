(function() {
    'use strict';
    // angular.module('app').constant('mockJson', $.mockJSON);
    // angular.module('app').constant('color', new RColor);
    angular.module('app').constant('miniChartOption', {
        lineMode: 'linear',
        series: [{
            y: 'value',
            thickness: '2px',
            color: 'rgb(255, 248, 140)',
            striped: true,
            type: 'area'
        }],
        tooltip: {
            mode: 'none'
        },
        tension: 0.7,
        stacks: [],
        drawLegend: false,
        drawDots: false,
        mode: 'thumbnail',
        columnsHGap: 5
    });
})();
