const HMR = {
    applyToModule: function (module) {
        module.config(function ($compileProvider) {
            Object.assign(HMR, { $compileProvider });
        });

        module.run(function ($compile) {
            Object.assign(HMR, { $compile });
        })
    },

    applyToComponent: function (meta, component) {
        let $$compile;

        const link = component.link?.pre;
        const controller = component.controller;

        component.controller = function ($scope, $controller, $compile) {
            $$compile = $compile;

            if (controller) {
                var locals = { $scope };
    
                return $controller(controller, locals);
            }
        };

        component.link = {
            pre: function (scope, element, attrs, controller) {
                let $element = element[0];
                const $pristineElement = $element.cloneNode();

                if (meta.hot) {
                    meta.hot.accept(({ module }) => {
                        // Accept the module, apply it to your application.
                        const $scope = scope.$parent ? scope.$parent.$new() : scope;

                        Object.assign(component, module.default);

                        $element.replaceWith($element = $pristineElement.cloneNode());

                        $$compile($element)($scope);
                    });

                    meta.hot.dispose(() => {
                        // Cleanup any side-effects. Optional.
                        scope.$emit('$destroy');
                    });
                }

                if (link) {
                    return link.apply(component, arguments);
                }
            },
            post: component.link
        }
    }
};

export default HMR;