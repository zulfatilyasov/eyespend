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
                "a15c32",
                "886a57",
                "76482d",
                "6e2f08",
                "e2793c",
                "402c20",
                "a24a1a",
                "b95555",
                "894f4f",
                "531414",
                "782b2b",
                "de5432",
                "d3694d",
                "983e27",
                "be4425",
                "721f03",
                "ca9b5a",
                "b97623",
                "9d5f16",
                "6c4412",
                "d3a928",
                "b28e21",
                "9b8432",
                "9f8f22",
                "6d7e32",
                "89a13b",
                "7e6274",
                "712051",
                "90346c",
                "5d3e52",
                "4b1636",
                "75589d",
                "83364f"
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
