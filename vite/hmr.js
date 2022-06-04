const HMR = {
    applyToModule: function (module) {
        HMR.module = module;

        module.config(function ($compileProvider) {
            Object.assign(HMR, { $compileProvider });
        });

        module.run(function ($compile) {
            Object.assign(HMR, { $compile });
        })
    },

    applyToComponent: function (meta, component, deps, hooks) {
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
                    const imports = deps
                    .filter(dep => dep.named)
                    .map(dep => dep.import);

                    const importToName = deps.reduce((previousValue, currentValue) => {
                        if (currentValue.named) {
                            previousValue[currentValue.hmrImport] = currentValue.name;
                        }

                        return previousValue;
                    }, {});

                    const updateComponent = (update) => {
                        // Accept the module, apply it to your application.
                        const $scope = scope.$parent ? scope.$parent.$new() : scope;

                        Object.assign(component, update);

                        if (component.replace) {
                            const $replacement = $pristineElement.cloneNode();
                            $replacement.innerHTML = component.template;

                            $element.replaceWith($element = $replacement.firstChild);
                        } else {
                            $element.replaceWith($element = $pristineElement.cloneNode());
                            $element.innerHTML = component.template;
                        }

                        const toTagName = input => input.replace(/\./g, '_');
                        $element.setAttribute(`_c_${toTagName(component.ns)}`, '');

                        $$compile($element)($scope);
                    }

                    // update when dependencies changes
                    for (const dep of deps) {
                        const hook = hooks[dep.onHmrUpdate]
                        if (hook) {
                            const callback = (module) => {
                                const update = { [dep.name]: module.default }

                                updateComponent(update);

                                module.onHmrUpdate(callback);
                            }

                            hook(callback);
                        }
                    }

                    meta.hot.accept(imports, (modules) => {
                        const module = {
                            default: imports.reduce((previousValue, currentValue, i) => {
                                previousValue[importToName[currentValue]] = modules[i];

                                return previousValue;
                            }, {})
                        }

                        updateComponent(module.default);
                    });

                    meta.hot.dispose(() => {
                        // Cleanup any side-effects. Optional.
                        // scope.$emit('$destroy');
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