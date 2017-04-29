export default function (component, ns) {

    if (component.template) {
        var templateUrl = `template/${ns}`;

        var $templateCache = angular.element('body').injector().get('$templateCache');

        if (!$templateCache.get(templateUrl)) {
            $templateCache.put(templateUrl, component.template);
        }

        component.templateUrl = templateUrl;
        delete component.template;
    }

    return component;
}
