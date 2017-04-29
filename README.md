# Happenize

Write less code, be more productive. This framework allows you to quickly create AngularJS applications by providing the foundation built on Webpack.

## Features

### ES6/7 built-in

No classes, just plain AngularJS controllers so you can take advantage of $scope prototype inheritance.

- src/app/home/controller.js
```javascript
export default function ($scope) {
    $scope.sayHello = () => alert('Hello world');
}
```

### Convention over configuration
Just place your {template.html, controller.js, style.less} files and the angular component will be created for you. You don't need all of them.
If you just need markup template.html would suffice. If your component has no view but just the logic, controller.js would suffice for this case.

### Namespaces and nested components

```html
<!-- this will reference the component placed in 'components/header/components/menu' -->
<header.menu></header.menu>

<!-- 
    This will reference the component from the current scope, which is indicated by the starting ':' character.
    Assuming we are in the 'components/list/template.html', this will load component from 'components/list/components/item' path.
    For this case <list.item></list.item> would be an equivalent.
-->
<:item></:item>
```

## How to use it?

Just install it with npm
> npm install happns/happenize --save

- src/webpack.config.js
```javascript
var happenize = require('happenize');

module.exports = happenize;
```

- src/app/app.module.js
```javascript
/* global angular */
import States from './app.states';

// This will import your stuff placed in 'src/app/shared'
import Services from 'services';
import Partials from 'partials';
import Components from 'components';
import Directives from 'directives';
import Filters from 'filters';

import registerPartials from 'happenize/utils/registerPartials.js';
import registerNamespace from 'happenize/utils/registerNamespace.js';

var App = angular.module('app', [ 'ui.router' ]);

registerNamespace.bind(App)(Services, 'service');
registerNamespace.bind(App)(Directives, 'directive');
registerNamespace.bind(App)(Filters, 'filter');

App.config(function ($compileProvider) {
    App.compileProvider = $compileProvider;

    var isThemeable = false;
    registerPartials.bind(App)(Partials, null, isThemeable);
    registerPartials.bind(App)(Components, null, isThemeable);
});

App.config(States);
```

- src/app/app.states.js
```javascript
// this will load your root components placed in src/app/components
import Components from './components';
import resolveComponent from 'happenize/utils/resolveComponent.js';

export default function ($locationProvider, $stateProvider, $urlRouterProvider) {
    var component = name => resolveComponent(name, Components);

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise("/");

    $stateProvider
        .state('home', component('home'));
}
```
