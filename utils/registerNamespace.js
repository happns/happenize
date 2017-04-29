export default function (components, func, ns) {
	var App = this && this.compileProvider ? this : window.App;

	ns = ns && `${ns}.` || '';

	func = typeof (func) === 'string' ? App[func] : func;

	Object
	.getOwnPropertyNames(components)
	.filter(x => x.match(/^[A-Za-z].+$/) != null)
	.forEach(x => func(`${ns}${x}`, components[x]));
};
