export interface VtexLazyloadOptions {
  root?: string | null;
  targets: string;
  margin?: string;
  placeholder?: boolean;
  onRender?: (el: HTMLElement) => void;
}

export default class VtexLazyload {
  private options: VtexLazyloadOptions;
  private root: Element | null;
  private lazyElements: NodeListOf<HTMLElement>;
  private onRender?: (el: HTMLElement) => void;
  private placeholder?: boolean;
  private lazyInstance: IntersectionObserver | null = null;
  private lazyloadThrottleTimeout?: ReturnType<typeof setTimeout>;

  constructor(_options: VtexLazyloadOptions) {
    this.options = _options;
    this.root = _options.root != null ? document.querySelector(_options.root) : null;
    this.lazyElements = document.querySelectorAll<HTMLElement>(this.getElementsInRoot());
    this.onRender = _options.onRender;
    this.placeholder = _options.placeholder;

    if (this.hasIntersect()) {
      this.lazyInstance = new IntersectionObserver(this.listenerIntersection, {
        rootMargin: _options.margin || '300px 20px',
        root: this.root,
      });
    }

    this.runnerLazyload();
    console.log('%cstart vtex-Lazyloading', 'color:#16c111;font-size: 16px;font-wheight: 700');
  }

  private getElementsInRoot = (): string => {
    return this.root != null
      ? `${this.options.root} ${this.options.targets}:not(.--lazy-loaded)`
      : `${this.options.targets}:not(.--lazy-loaded)`;
  };

  private hasIntersect(): boolean {
    return 'IntersectionObserver' in window;
  }

  private checkTagName(el: Element, tag: string): boolean {
    return el.tagName.toLowerCase() === tag;
  }

  private setPlaceholder(el: HTMLElement): void {
    (el as HTMLImageElement).src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  }

  private isInViewport(ele: Element, container: Element): boolean {
    const { bottom, height, top } = ele.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return top <= containerRect.top
      ? containerRect.top - top <= height
      : bottom - containerRect.bottom <= height;
  }

  private fallbackRunner = (): void => {
    if (this.lazyloadThrottleTimeout) {
      clearTimeout(this.lazyloadThrottleTimeout);
    }

    this.lazyloadThrottleTimeout = setTimeout(() => {
      const scrollTop = this.root == null ? window.pageYOffset : 0;

      this.lazyElements.forEach((el) => {
        let active = false;
        const check =
          this.root == null
            ? el.offsetTop < window.innerHeight + scrollTop
            : this.isInViewport(el, document.querySelector(this.options.root as string) as Element);

        if (!active && check) {
          if (this.checkTagName(el, 'img') || this.checkTagName(el, 'iframe')) {
            active = true;
            if (!el.classList.contains('--lazy-loaded')) {
              (el as HTMLImageElement | HTMLIFrameElement).src = el.dataset.lazy as string;
              if ('srcset' in el) {
                (el as HTMLImageElement).srcset = el.dataset.lazySet as string;
              }
              el.classList.remove('--lazy-waiting');
              el.classList.add('--lazy-loaded');
              if (this.onRender) this.onRender(el);

              el.addEventListener('error', () => el.classList.add('--lazy-error'));
            }
          } else {
            active = true;
            if (!el.classList.contains('--lazy-loaded')) {
              const template = el.textContent || el.innerHTML;
              el.insertAdjacentHTML('afterbegin', template);

              el.classList.remove('--lazy-waiting');
              el.classList.add('--lazy-loaded');

              const noscript = el.querySelector('noscript');
              if (noscript) noscript.remove();

              if (this.onRender) this.onRender(el);
            }
          }
        }
      });

      if (this.lazyElements.length === 0) {
        document.removeEventListener('scroll', this.fallbackRunner);
        window.removeEventListener('resize', this.fallbackRunner);
        window.removeEventListener('orientationchange', this.fallbackRunner);
      }
    }, 20);
  };

  private listenerIntersection = (entries: IntersectionObserverEntry[]): void => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const el = entry.target as HTMLElement;
        if (this.checkTagName(el, 'img') || this.checkTagName(el, 'iframe')) {
          (el as HTMLImageElement | HTMLIFrameElement).src = el.dataset.lazy as string;
          if ('srcset' in el) {
            (el as HTMLImageElement).srcset = el.dataset.lazySet as string;
          }

          el.classList.remove('--lazy-waiting');
          el.classList.add('--lazy-loaded');

          if (this.onRender) this.onRender(el);
          this.lazyInstance?.unobserve(el);

          el.addEventListener('error', () => el.classList.add('--lazy-error'));
        } else {
          const template = el.textContent || el.innerHTML;
          el.insertAdjacentHTML('afterbegin', template);

          el.classList.remove('--lazy-waiting');
          el.classList.add('--lazy-loaded');

          const noscript = el.querySelector('noscript');
          if (noscript) noscript.remove();

          if (this.onRender) this.onRender(el);
          this.lazyInstance?.unobserve(el);
        }
      }
    });
  };

  private fallbackRunnerListeners = (param: boolean): void => {
    const target: Document | Element =
      this.options.root != null ? (document.querySelector(this.options.root) as Element) : document;

    if (param) {
      this.fallbackRunner();
      target.addEventListener('scroll', this.fallbackRunner, { passive: true });
      document.addEventListener('DOMContentLoaded', this.fallbackRunner);
      window.addEventListener('resize', this.fallbackRunner);
      window.addEventListener('orientationchange', this.fallbackRunner);
    } else {
      target.removeEventListener('scroll', this.fallbackRunner);
      document.removeEventListener('DOMContentLoaded', this.fallbackRunner);
      window.removeEventListener('resize', this.fallbackRunner);
      window.removeEventListener('orientationchange', this.fallbackRunner);
    }
  };

  private fallbackLazyload = (): void => {
    this.lazyElements.forEach((element) => {
      if (!element.classList.contains('--lazy-triggered')) {
        element.classList.add('--lazy-triggered', '--lazy-waiting');
      }
      if (this.checkTagName(element, 'img') && this.placeholder) {
        this.setPlaceholder(element);
      }
    });

    this.fallbackRunnerListeners(true);
  };

  private fallbackDestroyInElement = (_el: string): void => {
    const el = document.querySelector<HTMLElement>(`${_el}:not(.--lazy-loaded)`);
    if (el && el.getAttribute('data-lazy')) {
      el.setAttribute('data-stoped-lazy', el.dataset.lazy as string);
      el.removeAttribute('data-lazy');
      el.classList.remove('--lazy-triggered');
      el.classList.remove('--lazy-waiting');

      this.lazyElements = Array.from(this.lazyElements).filter(
        (e) => e !== el
      ) as unknown as NodeListOf<HTMLElement>;
    }
  };

  private runnerLazyload = (): void => {
    if (this.hasIntersect()) {
      this.lazyElements.forEach((el) => {
        if (this.checkTagName(el, 'img') && this.placeholder) {
          this.setPlaceholder(el);
        }

        if (el.classList.contains('--lazy-triggered')) {
          el.classList.add('--lazy-triggered');
        } else {
          el.classList.add('--lazy-triggered', '--lazy-waiting');
        }

        this.lazyInstance?.observe(el);
      });
    } else {
      this.fallbackLazyload();
    }
  };

  public destroy = (): void => {
    if (this.hasIntersect()) {
      this.lazyInstance?.disconnect();
    } else {
      this.fallbackRunnerListeners(false);
    }
  };

  public destroyInElement = (_el: string): void => {
    if (this.hasIntersect()) {
      const el = document.querySelector(_el);
      if (el) this.lazyInstance?.unobserve(el);
    } else {
      this.fallbackDestroyInElement(_el);
    }
  };

  public update = (): void => {
    this.lazyElements = document.querySelectorAll<HTMLElement>(this.getElementsInRoot());
    if (this.hasIntersect()) {
      this.runnerLazyload();
    } else {
      this.fallbackLazyload();
    }
  };

  public reinit = (): void => {
    const checkStopedLazys = document.querySelectorAll<HTMLElement>(
      this.root != null ? `${this.options.root} [data-stoped-lazy]` : '[data-stoped-lazy]'
    );
    if (checkStopedLazys.length > 0) {
      checkStopedLazys.forEach((el) => {
        el.setAttribute('data-lazy', el.dataset.stopedLazy as string);
        el.removeAttribute('data-stopedLazy');
      });
    }

    this.lazyElements = document.querySelectorAll<HTMLElement>(this.getElementsInRoot());
    if (this.hasIntersect()) {
      this.runnerLazyload();
    } else {
      this.fallbackLazyload();
    }
  };
}
