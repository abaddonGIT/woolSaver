var d = document, w = window


var Popup = function () {
    this.config = {
        'list': '#checkboc-list',
        'actionLink': d.querySelectorAll('.check-action')
    };

    //шаблоны
    this.tpl = {
        'listItem': '<label><input type="checkbox" name="audio" data-link="{{data.link}}" data-name="{{data.title}}"/>{{data.title}}</label><div class="clear"></div>'
    }

    this.init = function () {
        //подклучение событий
        this.addEvents();
        //заполняем список композиций
        this.updateList(links);
    };

    this.addEvents = function () {
        //прослушивает события обновления
        chrome.extension.onRequest.addListener(function (request, sender, sendResponse) {
            links = request.links;
            pop.updateList(links);
        });
        //вешаем обработку слика по кнопкам
        var ln = this.config.actionLink.length;
        while (ln--) {
            this.config.actionLink[ln].addEventListener('click', pop.popupClick);
        }
    };

    this.popupClick = function () {
        var action = this.getAttribute('data-action'), nabor = d.querySelectorAll('#checkboc-list input'), ln = nabor.length;

        switch (action) {
            case 'checkAll':
                while (ln--) {
                    nabor[ln].checked = true;
                }
                break;
            case 'offAll':
                while (ln--) {
                    nabor[ln].checked = false;
                }
                break;
            case 'saveAll':
                //Находим все аудио-элементы на странице
                var audio = d.querySelectorAll('#checkboc-list input:checked'), ln = audio.length; //все элементы для скачивания
                if (ln === 0) {
                    alert('Вы не выбрали не одной композиции');
                } else {
                    while (ln--) {
                        var downloadFileHyperLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                        downloadFileHyperLink.href = audio[ln].getAttribute('data-link');
                        downloadFileHyperLink.download = audio[ln].getAttribute('data-name');

                        var event = document.createEvent("MouseEvents");
                        event.initMouseEvent(
                        "click", true, false, self, 0, 0, 0, 0, 0
                        , false, false, false, false, 0, null
                        );

                        downloadFileHyperLink.dispatchEvent(event);
                    }    
                }
                break;
        }
    }

    this.updateList = function (links) {
        var html = '';
        for (var i in links) {
            html += bg.parseTemplate(links[i], this.tpl.listItem);
        }
        d.querySelector(this.config.list).innerHTML = html;
    };

    var pop = this;
};
//получаем backgorund
var bg = chrome.extension.getBackgroundPage(), links = bg.links;

w.onload = function () {
    var pop = new Popup();
    pop.init();
}




