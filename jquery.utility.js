(function (window, $, undefined) {
	/**
	 * ### $.isEmpty() ###
	 * Check for empty string
	 *
	 * Options:
	 *
	 *	- `value` string to be checked wether it's empty or not
	 *
	 * Return:
	 *
	 *	`bool` true if empty string and vice versa
	 */
	$.isEmpty = function (value) {
		return !value || /^\s*$/g.test(value);
	};

	/**
	 * ### $.namespace() ###
	 * Generate namespace object recursively
	 *
	 * Options:
	 *
	 *	- `namespace` namespace string to be generated or reused
	 *	- `parent` generate namespace as a child from this parent (default to `window` object)
	 *	- `separator` separator character between parent and child (default to _dot_)
	 *
	 * Return:
	 *
	 *	`object` last child object
	 *
	 * Examples:
	 *
	 *	$.namespace('OpenLibrary.jQuery');
	 *
	 */
	$.namespace = function(namespace, parent, separator) {
		var parts = namespace.split(separator || '.'),
			_parent = parent || window,
			currentPart = '';
		if ($.isEmpty(namespace))
			return _parent;
		for (var i = 0, ii = parts.length; i < ii; i++) {
			currentPart = parts[i];
			_parent[currentPart] = _parent[currentPart] || {};
			_parent = _parent[currentPart];
		}
		return _parent;
	}
	
	/**
	 * ### $.convert() ###
	 * Convert string to strong type
	 *
	 * Options:
	 *
	 *	- `value` string to be converted
	 *	- `type` destination type, currently supported: string, boolean, numeric, object (JSON string)
	 *
	 * Return:
	 *
	 *	Strong type value
	 * 
	 * Examples:
	 *
	 *	$.convert('true', 'boolean'); //return true
	 *	$.convert('1234567.89', 'number'); //return 1234567.89
	 *	$.convert('[1, 2, 3]', 'array'); //return [1, 2, 3]
	 */
	$.convert = function(value, type) {
		value = typeof value == 'string' ? value.toLowerCase() : value;
		if (typeof type == 'undefined') {
			if (/^[\d\.]+$/.test(value)) {
				type = 'number';
			}
			else if (/(true|false|1|0)/.test(value)) {
				type = 'boolean';
			}
		}
		switch (type) {
			case 'boolean':
			case 'bool':
				switch (value) {
					case 'true':
					case '1':
					case 1:
						return true;
					case 'false':
					case '0':
					case 0:
						return false;
					default:
						return Boolean(value);
				}
				break;
			case 'number':
			case 'numeric':
			case 'integer':
			case 'decimal':
			case 'double':
			case 'float':
				return Number(String(value).replace(/[^\d\.\-]/g, ''));
				break;
			case 'array':
			case 'object':
				return $.parseJSON(value);
				break;
			case 'string':
				return String(value);
				break;
			default:
				return value;
		}
	}

	/**
	 * ### $.parseCsharpDate() ###
	 * Parse date returned by C# ajax
	 *
	 * Options:
	 *
	 *	- `date`  string date returned from C#, i.e: '/Date(xxxxx)/'
	 *
	 * Return:
	 *
	 *	`Date` converted date
	 *
	 * Examples:
	 *
	 *	$.parseCsharpDate('@Html.Raw(Json.Encode(System.DateTime.Now))');
	 */
	$.parseCsharpDate = function (date) {
		return date == null
			? new Date()
			: new Date(parseInt(date.replace(/\D/g, '')));
	};

	/**
	 * ### $(':contentIs()') ###
	 * jQuery exact content selector
	 * 
	 * Examples:
	 *
	 * Return:
	 *
	 *	`array` array of DOM returned by jQuery selector (matched filter)
	 *	
	 *	$('selector:contentIs("word")')
	 */
	$.expr[':'].contentIs = function (el, idx, meta) {
		return $(el).text() === meta[3];
	};
	
	/**
	 * ### $.isDOMQueryable() ###
	 * Check wether object is instance of HTML DOM
	 * 
	 * Options:
	 *
	 *	- `element` element to be check
	 *
	 * Return:
	 *
	 *	`bool` true if DOM (instance of HTMLElement)
	 */
	$.isDOMQueryable = function (element) {
		if (typeof (element) == "object" && element.constructor === Array) {
			return element[0] instanceof HTMLElement;
		}
		return false;
	};
})(window, jQuery);