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
        'new_play': '.play_new',
        'title_class': '.title_wrap',
        'sidebar': '#side_bar',
        'interval': 400
    };
    //Шаблоны для встраеваемых элементов
    this.tpl = {
        'save_link': '<a href="{{data.link}}" download="{{data.title}}" title="Изменить название и сохранить" class="wool_save save_red">' +
					'<img src="' + chrome.extension.getURL("img/save_r.png") + '" alt=""/></a>' +
					'<a href="{{data.link}}" download="{{data.title}}" title="Сохранить" class="wool_save"><img src="' + chrome.extension.getURL("img/save.png") + '" alt=""/></a>',
        'redactor_link': '<div class="wool_redactor"><a href="{{data.link}}" download="{{data.title}}" title="Сохранить" style="display: inline-block;" class="wool_save_link"><img src="' + chrome.extension.getURL("img/save.png") + '" alt=""/></a>' +
				'<a href="#" title="Отмена" style="display: inline-block;" class="wool_close_redactor"><img src="' + chrome.extension.getURL("img/close.png") + '" alt=""/></a>' +
				'<input type="text" value="{{data.title}}"/ style="display: inline-block;"></div>',
        'downLoadAll': '<div id="wrapper-checkbox">' +
                            '<div data-action="checkAll" class="check-action btn">Выделить все</div>' +
                            '<div data-action="offAll" class="check-action btn">Снять выделение</div>' +
                            '<div data-action="saveAll" class="check-action btn">Сохранить отмеченные композиции</div>' +
                       '</div>',
        'listItem': '<input class="wool-input" type="checkbox" name="audio" data-link="{{data.link}}" data-name="{{data.title}}"/>'
    }

    this.data = {};

    var c = this.config, count = 0, t = this.tpl;

    this.init = function () {
        //определяем высоту окна
        this.windowHeight = d.documentElement.clientHeight;
        //Помечаем аудио элементы при загрузке страницы
        this.Mark();
        //подключаем события
        this.addUIEvent();
        //добавлени управляющих кнопок
        $(this.config.sidebar).find('ol').after(this.tpl.downLoadAll);
        //нахождение элементов на странице
        setInterval(function () {
            A.scrollingPage();
        }, c.interval);
        //кординаты левой колонки
        this.rebuildLeftBar();
    };
    //вносим изменения в левую колонку
    this.rebuildLeftBar = function () {
        this.panel = d.querySelector('#side_bar');
        this.minMenu = d.querySelector('#stl_side');
        this.leftBlock = d.querySelector('#stl_left');

        var br = this.panel.getBoundingClientRect();
        this.panel.style.position = "fixed";
        this.panel.style.top = '40px';
        this.panel.style.left = br.left + 'px';
        this.panel.style.zIndex = 25;

        this.minMenu.style.zIndex = -1;
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
        //Действия в окошке
        D.on('click', '.check-action', this.actions.checkboxListSave);
        //Подстраиваем размещение панель при изменении размеров окна
        w.onresize = function () {
            A.panel.style.left = A.leftBlock.style.width;
        }
    };

    this.actions = {
        checkboxListSave: function () {
            var el = $(this), action = el.data('action');

            switch (action) {
                case 'checkAll':
                    $('.wool-input').prop('checked', true);
                    break;
                case 'offAll':
                    $('.wool-input').prop('checked', false);
                    break;
                case 'saveAll':
                    var audio = $('.wool-input:checked'), ln = audio.length;

                    if (ln === 0) {
                        alert('Вы не выбрали не одной записи!');
                    } else {
                        while (ln--) {
                            var downloadFileHyperLink = document.createElementNS("http://www.w3.org/1999/xhtml", "a");
                            downloadFileHyperLink.href = $(audio[ln]).data('link');
                            downloadFileHyperLink.download = $(audio[ln]).data('name');

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

            //return false;
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
        var count = els.length, link = '', title = '', tpl = '', panel = $('#checkboc-list'), inputs = '';

        for (var i = 0; i < count; i++) {
            var el = $(els[i]), id = el.attr('id');
            link = el.find('input[type=hidden]').val().split(',');
            title = el.find(c.title_class).text();

            this.data = {
                'id': c.id,
                'link': link[0],
                'title': title,
                'elId': id
            };

            tpl = this.parseTemplate(this.data, t.save_link);
            input = this.parseTemplate(this.data, t.listItem);
            
            el.find(c.wrap_class).after(tpl);
            el.find(c.wrap_class).after(input);

        }
    };

    var A = this;
};


var audio = new Audio();
//подрубаем
audio.init();