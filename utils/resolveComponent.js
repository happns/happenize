import registerPartials from './registerPartials.js';
import registerComponent from './registerComponent.js';

export default function (name, Components) {
    var App = this && this.compileProvider ? this : window.App;

    App.components = App.components || {};

    var isRootComponent = name.indexOf('.') === -1;

    // TODO should get it somehow
    var isThemeable = false;

    var partialRegistration = () => {
        var rootComponentName = name.split('.')[0];
        var rootComponent = App.components[rootComponentName];

        if (isRootComponent) {
            registerPartials(src.partials, name, isThemeable);
            registerPartials(src.components, name, isThemeable);
        } else if (rootComponent && !rootComponent.resolved) {
            rootComponent.resolve.partials();
        }
    }

    var getComponent = name => {
        var key = name.replace(/\./g, '.components.');

        return DotObject.pick(key, Components)
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
