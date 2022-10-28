
# :rocket: Vtex Lazyloading :rocket:
A [vtex-lazyload](https://github.com/Zeindelf/vtex-lazyload) based plugin for lazy loading Vtex components, other elements and images.

It also works for other platforms and projects.
##  :mag:Demo
https://codepen.io/akistapace/pen/ExRjgYw

## :white_check_mark:Instalation
`$ npm install vtex-lazyloading` or download the file lazyloading.js

```html
<script type="text/javascript" src="/arquivos/lazyloading.min.js"></script>
```

## :wrench:Usage

#### HTML
For images and Iframes 
```html
<img data-lazy="https://via.placeholder.com/700x400" alt="placeholder"/></noscript>

<iframe data-lazy="https://www.youtube.com/embed/Y4goaZhNt4k" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```
For Vtex components
```html
<div class="your-parentElement" data-lazy="true">
  <noscript>
    ...
  </noscript>
</div>
```
#### Javascript
```js
const lazyload = new LazyLoadInstance({
    root: null; //document.querySelector('.element'),
    targets: '[data-lazy]',
    margin: '400px 20px'
});
```

| Params      | Example | Description |
| ----------- | ------- | ----------- |
| targets   | _#id_, _.class_, _[atributes]_ | define all the lazy elements        |
| root        | element | the parent container to trigger the lazy elements, if null is the entire viewport / window.      |
| margin      | _10px_ or _10%_ | is the distance in pixels or percentage for the element to be loaded before it becomes visible in the window       |


**Methods**
```js
 lazyload.update();
 lazyload.reinit();
 lazyload.destroy();
 lazyload.destroyInElement(document.querySelector('#test'))
```
| Params             | Description |
| ------------------ | ----------- |
| update()           | Updates and picks up new items on the DOM |
| reinit()           | Restart the lazy loader if it has stopped with **destroy** or **destroyInElement** |
| destroy()          | Destroys the lazy loader instance in all elements |
| destroyInElement() | Destroy the lazy load in an specific element |

**Custom styles**

You can use the following classes to custom style:
```css
.--lazy-waiting   { /* Uses when element is loading */ }
.--lazy-loaded    { /* Uses when element is visible */ }
.--lazy-triggered { /* Uses when element is tracked */ }
```

Note: If the element is inside a parent element that is hidden, the lazy load will only occur when the parent element is visible, this is good for when we have images in menus.

## License
Open source licensed under the [MIT license](https://opensource.org/licenses/MIT).
