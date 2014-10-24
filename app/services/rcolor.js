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
                "b65c2b",
                //"e0b686",
                //"f1bea3",
                //"d6a288",
                //"b97d5f",
                "936a55",
                //"eb976c",
                "844627",
                "ff7935",
                "7f2b00",
                "e3530a",
                "44281a",
                "ba480e",
                //"f25500",
                //"f49090",
                //"ff6161",
                //"cb9696",
                //"bd6f6f",
                "d35454",
                "9b4e4e",
                "600c0c",
                "8b2626",
                //"9c0202",
                "cf1111",
                "ff542c",
                "ef694a",
                "af3c21",
                "db421e",
                "e62b00",
                "851900",
                "ffa235",
                "ffbd70",
                "fd8b06",
                "da9d55",
                "ce7711",
                "b18653",
                "b05f00",
                "784203",
                "fccd3e",
                "dfbc50",
                "e2ab03",
                "f0b500",
                "bf9000",
                "a58525",
                "d6bf26",
                "e7d13d",
                "a69100",
                "d7bb00",
                "a7ca52",
                "657f26",
                "b65c2b",
                //"da5b9d",
                "886276",
                "b9789a",
                "841a51",
                "a7306e",
                "663c52",
                "560f34",
                "7f57a1",
                "946db5",
                //"692f99",
                "97334f",
                "a15569"
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
