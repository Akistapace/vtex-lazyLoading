function LazyLoadInstance(_options) {
    this.lazyElements = document.querySelectorAll(_options.targets);
    this.options = {
        root: _options.root != null ? document.querySelector(_options.root) : null,
        rootMargin: _options.margin || '300px 20px',
        // threshold:  _options.threshold || 0
    };
    this.onRender = _options.onRender;
    let lazyloadThrottleTimeout;
    const hasIntersect = ()=> 'IntersectionObserver' in window ? true : false;
    const callback = (entries, observer) => {
        entries.forEach(entry => {    
            
            if (entry.isIntersecting) {
                const element = entry.target;
                if (element.tagName.toLowerCase() == 'img' 
                || element.tagName.toLowerCase() == 'iframe') {
                    element.src = element.dataset.lazy;

                    element.classList.remove('--lazy-waiting');
                    element.classList.add('--lazy-loaded');
                    
                    this.onRender ? this.onRender(element) : '';
                    this.lazyInstance.unobserve(element);

                } else {
                    const template = element.textContent || element.innerHTML;
                    element.insertAdjacentHTML('afterbegin', template);

                    element.classList.remove('--lazy-waiting');
                    element.classList.add('--lazy-loaded');

                    
                    element.querySelector('noscript') ?  element.querySelector('noscript').remove() : ''                    
                    
                    this.onRender ? this.onRender(element) : ''
                    this.lazyInstance.unobserve(element);
                }
            }
        });
    };
    const placeholder = {
        is_image: (el)=> el.tagName.toLowerCase() == 'img' ? true : false,
        set_placeholder: (el)=> el.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=',
    }
    const lazyload = ()=> {
        if(lazyloadThrottleTimeout) { clearTimeout(lazyloadThrottleTimeout)  }    

        lazyloadThrottleTimeout = setTimeout(()=> {
          var scrollTop = window.pageYOffset;
          this.lazyElements.forEach((element)=> {
              let active = false
              if(!active && element.offsetTop < (window.innerHeight + scrollTop)) {
                  active = true
                  if (element.tagName.toLowerCase() == 'img' 
                  || element.tagName.toLowerCase() == 'iframe') {
                      if (!element.classList.contains('--lazy-loaded')) {
                          element.src = element.dataset.lazy;
                          element.classList.remove('--lazy-waiting');
                          element.classList.add('--lazy-loaded');
                            
                          this.onRender ? this.onRender(element) : '';
                      }
                  } else {
                      if (!element.classList.contains('--lazy-loaded')) {
                          const template = element.textContent || element.innerHTML;
                          element.insertAdjacentHTML('afterbegin', template);
      
                          element.classList.remove('--lazy-waiting');
                          element.classList.add('--lazy-loaded');    
                          
                          element.querySelector('noscript') ?  element.querySelector('noscript').remove() : ''                    
                          
                          this.onRender ? this.onRender(element) : '';
                      }
                  }
              }
          });
          if(this.lazyElements.length == 0) { 
            document.removeEventListener("scroll", lazyload);
            window.removeEventListener("resize", lazyload);
            window.removeEventListener("orientationChange", lazyload);
          }
        }, 20);
    }
    !hasIntersect() ? this.lazyInstance = new IntersectionObserver(callback, this.options) : this.lazyInstance = '';
    
    // ====================================================== //
    // ====================== FALLBACKS ===================== //
    // ====================================================== //
    this.fallbackRunner = (param)=> {
        let target = document
        _options.root != null ? target = document.querySelector(_options.root) : '';
        
        param ? (
            lazyload(),
            target.addEventListener('DOMContentLoaded', lazyload),
            target.addEventListener('scroll', lazyload, {passive: true}),

            window.addEventListener('resize', lazyload),
            window.addEventListener('orientationchange', lazyload)
        ) : (
            target.removeEventListener('DOMContentLoaded', lazyload),
            target.removeEventListener('scroll', lazyload),
            console.log('DESTROY FALSE'),
            window.removeEventListener('resize', lazyload),
            window.removeEventListener('orientationchange', lazyload)
        )
    }
    this.fallbackLazyload = ()=> {      
        this.lazyElements.forEach((element)=> {
            element.classList.contains('--lazy-triggered') ? element.classList.add('--lazy-triggered') : element.classList.add('--lazy-triggered', '--lazy-waiting')
        });

        this.fallbackRunner(true);
    }
    this.fallbackDestroyInElement = (_el)=> {
        let el = document.querySelector(_el+':not(.--lazy-loaded)');
        if (_el) {
            if (el.dataset.lazy) {
                el.setAttribute('data-stoped-lazy', el.dataset.lazy);
                el.removeAttribute('data-lazy');
                el.classList.remove('--lazy-triggered')
                el.classList.remove('--lazy-waiting')
                
                this.lazyElements = Array.from(this.lazyElements).filter(e=> e != _el) 
            }
        }
    }
    this.runnerLazyload = ()=> {
        if(!hasIntersect()) {
            this.lazyElements.forEach(el => {
                el.classList.contains('--lazy-triggered')
                ? (el.classList.add('--lazy-triggered'))
                : (el.classList.add('--lazy-triggered', '--lazy-waiting'))
                
                this.lazyInstance.observe(el);
            });
        } else {
            this.fallbackLazyload()
        }
    }
    this.destroy = ()=> !hasIntersect() ? this.lazyInstance.disconnect() : this.fallbackRunner(false) ;
    this.destroyInElement = (_el)=> {
        !hasIntersect() ? this.lazyInstance.unobserve(document.querySelector(_el)) : this.fallbackDestroyInElement(_el)
    }
    this.update = ()=> {
        this.lazyElements = document.querySelectorAll(`${_options.targets}`);
        !hasIntersect() ? this.runnerLazyload() : this.fallbackLazyload(true);
    }    
    this.reinit = ()=> {
        let checkStopedLazys = document.querySelectorAll('[data-stoped-lazy]');
        if(checkStopedLazys.length > 0) {
            checkStopedLazys.forEach(el => {
                el.setAttribute('data-lazy', el.dataset.stopedLazy);
                el.removeAttribute('data-stopedLazy');
            });
        }

        this.lazyElements = document.querySelectorAll(`${_options.targets}`);
        !hasIntersect() ? this.runnerLazyload() : this.fallbackLazyload(true);
    } 
    this.runnerLazyload();
}


module.exports = LazyLoadInstance