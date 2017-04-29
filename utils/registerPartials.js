import registerNamespace from './registerNamespace.js';
import registerComponent from './registerComponent.js'
import themeable from './themeable';

export default function registerPartials(components, ns, isThemeable = false) {
    var App = this && this.compileProvider ? this : window.App;

	var dotsToCamelCase = input => input.replace(/\.([a-z])/g, x => x[1].toUpperCase());

	var registerPartial = function (name, partial) {
		var ns = name;

		var registrator = isThemeable ? () => registerComponent.bind(this)(themeable(partial, ns), ns) : () => registerComponent.bind(this)(partial, ns);

		// so we could use underscores '_' instead of dots '.' (this way the tag can be handled by CSS/LESS)
		name = dotsToCamelCase(ns);

		var directive = typeof (partial) === 'function' ? partial : registrator;

		App.compileProvider.directive(name, directive);
	};

	if (components) {
		registerNamespace(components, registerPartial.bind(this), ns);
		registerNamespace(
			components,
			(name, x) => x.partials && registerPartials.bind(this)(x.partials, ns && `${ns}.${name}` || name, isThemeable));
		registerNamespace(
			components,
			(name, x) => x.partials && registerPartials.bind(this)(x.components, ns && `${ns}.${name}` || name, isThemeable));
	}
}
