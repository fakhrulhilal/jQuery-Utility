/**
 * jQuery form plugin
 * Various plugin to deal with form widget (input, textarea, checkbox etc).
 *
 * Requirement:
 *
 *	- jQuery
 *	- jQuery.utility (in this repository)
 */
(function ($, window, undefined) {
	var kendo = $.namespace('OpenLibrary.Kendo');
	kendo.mapping = {
		numerictextbox: 'kendoNumericTextBox',
		integertextbox: 'kendoIntegerTextBox',
		datepicker: 'kendoDatePicker',
		timepicker: 'kendoTimePicker',
		datetimepicker: 'kendoDateTimePicker',
		grid: 'kendoGrid',
		dropdownlist: 'kendoDropDownList',
		combobox: 'kendoComboBox',
		window: 'kendoWindow'
	};

	/**
	 * Digunakan untuk menyimpan checkbox yg tercentang walaupun berpindah halaman grid.
	 * Applicable to: Kendo Grid
	 * Requirement: 
	 * 1. jCookie (https://github.com/martinkr/jCookie)
	 * 2. jStorage (https://github.com/martinkr/jStorage)
	 * Usage: <div data-role="grid" data-action="checkbox-saveselect" data-target="cssClass" />
	 * Akan menyimpan hasil centang pada semua checkbox <input type="checkbox" class="select-cssClass" value="nilai" />
	 * berdasarkan attribute "value"
	 **/
	$.fn.saveSelectedCheckbox = function(checkboxName) {
		return $(this).each(function (index, grid) {
			var $grid = $(grid),
				checkboxTarget = checkboxName || $grid.data('target') || 'select-checkbox',
				gridId = $grid.attr('id'),
				formSelector = 'table[role="grid"]',
				//gridFormSelector = '[data-role="grid"]',
				$form = $($grid.parents('form')),
				checkboxSelector = ' input[type="checkbox"][name="' + checkboxTarget + '"]';
			//harus mempunya attribute data-role="grid"
			if ($grid.data('role') != 'grid')
				return;
			//tentukan nama untuk storage
			var storageName = 'SaveCheckboxSelection_' + gridId;

			function listenToCheckbox() {
				//hapus attribute id dari checkbox
				//$grid.find(checkboxSelector).removeAttr('id');
				//bind event untuk semua checkbox pada grid
				$grid.find(checkboxSelector).on('change', function (e) {
					//ambil dari storage atau buat storage baru
					var selectedCheckbox = jQuery.storage.getItem(storageName, 'cookie') || [];
					var nilai = $(this).val();
					var isChecked = $(this).is(':checked');
					if (isChecked) {
						//tambahkan ke daftar jika belum ada jika checkbox tercentang
						if (selectedCheckbox.indexOf(nilai) < 0)
							selectedCheckbox.push(nilai);
						$(this).attr('checked', 'checked');
					} else {
						//hapus jika sudah ada di daftar jika checkbox tidak tercentang
						var posisi = selectedCheckbox.indexOf(nilai);
						if (posisi >= 0)
							selectedCheckbox.splice(posisi, 1);
					}
					//simpan storage
					jQuery.storage.setItem(storageName, selectedCheckbox, 'cookie');
				});
			}
			//bind ke setiap terjadi paging pada grid
			$grid.data('kendoGrid').bind('dataBound', function () {
				listenToCheckbox();
				//ambil satu sample checkbox, tandai checkbox hidden
				var sampleCheckbox = $($grid.find(formSelector + ' ' + checkboxSelector)[0])
									   .clone()
									   //.removeAttr('id')
									   .removeAttr('value')
									   .attr('mark', 'generated')
									   .css('display', 'none');//sembunyikan
				//ambil dari storage atau buat storage baru
				var selectedCheckbox = jQuery.storage.getItem(storageName, 'cookie') || [];
				if (selectedCheckbox.length > 0) {
					$(selectedCheckbox).each(function (key, item) {
						var checkboxItemSelector = checkboxSelector + '[value="' + item + '"]';
						$grid.find(checkboxItemSelector + '[mark="generated"]').remove();
						//centang jika ada
						if ($grid.find(checkboxItemSelector).length > 0) {
							$grid.find(checkboxItemSelector).attr('checked', 'checked');
							//hapus checkbox tersembunyi jika ada
							$grid.find(checkboxItemSelector + '[mark="generated"]').remove();
						} else { //buat & tambahkan ke form jika tidak ada
							//bikin checkbox baru, set nilainya, langsung tercentang, tambahkan ke form
							$(sampleCheckbox)
								 .clone()
								 .attr('value', item)
								 .attr('checked', 'checked')
								 .appendTo($grid);
						}
					});
				}
			});
			//setiap klo form disubmit, hapus storage penyimpan yg tercentang
			$form.submit(function (e) {
				jQuery.storage.removeItem(storageName, 'cookie');
				//fixed bug: hapus hidden yg dibikin kendo
				$form.find('[name="' + checkboxTarget + '"]:not(:checkbox)').remove();
			});
			//bangkitkan event dataBound
			$grid.data('kendoGrid').trigger('dataBound');
		});
	}

	/**
	 * cleanUpKendoHidden()
	 * Digunakan untuk menghapus input hidden yg dibikin kendo.
	 **/
	$.fn.cleanUpKendoHidden = function () {
		var $dom = $(this),
			selector = 'input[name][type="hidden"]:not([id])'; //hidden biasanya punya nama tapi tidak punya id
		return $dom.find(selector).remove();
	};

	/**
	 * ### $.serializeObject() ###
	 * Serialize form ke bentuk object, similiar to $.fn.serializeArray() or $.fn.serialize()
	 *
	 * Return:
	 *
	 *	- `object` object/hash style (key-value pair)
	 *
	 * Examples:
	 *	$('form').serializeObject();
	 */
	$.fn.serializeObject = function () {
		var $form = $(this);
		$form.cleanUpKendoHidden();
		var formData = $form.serializeArray(),
			alternativeSelector = 'input, textarea, select',
			output = {};
		//jika formData kosong, coba gunakan selector alternatif
		if (formData.length < 1)
			formData = $form.find(alternativeSelector).serializeArray();
		$.map(formData, function (data, i) {
			if (typeof (output[data['name']]) == "object" && output[data['name']].constructor === Array) {
				output[data['name']].push(data['value']);
			} else if (typeof (output[data['name']]) != "undefined") {
				var oldValue = output[data['name']];
				output[data['name']] = [oldValue, data['value']];
			} else {
				output[data['name']] = data['value'];
			}
		});
		return output;
	};
	
	/**
	 * ### $.enable() ###
	 * Enable/disable selected input
	 *
	 * Options:
	 *	- `status` if set to true (default), it will enable matched DOM element and vice versa
	 *
	 * Examples:
	 *
	 *	$('#formEditor input[type="text"], #formEditor select').enable();
	 **/
	$.fn.enable = function(status) {
		var $this = $(this),
			isEnable = typeof (status) == "undefined" ? true : status;
		return $this.each(function() {
			var $item = $(this),
				widget = $item.data('role');
			if (!$.isEmpty(widget) && typeof (kendo.mapping[widget]) != "undefined") {
				$item.data(kendo.mapping[widget]).enable(isEnable);
			} else {
				isEnable
					? $item.removeAttr('disabled')
					: $item.attr('disabled', 'disabled');
			}
		});
	};

	/**
	 * ### $.enableAll() ###
	 * Enable/disable all input component on a form, except button
	 * exclude items: input[type="submit"], input[type="button"], button
	 *
	 * Options:
	 *
	 *	`status` if set to true (default), it will enable matched DOM element and vice versa
	 *
	 * Examples:
	 *
	 *	$('#formEditor').enableAll(false);
	 */
	$.fn.enableAll = function(status) {
		var $form = $(this),
			$childrens = $form.find('textarea, input:not([type="submit"], [type="button"], [class*="k-formatted-value"])');
		return $childrens.enable(status);
	}; 

	/**
	 * ### resetError() ###
	 * Clear validation message in $.validator validation summary 
	 *
	 * Options:
	 *
	 *	- `parentDom` Search for validation summary from this parent DOM
	 *
	 * Examples:
	 *
	 *	$('#formEditor').resetError();
	 */
	$.fn.resetError = function (parentDom) {
		var $parent = parentDom == undefined ? $(this) : $(parentDom),
			$validationMessage = $parent.find('[data-valmsg-summary]');
		$validationMessage.removeClass('validation-summary-errors');
		$validationMessage.html('<ul style="display:none;"><li></li></ul>');
		return $parent.find('.input-validation-error').removeClass('input-validation-error');
	};

	/**
	 * ### $.displayErrors() ###
	 * Display validation message error, compatible with jQuery validator.
	 *
	 * Options:
	 *
	 *	- `message` key/value pair or array of hash style of error message
	 *
	 * Examples:
	 *
	 *	$('#formEditor').displayErrors({
	 *		{'Name': ['Name is required']},
	 *		{'Address': ['Address is required', 'Minimum length for address is 5 characters']}
	 *	});
	 */
	$.fn.displayErrors = function (message) {
		var errors = typeof(message['errors']) != "undefined"
			? message['errors']
			: message;
		var $form = $(this),
			$validationMessage = $form.find('[data-valmsg-summary]');
		var key, value;
		//reset form
		$form.resetError();
		var errorMessage = {}, validationErrors = [], properties = Object.keys(errors);
		for (var i in errors) {
			if (!errors.hasOwnProperty(i))
				continue;
			if (typeof (errors[i]['Key']) != "undefined") { // KeyValuePair style
				key = errors[i].Key;
				value = errors[i].Value;
			} else { //array of class, hash style
				for (var j in errors[i]) {
					if (errors[i].hasOwnProperty(j)) {
						key = i;
						value = errors[i];
						break;
					}
				}
			}
			$form.find('input[name="' + key + '"]').each(function () {
				var widget = $(this).data('role');
				!utility.isEmpty(widget)
					? $(this).parents('.k-widget').addClass('input-validation-error') //kendo widget
					: $(this).addClass('input-validation-error').show(); //normal widget
			});
			errorMessage[key] = value;
			$.merge(validationErrors, value);
		}
		var errorSummary = '<ul><li>' + validationErrors.join('</li><li>') + '</li></ul>';
		$validationMessage.html(errorSummary);
		$validationMessage.addClass('validation-summary-errors');
		$form.find('.k-widget:hidden').show(); //fix bug: show hidden kendo widget for second validation
		return $form;
	};
	
	/**
	 * ### $.fillForm() ###
	 * Fill form with certain value based on name attribute.
	 * To reset all input in form, just fill `data` with `null` value.
	 *
	 * Options:
	 *
	 *	- `data` object/hash style value to be filled on form
	 *
	 * Examples:
	 *
	 *	$('#formEditor').fillForm({ name: 'Fakhrulhilal', country: 'Indonesia' }); //<div id="formEditor"><input type="text" name="country" value="Indonesia" /></div>
	 */
	$.fn.fillForm = function(data) {
		var $form = $(this),
			filter = 'input:not([type="button"], [type="submit"], [type="reset"]), textarea, select',
			output = [],
			$field, widget, tipe;
		if (data === undefined)
			return $form;
		//reset form jika diisi dengan null
		else if (data === null) {
			$form.find(filter).each(function() {
				$field = $(this),
				widget = $field.data('role'),
				tipe = $field.attr('type');
				if (!$.isEmpty(widget) && typeof (kendo.mapping[widget]) != "undefined") {
					$field.data(kendo.mapping[widget]).value('');
				} else if (tipe == 'checkbox' || tipe == 'radio') {
					$field.removeAttr('checked');
				} else {
					$field.val('');
				}
			});
		} else {
			for (var property in data) {
				var nilai = data[property];
				if (data.hasOwnProperty(property) &&
					typeof (nilai) != "undefined") {
					//cari komponen form
					$field = $form.find('[name="' + property + '"]'),
					widget = $field.data('role'),
					tipe = $field.attr('type');
					if ($field.length > 0) {
						if (!$.isEmpty(widget) && typeof (kendo.mapping[widget]) != "undefined") {
							$field.data(kendo.mapping[widget]).value(nilai);
						} else if (tipe == 'checkbox' || tipe == 'radio') {
							nilai ? $field.attr('checked', 'checked') : $field.removeAttr('checked');
						} else {
							$field.val(nilai);
						}
					}
				}
			}
		}
		return $form;
	};
	
	/**
	 * setDecimalDigit(int)
	 * Digunakan untuk mengeset nilai digit desimal untuk widget kendo
	 **/
	var setDecimalDigit = function(precision, widget) {
		var option = typeof (widget['options']) != "undefined" ? widget['options'] : widget;
		option['decimals'] = precision;
		option['format'] = (precision > 0) ? '#,#.' + new Array(precision + 1).join('#') : '#,#';
	};
	$.fn.setDecimalDigit = function(precision) {
		var $this = $(this);
		return $this.each(function() {
			var $item = $(this),
				widget = $item.data('role');
			if (!$.isEmpty(widget) && typeof(kendo.mapping[widget]) != "undefined") {
				setDecimalDigit(precision, $item.data(kendo.mapping[widget]));
			}
		});
	};

	/**
	 * $.toggleSelectAll()
	 * Toggle select all checkbox with matching css class `select-[target]`.
	 * You can use it with declarative way.
	 *
	 * Options:
	 *
	 *	- `options` key/value pair or hash style option:
	 *		1. `target` (backing attribute `data-target`) will select all checkbox with class _select-[target]_
	 *
	 * Examples:
	 *
	 *	$(['data-role="checkbox-all"']).toggleSelectAll();
	 *	<input type="checkbox" data-role="checkbox-toggle" data-target="city" />
	 *	//will toggle select all checkbox for
	 *	<input type="checkbox" class="select-city" />
	 */
	$.fn.toggleSelectAll = function (options) {
		return this.each(function () {
			var parameters = $.extend({
				target: $(this).data('target') || 'checkbox'
			}, options);

			$(this).click(function () {
				$(this).is(':checked')
					? $('[class|="select-' + parameters['target'] + '"]:visible').attr('checked', 'checked').trigger('change')
					: $('[class|="select-' + parameters['target'] + '"]:visible').removeAttr('checked').trigger('change');
			});
		});
	};

	/**
	 * ### $.mathKeyboard() ###
	 * Apply mathmatical operation with certain key shortcut to selected input will on focus.
	 *
	 * Options:
	 *
	 *	- `parameters` key/value pair or hash style option:
	 *		1. `caseSensitive` (backing attribute `data-casesensitive`) determine wether shortcut key is case sensitive or not
	 *		2. `operation` (backing attribute `data-operation`) mathmatic operation: '*' for multiplication, '/' for division, '-' for subtraction, '+' for addition
	 *		3. `shortcut` (backing attribute `shortcut` (suggested) or `data-shortcut` (lose case sensitivity)) key value pair of shortcut key and value for operation. Default: { b: 1000000000, m: 1000000, t: 1000, h: 100 }
	 *
	 * Examples:
	 *
	 *	$('[data-role="math-shortcut"]').mathKeyboard({
	 *		caseSensitive: false,
	 *		operation: '*',
	 *		shortcut: {
	 *			h: 100,
	 *			t: 1000
	 *		}
	 *	});
	 *	
	 *	//or using unobtrusive style
	 *	$('[data-role="math-shortcut"]').mathKeyboard();
	 *	<input type="number" data-role="math-shortcut" data-casesensitive="false" data-operation="*" data-shortcut="{ "b": 1000000000, "m": 1000000, "t": 1000, "h": 100 }" />
	 */
	$.fn.mathKeyboard = function (parameters) {
		return this.each(function () {
			var $this = $(this);
			$this.options = $.extend({
				caseSensitive: $.convert($this.data('casesensitive'), 'boolean') || false,
				operation: $this.data('operation') || '*',
				shortcut: $.parseJSON($this.attr('shortcut')) || $.parseJSON($this.data('shortcut')) || {
					b: 1000000000,
					m: 1000000,
					t: 1000,
					h: 100
				}
			}, parameters);
			$this.options['operation'] = $.trim($this.options['operation']);
			if ($.inArray($this.options['operation'], ['*', '+', '-', ':']) < 0)
				return;
			if (!$this.options['caseSensitive']) {
				for (var key in $this.options['shortcut']) {
					if (!$this.options['shortcut'].hasOwnProperty(key))
						continue;
					var value = $this.options['shortcut'][key];
					var newKey = key.toLowerCase();
					delete $this.options['shortcut'][key];
					$this.options['shortcut'][newKey] = value;
				}
			}

			$this.on('keyup', function (e) {
				var $input = $(this),
					$numericTextBox = $(this).data('kendoNumericTextBox'),
					$integerTextBox = $(this).data('integerTextBox'),
					huruf = String.fromCharCode(e.keyCode),
					decimalSeparator = '.',
					minusSign = '-',
					updateNilai = true,
					nilai = $numericTextBox ? $numericTextBox.value()
						: $integerTextBox ? $integerTextBox.value()
							: $input.val();
				nilai = $input.val();
				if ($this.options['caseSensitive'])
					huruf = huruf.toLowerCase();
				//bereskan karakter bukan angka jika tipe data output dari widget bukan number
				if (typeof (nilai) != "number") {
					nilai = $.convert(nilai, 'numeric');
				}
				if (typeof ($this.options['shortcut'][huruf]) != 'undefined') {
					switch ($this.options['operation']) {
						case '*':
							nilai *= $this.options['shortcut'][huruf];
							break;
						case '/':
							nilai /= $this.options['shortcut'][huruf];
							break;
						case '+':
							nilai += $this.options['shortcut'][huruf];
							break;
						case '-':
							nilai -= $this.options['shortcut'][huruf];
							break;
					}
				}
				if ($numericTextBox)
					$numericTextBox.value(nilai);
				else if ($integerTextBox)
					$numericTextBox.value(nilai);
				else
					$input.val(nilai);
				return true;
			});

			//trigger change ketika key lepas
			$this.on('blur', function () {
				var widget = $(this).data('role');
				$.isEmpty(widget) && typeof (kendo.mapping[widget]) != "undefined"
					? $(this).data(kendo.mapping[widget]).trigger('change')
					: $(this).trigger('change');;
			});
		});
	};
})(jQuery, window);

jQuery(function ($) {
	$('[data-role="checkbox-toggle"]').toggleSelectAll();
	$('[data-keyboard="math-shortcut"]').mathKeyboard();
	$('[data-role="checbox-saveselect"]').saveSelectedCheckbox();
});
