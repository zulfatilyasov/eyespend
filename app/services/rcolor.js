(function() {
    'use strict';

    var serviceId = 'rcolor';
    angular.module('app').factory(serviceId, ['common', rcolor]);

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function hexToR(h) {
        return parseInt((cutHex(h)).substring(0, 2), 16);
    }

    function hexToG(h) {
        return parseInt((cutHex(h)).substring(2, 4), 16);
    }

    function hexToB(h) {
        return parseInt((cutHex(h)).substring(4, 6), 16);
    }

    function cutHex(h) {
        return (h.charAt(0) == "#") ? h.substring(1, 7) : h;
    }

    function rcolor() {
        var colors = [
                "6c4363",
                "5b295f",
                "826890",
                "aa83be",
                "8f8196",
                "706892",
                "6351b1",
                "5c6ccf",
                "729adc",
                "6283ba",
                "4d7599",
                "58919d",
                "326e7b",
                "328984",
                "29625f",
                "3cb9b2",
                "67a292",
                "6cca9f",
                "5f8171",
                "9eab43",
                "a39820",
                "ddc77d",
                "edcb56",
                "d5aa13"
            ],
            usedColors = [];

        function get() {

            var nextColorIndex = getRandomInt(0, colors.length - 1);
            var color = colors.splice(nextColorIndex, 1);
            usedColors.push(color);
            if (colors.length === 0) {
                colors = usedColors;
                usedColors = [];
            }
            var R = hexToR("#" + color);
            var G = hexToG("#" + color);
            var B = hexToB("#" + color);

            return "rgba(" + R + ", " + G + ", " + B + ", 0.65)";
        }

        return {
            get: get
        };
    }

})();
