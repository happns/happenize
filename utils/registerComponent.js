export default function (component, ns) {
    var controller = component.controller;
    var link = component.link;

    //component.replace = component.replace || true;

    function loadObjectFromNamespace(obj, ns) {
        return ns.split('.').reduce((o,i)=> o[i] = o[i] || {}, obj)
    }

    component.controller = function ($rootScope, $scope, $controller, $injector) {
        var $state = $injector.has('$state') ? $injector.get('$state') : null;

        if (component.viewState) {
            $scope.viewState = component.viewState;

            var viewState = {};
            // load settings from the local scope
            angular.merge(loadObjectFromNamespace(viewState, ns), $scope.viewState);

            // load currently saved settings
            angular.merge(viewState, App.ViewState);

            // merge any other default values that are not present in root viewState yet
            // e.g. were added a little bit later, so we will just use default values
            angular.merge(App.ViewState, viewState);

            $rootScope.$watch('viewState', viewState => {
                if (viewState) {
                    $scope.viewState = loadObjectFromNamespace(viewState, ns);
                }
            });
        }

        if (controller) {
            var locals = { $scope, $namespace: ns };
            if ($state) {
                angular.extend(locals, $state.$current.locals.globals);
            }

            $controller(controller, locals);
        }
    };

    component.link = function (scope, element, attrs) {
        const camelCaseToDashes = input => input.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        const nsToDirectiveTagName = input => camelCaseToDashes(input).replace(/\./g, '_');

        const tagName = nsToDirectiveTagName(ns);

        element.attr(`_c_${tagName}`, '');

        if (link) {
            link.apply(this, arguments);
        }
    };

    return component;
};
