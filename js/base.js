var Audio = function () {
	var d = document, w = window, D = $(d), W = $(w);

	this.config = {
		'audio_teg': '.audio',
		'mark': 'wool_mark',
		'wrap_class': '.area',
		'title_class': '.title'
	};

	var c = this.config, count = 0;

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

	this.addUIEvent = function () {
		W.bind('scroll', $.proxy(this, 'scrollingPage'));
		//редактирование названия перед сохранением
		D.on('click', '.save_red', function () {
			var el = $(this), title = el.attr('download'), link = el.attr('href');

			el.before('<div class="wool_redactor"><a href="' + link + '" download="' + title + '" title="Сохранить" style="display: inline-block;" class="wool_save_link"><img src="chrome-extension://nlooajinbmkpcmbglleejnkapkopnmga/img/save.png" alt=""/></a>' + 
				'<a href="#" title="Отмена" style="display: inline-block;" class="wool_close_redactor"><img src="chrome-extension://nlooajinbmkpcmbglleejnkapkopnmga/img/close.png" alt=""/></a>' +
				'<input type="text" value="' + title + '"/ style="display: inline-block;"></div>');

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

		D.on('click', '.wool_redactor .wool_save_link', function () {
			$(this).parents('.wool_redactor').remove();	
		});
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
		var count = els.length, link = '', title = '';

		while (count--) {
			var el = $(els[count]);
				link = el.find('input[type=hidden]').val().split(',');
				//console.log(el.find('input[type=hidden]'));
				title = el.find(c.title_class).text();
				el.find(c.wrap_class).after('<a href="' + link[0] + '" download="' + title + '" title="Изменить название и сохранить" class="wool_save save_red"><img src="chrome-extension://nlooajinbmkpcmbglleejnkapkopnmga/img/save_r.png" alt=""/></a><a href="' + link[0] + '" download="' + title + '" title="Сохранить" class="wool_save"><img src="chrome-extension://nlooajinbmkpcmbglleejnkapkopnmga/img/save.png" alt=""/></a>');
			
		}
	};
};


var audio = new Audio();
//подрубаем
audio.init();
