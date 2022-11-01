export default function LazyLoadInstance(_options) {
    // ====================================================== //
    // ======================= OPTIONS ====================== //
    // ====================================================== //
    this.rootElement
    this.root =  _options.root != null ? document.querySelector(_options.root) : null,
    this.getElementsInRoot = ()=> this.root != null ? `${_options.root} ${_options.targets}:not(.--lazy-loaded)` : _options.targets+':not(.--lazy-loaded)'
    this.lazyElements = document.querySelectorAll(this.getElementsInRoot());
    this.options = {
        root: this.root,
        rootMargin: _options.margin || '300px 20px',
        // threshold:  _options.threshold || 0
    };
    this.onRender = _options.onRender;
    // ====================================================== //

    let lazyloadThrottleTimeout;
    const hasIntersect = ()=> 'IntersectionObserver' in window ? true : false;
    const checkTagName = (el, tag)=> el.tagName.toLowerCase() == tag;
    const callback = (entries, observer) => {
        entries.forEach(entry => {    
            
            if (entry.isIntersecting) {
                const el = entry.target;
                if (checkTagName(el,'img') || checkTagName(el,'iframe')) {
                    
                    el.src = el.dataset.lazy;
                    el.srcset ? el.srcset = el.dataset.lazySet : '';

                    el.classList.remove('--lazy-waiting');
                    el.classList.add('--lazy-loaded');
                    
                    this.onRender ? this.onRender(el) : '';
                    this.lazyInstance.unobserve(el);

                } else {
                    const template = el.textContent || el.innerHTML;
                    el.insertAdjacentHTML('afterbegin', template);

                    el.classList.remove('--lazy-waiting');
                    el.classList.add('--lazy-loaded');

                    
                    el.querySelector('noscript') ?  el.querySelector('noscript').remove() : ''                    
                    
                    this.onRender ? this.onRender(el) : ''
                    this.lazyInstance.unobserve(el);
                }
            }
        });
    };
    const placeholder = (el)=> el.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='
    

    // ====================================================== //
    // ====================== FALLBACKS ===================== //
    // ====================================================== //
    const isVisible = function (ele, container) {
        const { bottom, height, top } = ele.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
    
        return top <= containerRect.top ? containerRect.top - top <= height : bottom - containerRect.bottom <= height;
    };
    const fallbackRunner = ()=> {
        if(lazyloadThrottleTimeout) { clearTimeout(lazyloadThrottleTimeout)  }    

        lazyloadThrottleTimeout = setTimeout(()=> {
          let scrollTop = this.root == null ? window.pageYOffset : 0

          this.lazyElements.forEach((el)=> {
    
            let active = false;
            let check = this.root == null ?  el.offsetTop < (window.innerHeight + scrollTop) : isVisible(el, document.querySelector(_options.root))

            if(!active && check) {
                  active = true;

                  if (checkTagName(el,'img') || checkTagName(el,'iframe'))  {
                      if (!el.classList.contains('--lazy-loaded')) {
                        el.src = el.dataset.lazy;
                        el.srcset ? el.srcset = el.dataset.lazySet : '';
                        el.classList.remove('--lazy-waiting');
                        el.classList.add('--lazy-loaded');
                        
                        this.onRender ? this.onRender(el) : '';
                      }
                  } else {
                      if (!el.classList.contains('--lazy-loaded')) {
                          const template = el.textContent || el.innerHTML;
                          el.insertAdjacentHTML('afterbegin', template);
      
                          el.classList.remove('--lazy-waiting');
                          el.classList.add('--lazy-loaded');    
                          
                          el.querySelector('noscript') ?  el.querySelector('noscript').remove() : ''                    
                          
                          this.onRender ? this.onRender(el) : '';
                      }
                  }
              }
          });
          if(this.lazyElements.length == 0) { 
            document.removeEventListener("scroll", fallbackRunner);
            window.removeEventListener("resize", fallbackRunner);
            window.removeEventListener("orientationChange", fallbackRunner);
          }
        }, 20);
    }
    this.fallbackRunnerListeners = (param)=> {
        let target = document
        _options.root != null ? target = document.querySelector(_options.root) : '';

        param ? (
            fallbackRunner(),
            target.addEventListener('scroll', fallbackRunner, {passive: true}),
            document.addEventListener('DOMContentLoaded', fallbackRunner),
            window.addEventListener('resize', fallbackRunner),
            window.addEventListener('orientationchange', fallbackRunner)
        ) : (
            target.removeEventListener('scroll', fallbackRunner),   
            document.removeEventListener('DOMContentLoaded', fallbackRunner),
            window.removeEventListener('resize', fallbackRunner),
            window.removeEventListener('orientationchange', fallbackRunner)
        )
    }
    this.fallbackLazyload = ()=> {      
        this.lazyElements.forEach((element)=> {
            element.classList.contains('--lazy-triggered') ? element.classList.add('--lazy-triggered') : element.classList.add('--lazy-triggered', '--lazy-waiting')
            checkTagName(element, 'img') && _options.placeholder ? placeholder(element) : '';
        });

        this.fallbackRunnerListeners(true);
    }
    this.fallbackDestroyInElement = (_el)=> {
        let el = document.querySelector(_el+':not(.--lazy-loaded)');
        if (el && el.getAttribute('data-lazy')) {
            el.setAttribute('data-stoped-lazy', el.dataset.lazy);
            el.removeAttribute('data-lazy');
            el.classList.remove('--lazy-triggered')
            el.classList.remove('--lazy-waiting')
            
            this.lazyElements = Array.from(this.lazyElements).filter(e=> e != el) 
        }
    }    
    // ====================================================== //


    hasIntersect() ? this.lazyInstance = new IntersectionObserver(callback, this.options) : this.lazyInstance = '';
    this.runnerLazyload = ()=> {
        if(hasIntersect()) {
            this.lazyElements.forEach(el => {
                checkTagName(el, 'img') ? (_options.placeholder ? placeholder(el) : '') : ''

                el.classList.contains('--lazy-triggered')
                ? (el.classList.add('--lazy-triggered'))
                : (el.classList.add('--lazy-triggered', '--lazy-waiting'))
                
                this.lazyInstance.observe(el);
            });
        } else {
            this.fallbackLazyload();
        }
    }

    // ====================================================== //
    // ======================= Methods ====================== //
    // ====================================================== //
    this.destroy = ()=> hasIntersect() ? this.lazyInstance.disconnect() : this.fallbackRunnerListeners(false) ;
    this.destroyInElement = (_el)=> {
        hasIntersect() ? this.lazyInstance.unobserve(document.querySelector(_el)) : this.fallbackDestroyInElement(_el)
    }
    this.update = ()=> {
        this.lazyElements =  document.querySelectorAll(this.getElementsInRoot());
        hasIntersect() ? this.runnerLazyload() : this.fallbackLazyload(true);
    }    
    this.reinit = ()=> {
        let checkStopedLazys = document.querySelectorAll(this.root != null ? _options.root+' [data-stoped-lazy]' : '[data-stoped-lazy]');
        if(checkStopedLazys.length > 0) {
            checkStopedLazys.forEach(el => {
                el.setAttribute('data-lazy', el.dataset.stopedLazy);
                el.removeAttribute('data-stopedLazy');
            });
        }

        this.lazyElements = document.querySelectorAll(this.getElementsInRoot());
        hasIntersect() ? this.runnerLazyload() : this.fallbackLazyload(true);
    } 
    // ====================================================== //


    this.runnerLazyload();    
    console.log('%cstart vtex-Lazyloading','color:#16c111;font-size: 16px;font-wheight: 700');

}



