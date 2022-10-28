function LazyLoadInstance(_options) {
    this.lazyElements = document.querySelectorAll(_options.targets);
    this.options = {
        root:       _options.root || null,
        rootMargin: _options.margin || '300px 20px',
        threshold:  _options.threshold || 0
    };

    const hasIntersect = ()=> 'IntersectionObserver' in window ? true : false;
    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const element = entry.target;
                console.log('Loaded', element);
                if (element.tagName.toLowerCase() == 'img' 
                || element.tagName.toLowerCase() == 'iframe') {
                    element.src = element.dataset.lazy;
                    element.classList.remove('--lazy-waiting');
                    element.classList.add('--lazy-loaded');
                    this.lazyInstance.unobserve(element);
                } else {
                    const template = element.textContent || element.innerHTML;
                    element.insertAdjacentHTML('afterbegin', template);
                    element.classList.remove('--lazy-waiting');
                    element.classList.add('--lazy-loaded');
                    element.querySelector('noscript') ?  element.querySelector('noscript').remove() : ''                    
                    this.lazyInstance.unobserve(element);
                }
            }
        });
    };

    hasIntersect() ? this.lazyInstance = new IntersectionObserver(callback, this.options) : this.lazyInstance = ''
    this.runnerLazyload = ()=> {
        console.log('runnerLazyload');
        if(hasIntersect()) {
            this.lazyElements.forEach(element => {
                element.classList.add('--lazy-triggered', '--lazy-waiting');
                this.lazyInstance.observe(element);
            });
        } else {
            console.log('IntersectionObserver is not present in this browser');
            this.lazyElements.forEach(element => {
                element.classList.add(['--lazy-triggered', '--lazy-waiting']);
                if (element.tagName.toString() == 'img' || element.tagName.toString() == 'iframe') {
                    element.src = element.dataset.lazy;
                } else {
                    const template = element.textContent || element.innerHTML;
                    element.insertAdjacentHTML('afterbegin', template);                
                    element.querySelector('noscript').remove();      
                }
            });
        }
    }
    this.destroy = ()=> hasIntersect()    ? this.lazyInstance.disconnect()   : console.log('Is not possible to stopAllLazyLoading');
    this.destroyInElement    = (_el)=> hasIntersect() ? this.lazyInstance.unobserve(_el) : console.log('Is not possible to stopLazyElement');
    this.update = ()=> {
        this.lazyElements = document.querySelectorAll(`${_options.targets}:not(.--lazy-triggered)`);
        this.runnerLazyload();
    }
    
    this.reinit = ()=> {
        this.lazyElements = document.querySelectorAll(`${_options.targets}`);
        this.runnerLazyload();
    } 
    // Executa o observer nos elementos na primeira vez
    this.runnerLazyload()
}

module.exports = LazyLoadInstance