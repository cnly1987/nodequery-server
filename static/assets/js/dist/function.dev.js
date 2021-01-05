"use strict";

var intVal = function intVal(i) {
  return typeof i === 'string' ? i.replace(/[\$,]/g, '') * 1 : typeof i === 'number' ? i : 0;
};

var toDecimal = function toDecimal(x, pos) {
  pos = pos || 2;
  var f = parseFloat(x);

  if (isNaN(f)) {
    return '';
  }

  var f = Math.round(x * Math.pow(10, pos)) / Math.pow(10, pos);
  var s = f.toString();
  var rs = s.indexOf('.');

  if (rs < 0) {
    rs = s.length;
    s += '.';
  }

  while (s.length <= rs + pos) {
    s += '0';
  }

  return intVal(s);
};

var objectifyForm = function objectifyForm(formArray) {
  var returnArray = {};

  for (var i = 0; i < formArray.length; i++) {
    if (Object.keys(returnArray).indexOf(formArray[i]['name']) == -1) {
      returnArray[formArray[i]['name']] = formArray[i]['value'];
    } else {
      if (typeof returnArray[formArray[i]['name']] == 'string') {
        returnArray[formArray[i]['name']] = [returnArray[formArray[i]['name']]].concat([formArray[i]['value']]);
      } else {
        returnArray[formArray[i]['name']] = returnArray[formArray[i]['name']].concat([formArray[i]['value']]);
      }
    }
  }

  return returnArray;
};

var now = function now() {
  var d = new Date();
  return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + d.getHours() + ':' + d.getMinutes();
};