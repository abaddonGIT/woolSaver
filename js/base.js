/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * @version 1.0.0
 * ***************************************************/
var Audio = function () {
    var d = document, w = window, D = $(d), W = $(w);
    //Конфиг
    this.config = {
        'audio_teg': '.audio',
        'mark': 'wool_mark',
        'wrap_class': '.area',
        'title_class': '.title_wrap',
        'id': "ebhpmjgcmoinfmapbmhikeibmaajbikd",
        'interval': 400
    };
    //Шаблоны для встраеваемых элементов
    this.tpl = {
        'save_link': '<a href="{{data.link}}" download="{{data.title}}" title="Изменить название и сохранить" class="wool_save save_red">' +
					'<img src="chrome-extension://{{data.id}}/img/save_r.png" alt=""/></a>' +
					'<a href="{{data.link}}" download="{{data.title}}" title="Сохранить" class="wool_save"><img src="chrome-extension://{{data.id}}/img/save.png" alt=""/></a>',
        'redactor_link': '<div class="wool_redactor"><a href="{{data.link}}" download="{{data.title}}" title="Сохранить" style="display: inline-block;" class="wool_save_link"><img src="chrome-extension://{{data.id}}/img/save.png" alt=""/></a>' +
				'<a href="#" title="Отмена" style="display: inline-block;" class="wool_close_redactor"><img src="chrome-extension://{{data.id}}/img/close.png" alt=""/></a>' +
				'<input type="text" value="{{data.title}}"/ style="display: inline-block;"></div>',
        'downLoadAll': '<div class="save_all"><a id="downLoadAll">Сохранить все аудио записи на странице</a></div>'
    }

    this.data = {};
    this.linksArray = [];
    this.location = '';

    var c = this.config, count = 0, t = this.tpl;

    this.init = function () {
        //Помечаем аудио элементы при загрузке страницы
        this.Mark();
        //подключаем события
        this.addUIEvent();
        //добавляем кнопку скачать все
        $('body').append(this.tpl.downLoadAll);
        //нахождение элементов на странице
        setInterval(function () {
            A.scrollingPage();
        }, c.interval);
    };
    //при перезагрузке страницы
    this.Mark = function () {
        var els = D.find(c.audio_teg);
        els.addClass(c.mark);
        this.addSave(els);
    };

    /*
    * Расбирает шаблон
    * @param {Object} объект данных для подстановки
    * @param {String} строка шаблона
    */
    this.parseTemplate = function (data, template) {
        var str = '', f;

        str = "var out='" + template.replace(/\{\{([\s\S]+?)\}\}/g, function (m, code) {
            return "' + (" + unescape(code) + ") + '";
        }) + "'; return out;";
        f = new Function('data', str);
        return f(data);
    };
    /*
    * Регистрирует события
    */
    this.addUIEvent = function () {
        //редактирование названия перед сохранением
        D.on('click', '.save_red', this.actions.redName);
        //Закрытие окна редактирования
        D.on('click', '.wool_redactor .wool_close_redactor', this.actions.redClose);
        //смена названия
        D.on('keyup', '.wool_redactor input', this.actions.changeName);
        //Скачивание и закрытие окна редактирования
        D.on('click', '.wool_redactor .wool_save_link', function () {
            $(this).parents('.wool_redactor').remove();
        });
        //Скачать все
        D.on('click', '#downLoadAll', this.actions.downLoadAll);
    };

    this.actions = {
        downLoadAll: function () {
            //Находим все аудио-элементы на странице
            var audio = d.querySelectorAll('.wool_save'), ln = audio.length; //все элементы для скачивания

            while (ln--) {
                var downloadFileHyperLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                downloadFileHyperLink.href = $(audio[ln]).attr('href');
                downloadFileHyperLink.download = $(audio[ln]).attr('download');

                var event = document.createEvent("MouseEvents");
                event.initMouseEvent(
				    "click", true, false, self, 0, 0, 0, 0, 0
				    , false, false, false, false, 0, null
			    );

                downloadFileHyperLink.dispatchEvent(event);
            }
        },
        redName: function () {
            var el = $(this), title = el.attr('download'), link = el.attr('href'), tpl = '';
            //данные
            A.data = {
                'id': c.id,
                'link': link,
                'title': title
            };

            tpl = A.parseTemplate(A.data, t.redactor_link);
            el.before(tpl);

            return false;
        },
        redClose: function () {
            $(this).parents('.wool_redactor').remove();
            return false;
        },
        changeName: function () {
            var par = $(this).parents('.wool_redactor'), saveLink = par.find('.wool_save_link');

            saveLink.attr('download', $(this).val());
        }
    }

    this.scrollingPage = function () {
        var els = D.find(c.audio_teg).not('#audio_global, .' + c.mark), locCount = els.length;

        if (locCount !== 0) {
            this.addSave(els);
            els.addClass(c.mark);
        }
    };

    //добавляем ссылку на скачивание
    this.addSave = function (els) {
        var count = els.length, link = '', title = '', tpl = '';

        while (count--) {
            var el = $(els[count]), id = el.attr('id');
            link = el.find('input[type=hidden]').val().split(',');
            title = el.find(c.title_class).text();

            this.data = {
                'id': c.id,
                'link': link[0],
                'title': title
            };

            this.linksArray.push(this.data);

            tpl = this.parseTemplate(this.data, t.save_link);

            el.find(c.wrap_class).after(tpl);

            console.log(id);

            chrome.extension.sendRequest({ action: 'start' }, function (response) {
                console.log('Start action sent');
            });
        }
    };

    var A = this;
};


var audio = new Audio();
//подрубаем
audio.init();