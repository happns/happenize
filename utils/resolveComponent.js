import registerPartials from './registerPartials.js';
import registerComponent from './registerComponent.js';

const parse = (path, obj) => path.split('.').reduce((o, i) => o[i], obj);

export default function (name, Components, App) {
    App = App || (this && this.compileProvider ? this : window.App);

    App.components = App.components || {};

    var isRootComponent = name.indexOf('.') === -1;

    // TODO should get it somehow
    var isThemeable = false;

    var partialRegistration = () => {
        var rootComponentName = name.split('.')[0];
        var rootComponent = App.components[rootComponentName];

        if (isRootComponent) {
            registerPartials(src.partials, name, isThemeable, App);
            registerPartials(src.components, name, isThemeable, App);
        } else if (rootComponent && !rootComponent.resolved, App) {
            rootComponent.resolve.partials();
        }
    }

    var getComponent = name => {
        var key = name.replace(/\./g, '.components.');

        return parse(key, Components)
    };

    var src = getComponent(name);

    var component = App.components[name] || {
        url: `/${name}`,
        componentName: name,
        controller: src.controller,
        template: src.template,
        viewState: src.viewState,
        resolve: angular.extend({}, src.resolve, {
            partials: () => {
                // XXX partials have to be registered just once
                partialRegistration && partialRegistration();
                partialRegistration = null;

                component.resolved = true;
            }
        })
    };

    registerComponent(component, name);

    App.components[name] = component;

    return component;
};
