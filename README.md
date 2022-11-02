<div align="center">

# :rocket:Vtex Lazyloading
</div>


<div align="center">
  Give me a star on this project if it has been helpful.

  [![GitHub stars](https://badgen.net/github/stars/Akistapace/vtex-lazyloading)](https://GitHub.com/Akistapace/vtex-lazyloading/stargazers/) [![Npm package daily downloads](https://badgen.net/npm/dd/vtex-lazyloading)](npmjs.com/package/vtex-lazyloading)

  
</div>

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

#### Javascript
#### CDN
You can put this CDN in your HTML
```html
<script src="https://cdn.jsdelivr.net/npm/vtex-lazyloading/lazyloading.min.js"></script>
```
And call it in your js file like this:point_down:
```js
let lazyload = new VtexLazyload({options}) 
```

Or you can install this and export in your file
```html
npm i vtex-lazyload
```

```js
import vtexLazyload from "vtex-lazyloading";
const lazyload = new vtexLazyload({
    root: null,
    targets: '[data-lazy]',
    margin: '300px 20px',
    onRender: (e)=> {
        console.log('Rendering');
        if (e.classList.contains('target')) {
            e.style.opacity = 0.5;
        }
    },
});
```
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



| Params      | Example | Description |
| ----------- | ------- | ----------- |
| targets   | _#id_, _.class_, _[atributes]_ | define all the lazy elements        |
| root        | _null_, _#id_, _.class_, _[atributes]_ | the parent container to trigger the lazy elements, if null is the entire viewport / window.      |
| margin      | _10px_ | is the distance in pixels for the element to be loaded before it becomes visible in the window       |
| onRender      | function | Executes a callback when the element is loaded  |

**Events**
```js
onRender: (e)=> {
    console.log('Rendering element');
}
```

**Methods**
```js
 lazyload.update();
 lazyload.reinit();
 lazyload.destroy();
 lazyload.destroyInElement('#test');
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

## :pencil2:Author
Fernando Oliveira Aquistapace - [Linkedin]([dsdadsa](https://www.linkedin.com/in/fernando-aquistapace-33a414165/))

## License
Open source licensed under the [MIT license](https://opensource.org/licenses/MIT).
