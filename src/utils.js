module.exports.trim = function (number, nDigits) {
    if (!number || number == Number.POSITIVE_INFINITY || number == Number.NEGATIVE_INFINITY) {
        number = 0;
    }
    var power = Math.pow(10, nDigits);
    var trimmed = "" + Math.round(number * power);
    while (trimmed.length < nDigits + 1) {
        trimmed = "0" + trimmed;
    }
    var len = trimmed.length;
    return trimmed.substr(0,len - nDigits) + "." + trimmed.substr(len - nDigits, nDigits);
}

module.exports.getBrowser = function () {
    // http://www.quirksmode.org/js/detect.html
    var versionSearchString;
    var dataBrowser = [
        {string:navigator.userAgent, subString:"Chrome", identity:"Chrome"},
        {string:navigator.userAgent, subString:"Safari", identity:"Chrome"},
        {string:navigator.userAgent, subString:"Firefox", identity:"Firefox"},
        {string:navigator.userAgent, subString:"MSIE", identity:"IE", versionSearch:"MSIE"}];

    function searchString(data) {
        for (let i = 0; i < data.length; i++) {
            var dataString = data[i].string;
            var dataProp = data[i].prop;
            if (dataString) {
                if (dataString.indexOf(data[i].subString) != -1) {
                    return data[i].identity;
                }
            } else if (dataProp) {
                return data[i].identity;
            }
        }
    };
 
    return searchString(dataBrowser) || "An unknown browser";
}

module.exports.pretty = function (time) {
    if (time < 0) {
        return 'DNF';
    }

    time = Math.round(time / 10);
    var bits = time % 100;
    time = (time - bits) / 100;
    var secs = time % 60;
    var mins = ((time - secs) / 60) % 60;

    var out = [bits];
    if (bits < 10) {
        out.push('0');
    }
    out.push('.');
    out.push(secs);
    if (secs < 10 && mins > 0) {
        out.push('0');
    }
    if (mins > 0) {
        out.push(':');
        out.push(mins);
    }
    return out.reverse().join('');
};

