var links = {};

/*
* Расбирает шаблон
* @param {Object} объект данных для подстановки
* @param {String} строка шаблона
*/
function parseTemplate (data, template) {
    var str = '', f;

    str = "var out='" + template.replace(/\{\{([\s\S]+?)\}\}/g, function (m, code) {
        return "' + (" + unescape(code) + ") + '";
    }) + "'; return out;";
    f = new Function('data', str);
    return f(data);
};

chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
    links = request.links;
    console.log(links);
});
