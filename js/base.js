/******************************************************
 * Copyright 2013 by Abaddon <abaddongit@gmail.com>
 * @author Abaddon <abaddongit@gmail.com>
 * ***************************************************/
var Audio = function () {
    var d = document, w = window;
    //Конфиг
    this.config = {
        'audio_teg': '.audio',
        'mark': 'wool_mark',
        'wrap_class': '.area',
        'new_play': '.play_new',
        'title_class': '.title_wrap',
        'sidebar': '#side_bar',
        'id': chrome.runtime.id,
        'interval': 1000
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
        //добавлени управляющих кнопок childNodes
        d.querySelector(this.config.sidebar + ' ol').appendChild(this.domAction.createEl(this.tpl.downLoadAll));
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
        this.panel.style.cssText += "position: fixed; top: 100px; left: " + br.left + 'px; z-index: 25;';
        this.minMenu.style.zIndex = -1;
    };
    //при перезагрузке страницы
    this.Mark = function () {
        var els = d.querySelectorAll(c.audio_teg);
        this.domAction.addClass(els, c.mark);
        this.addSave(els);
    };

    /*
    * Разбирает шаблон
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
        d.addEventListener('click', function (event) {
            var e = event || w.event,
                target = e.target,
                parent = '';

            parent = target.parentNode;
            if (parent.tagName === "A") {
                if (A.domAction.hasClass(parent, 'save_red')) {
                    A.actions.redName(parent);
                    e.preventDefault();
                }

                if (A.domAction.hasClass(parent, 'wool_close_redactor')) {
                    A.actions.redClose(parent);
                    e.preventDefault();
                }

                if (A.domAction.hasClass(parent, 'wool_save_link')) {
                    $(parent).parents('.wool_redactor').remove();
                }
            }

            if (target.tagName === "DIV" && A.domAction.hasClass(target, 'check-action')) {
                A.actions.checkboxListSave(target);
            }
        }, false);

        d.addEventListener('keyup', function (event) {
            var e = event || w.event,
                target = e.target,
                parent = target.parentNode;

            if (A.domAction.hasClass(parent, 'wool_redactor') && target.tagName === "INPUT") {
                A.actions.changeName(target);
            }
        }, false);
        //Подстраиваем размещение панель при изменении размеров окна
        w.onresize = function () {
            A.panel.style.left = A.leftBlock.style.width;
        }
    };

    this.actions = {
        checkboxListSave: function (el) {
            var action = el.getAttribute('data-action');

            switch (action) {
                case 'checkAll':
                case 'offAll':
                    var inputs = d.querySelectorAll('.wool-input'),
                        ln = inputs.length;

                    if (action === "checkAll") {
                        while (ln--) {
                            var loc = inputs[ln];
                            loc.checked = true;
                        }
                    } else {
                        while (ln--) {
                            var loc = inputs[ln];
                            loc.checked = false;
                        }
                    }

                    break;
                case 'saveAll':
                    var audio = d.querySelectorAll('.wool-input:checked'),
                        ln = audio.length;

                    if (ln === 0) {
                        alert('Вы не выбрали не одной записи!');
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
        },
        redName: function (el) {
            var title = el.getAttribute('download'), link = el.href, tpl = '';
            //данные
            A.data = {
                'id': c.id,
                'link': link,
                'title': title
            };

            tpl = A.parseTemplate(A.data, t.redactor_link);
            el.parentNode.insertBefore(A.domAction.createEl(tpl), el);
            return false;
        },
        redClose: function (el) {
            el.parentNode.parentNode.removeChild(el.parentNode);
            return false;
        },
        changeName: function (el) {
            var par = el.parentNode, saveLink = par.querySelector('.wool_save_link');
            saveLink.setAttribute('download', el.value);
        }
    }

    this.scrollingPage = function () {
        var els = d.querySelectorAll(c.audio_teg + ':not(.' + c.mark + '):not(#audio_global)'),
            locCount = els.length;

        if (locCount !== 0) {
            this.addSave(els);
            this.domAction.addClass(els, c.mark);
        }
    };

    //добавляем ссылку на скачивание
    this.addSave = function (els) {
        var count = els.length, link = '', title = '', tpl = '', inputs = '', point = null;

        for (var i = 0; i < count; i++) {
            var el = els[i];

            link = el.querySelector('input[type=hidden]').value.split(',');
            title = el.querySelector(c.title_class + ' .title').textContent;

            this.data = {
                'id': c.id,
                'link': link[0],
                'title': title.replace('.','')
            };

            tpl = this.parseTemplate(this.data, t.save_link);
            input = this.parseTemplate(this.data, t.listItem);
            point = el.querySelector(c.wrap_class);

            this.domAction.insertAfter('<span>' + tpl + input + '</span>', point);
        }
    };
    /*
    * Ф-и для работы с dom-элементами
    */
    this.domAction = {
        insertAfter: function (el, afterEl) {
            //Если в качестве первого параметра переданна строка html то создаем елемент сами
            if (typeof el === "string") {
                el = A.domAction.createEl(el);
            }
            var parent = afterEl.parentNode,
                next = afterEl.nextSibling;

            if (next && !next instanceof Text) {
                return next.insertBefore(el, next);
            } else {//Если следующего элемента нет то вставляем наш в самый конец
                return parent.appendChild(el);
            }
        },
        createEl: function (html) {
            var div = d.createElement('div');
            div.innerHTML = html;
            var el = div.childNodes[0];
            div.removeChild(el);
            return el;
        },
        addClass: function (el, cls) {
            var classes = '',
                classesAr, ln = el.length;

            if (typeof el === "string") {
                el = d.querySelectorAll(el);
                ln = el.length;
            }

            if (ln) {
                while (ln--) {
                    var loc = el[ln];
                    loc.className += ' ' + cls;
                }
            } else {
                el.className += ' ' + cls;
            }
        },
        hasClass: function (el, cls) {
            var classes = el.className.split(" "),
                ln = classes.length;

            while (ln--) {
                var loc = classes[ln];
                if (loc === cls) {
                    return true;
                    break;
                }
            }
        }
    };

    var A = this;
};


var audio = new Audio();
//подрубаем
audio.init();