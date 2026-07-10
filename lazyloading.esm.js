// src/index.ts
var VtexLazyload = class {
  constructor(_options) {
    this.lazyInstance = null;
    this.getElementsInRoot = () => {
      return this.root != null ? `${this.options.root} ${this.options.targets}:not(.--lazy-loaded)` : `${this.options.targets}:not(.--lazy-loaded)`;
    };
    this.fallbackRunner = () => {
      if (this.lazyloadThrottleTimeout) {
        clearTimeout(this.lazyloadThrottleTimeout);
      }
      this.lazyloadThrottleTimeout = setTimeout(() => {
        const scrollTop = this.root == null ? window.pageYOffset : 0;
        this.lazyElements.forEach((el) => {
          let active = false;
          const check = this.root == null ? el.offsetTop < window.innerHeight + scrollTop : this.isInViewport(el, document.querySelector(this.options.root));
          if (!active && check) {
            if (this.checkTagName(el, "img") || this.checkTagName(el, "iframe")) {
              active = true;
              if (!el.classList.contains("--lazy-loaded")) {
                el.src = el.dataset.lazy;
                if ("srcset" in el) {
                  el.srcset = el.dataset.lazySet;
                }
                el.classList.remove("--lazy-waiting");
                el.classList.add("--lazy-loaded");
                if (this.onRender) this.onRender(el);
                el.addEventListener("error", () => el.classList.add("--lazy-error"));
              }
            } else {
              active = true;
              if (!el.classList.contains("--lazy-loaded")) {
                const template = el.textContent || el.innerHTML;
                el.insertAdjacentHTML("afterbegin", template);
                el.classList.remove("--lazy-waiting");
                el.classList.add("--lazy-loaded");
                const noscript = el.querySelector("noscript");
                if (noscript) noscript.remove();
                if (this.onRender) this.onRender(el);
              }
            }
          }
        });
        if (this.lazyElements.length === 0) {
          document.removeEventListener("scroll", this.fallbackRunner);
          window.removeEventListener("resize", this.fallbackRunner);
          window.removeEventListener("orientationchange", this.fallbackRunner);
        }
      }, 20);
    };
    this.listenerIntersection = (entries) => {
      entries.forEach((entry) => {
        var _a, _b;
        if (entry.isIntersecting) {
          const el = entry.target;
          if (this.checkTagName(el, "img") || this.checkTagName(el, "iframe")) {
            el.src = el.dataset.lazy;
            if ("srcset" in el) {
              el.srcset = el.dataset.lazySet;
            }
            el.classList.remove("--lazy-waiting");
            el.classList.add("--lazy-loaded");
            if (this.onRender) this.onRender(el);
            (_a = this.lazyInstance) == null ? void 0 : _a.unobserve(el);
            el.addEventListener("error", () => el.classList.add("--lazy-error"));
          } else {
            const template = el.textContent || el.innerHTML;
            el.insertAdjacentHTML("afterbegin", template);
            el.classList.remove("--lazy-waiting");
            el.classList.add("--lazy-loaded");
            const noscript = el.querySelector("noscript");
            if (noscript) noscript.remove();
            if (this.onRender) this.onRender(el);
            (_b = this.lazyInstance) == null ? void 0 : _b.unobserve(el);
          }
        }
      });
    };
    this.fallbackRunnerListeners = (param) => {
      const target = this.options.root != null ? document.querySelector(this.options.root) : document;
      if (param) {
        this.fallbackRunner();
        target.addEventListener("scroll", this.fallbackRunner, { passive: true });
        document.addEventListener("DOMContentLoaded", this.fallbackRunner);
        window.addEventListener("resize", this.fallbackRunner);
        window.addEventListener("orientationchange", this.fallbackRunner);
      } else {
        target.removeEventListener("scroll", this.fallbackRunner);
        document.removeEventListener("DOMContentLoaded", this.fallbackRunner);
        window.removeEventListener("resize", this.fallbackRunner);
        window.removeEventListener("orientationchange", this.fallbackRunner);
      }
    };
    this.fallbackLazyload = () => {
      this.lazyElements.forEach((element) => {
        if (!element.classList.contains("--lazy-triggered")) {
          element.classList.add("--lazy-triggered", "--lazy-waiting");
        }
        if (this.checkTagName(element, "img") && this.placeholder) {
          this.setPlaceholder(element);
        }
      });
      this.fallbackRunnerListeners(true);
    };
    this.fallbackDestroyInElement = (_el) => {
      const el = document.querySelector(`${_el}:not(.--lazy-loaded)`);
      if (el && el.getAttribute("data-lazy")) {
        el.setAttribute("data-stoped-lazy", el.dataset.lazy);
        el.removeAttribute("data-lazy");
        el.classList.remove("--lazy-triggered");
        el.classList.remove("--lazy-waiting");
        this.lazyElements = Array.from(this.lazyElements).filter(
          (e) => e !== el
        );
      }
    };
    this.runnerLazyload = () => {
      if (this.hasIntersect()) {
        this.lazyElements.forEach((el) => {
          var _a;
          if (this.checkTagName(el, "img") && this.placeholder) {
            this.setPlaceholder(el);
          }
          if (el.classList.contains("--lazy-triggered")) {
            el.classList.add("--lazy-triggered");
          } else {
            el.classList.add("--lazy-triggered", "--lazy-waiting");
          }
          (_a = this.lazyInstance) == null ? void 0 : _a.observe(el);
        });
      } else {
        this.fallbackLazyload();
      }
    };
    this.destroy = () => {
      var _a;
      if (this.hasIntersect()) {
        (_a = this.lazyInstance) == null ? void 0 : _a.disconnect();
      } else {
        this.fallbackRunnerListeners(false);
      }
    };
    this.destroyInElement = (_el) => {
      var _a;
      if (this.hasIntersect()) {
        const el = document.querySelector(_el);
        if (el) (_a = this.lazyInstance) == null ? void 0 : _a.unobserve(el);
      } else {
        this.fallbackDestroyInElement(_el);
      }
    };
    this.update = () => {
      this.lazyElements = document.querySelectorAll(this.getElementsInRoot());
      if (this.hasIntersect()) {
        this.runnerLazyload();
      } else {
        this.fallbackLazyload();
      }
    };
    this.reinit = () => {
      const checkStopedLazys = document.querySelectorAll(
        this.root != null ? `${this.options.root} [data-stoped-lazy]` : "[data-stoped-lazy]"
      );
      if (checkStopedLazys.length > 0) {
        checkStopedLazys.forEach((el) => {
          el.setAttribute("data-lazy", el.dataset.stopedLazy);
          el.removeAttribute("data-stopedLazy");
        });
      }
      this.lazyElements = document.querySelectorAll(this.getElementsInRoot());
      if (this.hasIntersect()) {
        this.runnerLazyload();
      } else {
        this.fallbackLazyload();
      }
    };
    this.options = _options;
    this.root = _options.root != null ? document.querySelector(_options.root) : null;
    this.lazyElements = document.querySelectorAll(this.getElementsInRoot());
    this.onRender = _options.onRender;
    this.placeholder = _options.placeholder;
    if (this.hasIntersect()) {
      this.lazyInstance = new IntersectionObserver(this.listenerIntersection, {
        rootMargin: _options.margin || "300px 20px",
        root: this.root
      });
    }
    this.runnerLazyload();
    console.log("%cstart vtex-Lazyloading", "color:#16c111;font-size: 16px;font-wheight: 700");
  }
  hasIntersect() {
    return "IntersectionObserver" in window;
  }
  checkTagName(el, tag) {
    return el.tagName.toLowerCase() === tag;
  }
  setPlaceholder(el) {
    el.src = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  }
  isInViewport(ele, container) {
    const { bottom, height, top } = ele.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return top <= containerRect.top ? containerRect.top - top <= height : bottom - containerRect.bottom <= height;
  }
};
export {
  VtexLazyload as default
};
//# sourceMappingURL=lazyloading.esm.js.map