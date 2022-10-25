
# :rocket: Vtex Lazyloading :rocket:
A [vtex-lazyload](https://github.com/Zeindelf/vtex-lazyload) based plugin for lazy loading Vtex components, other elements and images.

It also works for other platforms and projects.
##  :mag:Demo:mag:
https://codepen.io/fcorebiz/pen/yLELxNz

## :white_check_mark:Instalation:white_check_mark:
`$ npm install vtex-lazyloading` or download the file lazyloading.js

```html
<script type="text/javascript" src="/arquivos/lazyloading.min.js"></script>
```

## :wrench:Usage:wrench:

For images and Iframes 
```html
<img data-lazy="https://via.placeholder.com/700x400" alt="placeholder"/></noscript>
<iframe data-lazy="https://www.youtube.com/embed/Y4goaZhNt4k" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
```
For Vtex components
```html
<div class="your-class" data-lazy="true">
  <noscript><vtex:contentPlaceHolder id="Main-Banner" /></noscript>
</div>
```

For other elements 
```html
<div class="your-class" data-lazy="true">
  <noscript>
    <div class="your-other-class">
      <img src="https://via.placeholder.com/700x400" alt="placeholder"/>
    </div>
  </noscript>
</div>
```

```js
const lazyload = new LazyLoadInstance('[data-lazy]', {
    root: null,
    margin: '400px 20px', 
    threshold: 0
});
```

**Methods**
```js
 lazyload.update();
 lazyload.reinit();
 lazyload.destroy();
 lazyload.destroyInElement(document.querySelector('#test'))
```


**Custom styles**

You can use the following classes to custom style:
```css
.--lazy-waiting   { /* Uses when element is loading */ }
.--lazy-loaded    { /* Uses when element is visible */ }
.--lazy-triggered { /* Uses when element is triggered */ }
```

## License
Open source licensed under the [MIT license](https://opensource.org/licenses/MIT).
