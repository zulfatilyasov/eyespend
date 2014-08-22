(function() {
  'use strict';

  var serviceId = 'rcolor';
  angular.module('app').factory(serviceId, ['common', rcolor]);

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function hexToR(h) {
    return parseInt((cutHex(h)).substring(0, 2), 16)
  }

  function hexToG(h) {
    return parseInt((cutHex(h)).substring(2, 4), 16)
  }

  function hexToB(h) {
    return parseInt((cutHex(h)).substring(4, 6), 16)
  }

  function cutHex(h) {
    return (h.charAt(0) == "#") ? h.substring(1, 7) : h
  }

  function padHex(str) {
    if (str.length > 2) return str;
    return new Array(2 - str.length + 1).join('0') + str;
  };

  function rgb2hsv(r, g, b) {
    var computedH = 0;
    var computedS = 0;
    var computedV = 0;

    //remove spaces from input RGB values, convert to int
    var r = parseInt(('' + r).replace(/\s/g, ''), 10);
    var g = parseInt(('' + g).replace(/\s/g, ''), 10);
    var b = parseInt(('' + b).replace(/\s/g, ''), 10);

    if (r == null || g == null || b == null ||
      isNaN(r) || isNaN(g) || isNaN(b)) {
      alert('Please enter numeric RGB values!');
      return;
    }
    if (r < 0 || g < 0 || b < 0 || r > 255 || g > 255 || b > 255) {
      alert('RGB values must be in the range 0 to 255.');
      return;
    }
    r = r / 255;
    g = g / 255;
    b = b / 255;
    var minRGB = Math.min(r, Math.min(g, b));
    var maxRGB = Math.max(r, Math.max(g, b));

    // Black-gray-white
    if (minRGB == maxRGB) {
      computedV = minRGB;
      return [0, 0, computedV];
    }

    // Colors other than black-gray-white:
    var d = (r == minRGB) ? g - b : ((b == minRGB) ? r - g : b - r);
    var h = (r == minRGB) ? 3 : ((b == minRGB) ? 1 : 5);
    computedH = 60 * (h - d / (maxRGB - minRGB));
    computedS = (maxRGB - minRGB) / maxRGB;
    computedV = maxRGB;
    return [computedH, computedS, computedV];
  }

  function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (h && s === undefined && v === undefined) {
      s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0:
        r = v, g = t, b = p;
        break;
      case 1:
        r = q, g = v, b = p;
        break;
      case 2:
        r = p, g = v, b = t;
        break;
      case 3:
        r = p, g = q, b = v;
        break;
      case 4:
        r = t, g = p, b = v;
        break;
      case 5:
        r = v, g = p, b = q;
        break;
    }
    return [
      Math.floor(r * 255),
      Math.floor(g * 255),
      Math.floor(b * 255)
    ];
  }

  function changeSaturation(color, value) {
    var R = hexToR("#" + color);
    var G = hexToG("#" + color);
    var B = hexToB("#" + color);
    var hsv = rgb2hsv(R, G, B);
    hsv[1] *= value;
    var rgb = HSVtoRGB(hsv[0], hsv[1], hsv[2]);
    return "rgb(" + Math.floor(rgb[0] * 1.12) + ", " + Math.floor(rgb[1] * 1.12) + ", " + Math.floor(rgb[2] * 1.12) + ")";
  }

  function rcolor(common) {
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

        // "be850c",
        // "a67307",
        // "ddac4d",
        // "e89f13",
        // "a86f01",
        // "a85301",
        // "f49232",
        // "915d2b",
        // "fbaa5c",
        // "fd9556",
        // "f37d35",
        // "dc5f13",
        // "c95209",

        // "ae4608",
        // "983f09",
        // "66432d",
        // "662f2d",
        // "7d221f",
        // "9c110e",
        // "c1312d",
        // "a44d4b",
        // "c5524f",
        // "e37b78",
        // "8b5857",
        // "784341",
        // "5b3332",
        // "803023"

      ],
      usedColors = [],
      nextColorIndex = 0;

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
      // return changeSaturation(color, 0.5);
    }

    return {
      get: get
    };
  }

})();
