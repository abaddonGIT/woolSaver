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
		'title_class': '.title',
		'id': "nlooajinbmkpcmbglleejnkapkopnmga",
		'interval': 400
	};
	//Шаблоны для встраеваемых элементов
	this.tpl = {
		'save_link': '<a href="{{data.link}}" download="{{data.title}}" title="Изменить название и сохранить" class="wool_save save_red">' + 
					'<img src="chrome-extension://{{data.id}}/img/save_r.png" alt=""/></a>' +
					'<a href="{{data.link}}" download="{{data.title}}" title="Сохранить" class="wool_save"><img src="chrome-extension://{{data.id}}/img/save.png" alt=""/></a>',
		'redactor_link': '<div class="wool_redactor"><a href="{{data.link}}" download="{{data.title}}" title="Сохранить" style="display: inline-block;" class="wool_save_link"><img src="chrome-extension://{{data.id}}/img/save.png" alt=""/></a>' + 
				'<a href="#" title="Отмена" style="display: inline-block;" class="wool_close_redactor"><img src="chrome-extension://{{data.id}}/img/close.png" alt=""/></a>' +
				'<input type="text" value="{{data.title}}"/ style="display: inline-block;"></div>'
	}

	this.data = {};
	this.location = '';

	var c = this.config, count = 0, t = this.tpl;

	this.init = function () {
		//Помечаем аудио элементы при загрузке страницы
		this.Mark();
		//подключаем события
		this.addUIEvent();
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
		f =  new Function('data', str);
		return f(data);
	};
	/*
	* Регистрирует события
	*/
	this.addUIEvent = function () {
		//редактирование названия перед сохранением
		D.on('click', '.save_red', function () {
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
		});
		//Закрытие окна редактирования
		D.on('click', '.wool_redactor .wool_close_redactor', function () {
			$(this).parents('.wool_redactor').remove();
			return false;
		});
		//смена названия
		D.on('keyup', '.wool_redactor input', function () {
			var par = $(this).parents('.wool_redactor'), saveLink = par.find('.wool_save_link');

			saveLink.attr('download', $(this).val());
		});
		//Скачивание и закрытие окна редактирования
		D.on('click', '.wool_redactor .wool_save_link', function () {
			$(this).parents('.wool_redactor').remove();	
		});
		//нахождение элементов на странице
		setInterval(function () {
			A.scrollingPage();
		}, c.interval);
	};

	this.scrollingPage = function () {
		var	els = D.find(c.audio_teg).not('#audio_global, .' + c.mark),  locCount = els.length;

		if (locCount !== 0) {
			this.addSave(els);
			els.addClass(c.mark);
		}	
	};

	//добавляем ссылку на скачивание
	this.addSave = function (els) {
		var count = els.length, link = '', title = '', tpl = '';

		while (count--) {
			var el = $(els[count]);
				link = el.find('input[type=hidden]').val().split(',');
				title = el.find(c.title_class).text();

				this.data = {
					'id': c.id,
					'link': link[0],
					'title': title
				};
				tpl = this.parseTemplate(this.data, t.save_link);

				el.find(c.wrap_class).after(tpl);
			
		}
	};

	var A = this;
};


var audio = new Audio();
//подрубаем
audio.init();