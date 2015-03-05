'use strict';

var through = require('through2');
var css = require('css');
var gutil = require('gulp-util');
var PluginError = gutil.PluginError;

var PLUGIN_NAME = 'gulp-split-locales';

var rules,
	rule,
	sheets,
	i;

// Separate styles by locales
function splitBySheets(locale, node) {
	if (sheets[locale]) {
		sheets[locale].stylesheet.rules = sheets[locale].stylesheet.rules.concat(node);
	} else {
		sheets[locale] = {
			type      : 'stylesheet',
			stylesheet: {
				rules: [node]
			}
		};
	}
}

// Check if current rule contains locale selector html[lang='locale_name'].
// If so, remove html[lang] from css selector, return rule as object
// containing locale code and rule itself.
// Otherwise return false.
function getRuleByLocale(rule) {
	var re = /html\[lang=['"]{0,1}(.[a-z-]+?)['"]{0,1}\][\s\S]{0,1}/i,
		match = re.exec(rule.selectors);

	if (match != null) {
		var locale = match[1];

		// Remove html[lang] from the selector
		for (var j = 0; j < rule.selectors.length; j++) {
			rule.selectors[j] = rule.selectors[j].replace(re, '');
		}

		return {
			locale: locale,
			rule  : rule
		};
	}

	return false;
}

function splitRules(rule) {
	var localeRule,
		query = rule.media;

	if (query) {
		// Current rule is media node with an own list of rules
		var media = {};

		// Process each rule separately
		for (var j = 0; j < rule.rules.length; j++) {
			localeRule = getRuleByLocale(rule.rules[j]);

			if (!localeRule) {
				continue;
			}

			// Add current rule to separated media node for each locale
			if (media[localeRule.locale]) {
				media[localeRule.locale].rules = media[localeRule.locale].rules.concat(localeRule.rule);
			} else {
				media[localeRule.locale] = {
					type : 'media',
					media: query,
					rules: [localeRule.rule]
				};
			}

			// Remove rule from the original set
			rule.rules.splice(j--, 1);
		}

		// Add just created media nodes to the corresponding locale sheet
		for (var locale in media) {
			splitBySheets(locale, media[locale]);
		}

	} else {
		// Curent rule is a single css rule
		localeRule = getRuleByLocale(rule);

		if (!localeRule) {
			return;
		}

		// Add rule to the corresponding locale sheet
		splitBySheets(localeRule.locale, localeRule.rule);

		// Remove rule from the original set
		rules.splice(i--, 1);
	}
}

function splitLocales(stream, file) {
	var obj = css.parse(file.contents.toString(), {source: file.path});

	rules = obj.stylesheet.rules;
    sheets = {};

	for (i = 0; i < rules.length; i++) {
		rule = rules[i];

		splitRules(rule);
	}

	for (var locale in sheets) {
		stream.push(new gutil.File({
			path    : locale + '.css',
			contents: new Buffer(css.stringify(sheets[locale]))
		}));
	}

	return css.stringify(obj);
}

module.exports = function() {
	return through.obj(function (file, enc, cb) {
        var currentStream = this;

        if (file.isNull()) {
            cb(null, file);
            return;
        }

        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams not supported!'));
            return;
        }

        file.contents = new Buffer(splitLocales(this, file));
		this.push(file);
		cb();
	});
};
