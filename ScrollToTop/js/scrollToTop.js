(function () {

  //兼容window对象
  var root = (typeof self === 'object' && self.self === self && self) ||
    (typeof global === 'object' && global.global === global && global) ||
    this || {};

  // requestAnimationFrame 兼容到 IE6
  var lastTime = 0;
  var vendors = ['ms', 'moz', 'webkit', 'o'];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame']
      || window[vendors[x] + 'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = function (callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
      var id = window.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }
  if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = function (id) {
      clearTimeout(id);
    };
  }

  // bind 函数在 IE7-8 不能使用
  Function.prototype.bind = Function.prototype.bind || function (context) {
    if (typeof this !== "function") {
      throw new Error("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var self = this;
    var args = Array.prototype.slice.call(arguments, 1);

    var fNOP = function () { };

    var fBound = function () {
      var bindArgs = Array.prototype.slice.call(arguments);
      self.apply(this instanceof fNOP ? this : context, args.concat(bindArgs));
    }

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
    return fBound;
  }

  utils = {
    //处理默认数值
    extends: function (targe) {
      for (var i = 0; i < arguments.length; i++) {
        for (var prop in arguments[i]) {
          if (arguments[i].hasOwnProperty(prop)) {
            targe[prop] = arguments[i][prop];
          }
        }
      }
      return targe;
    },


    //设置透明度
    setOpacity: function (element, opacity) {
      if (element.style.opacity !== undefined) {
        element.style.opacity = opacity;
      } else {
        element.style.filter = "alpha(opacity=" + opacity + ")";
      }
    },


    //绑定事件
    addEvent: function (element, type, fn) {
      if (document.addEventListener) {
        element.addEventListener(type, fn, false)
        return fn
      } else if (document.attachEvent) {
        var bound = function () {
          return fn.call(element)
        }
        element.attachEvent('on' + type, bound)
        return bound
      }
    },

    //获取滚轮距离
    getScrollOffsets: function () {
      var w = window;
      if (w.pageXOffset !== null) return { x: pageXOffset, y: pageYOffset };
      var d = w.document;
      if (d.compatMode === 'CSS1Compat') {
        return {
          x: d.documentElement.offsetTop,
          y: d.documentElement.offsetLeft
        }
      }
      return { x: d.body.offsetTop, y: d.body.offsetLeft }
    },


    //显形
    fadeIn: function (element, speed) {
      var opacity = 0;
      utils.setOpacity(element, 0);
      var timer;

      function step() {
        utils.setOpacity(element, opacity += speed);
        if (opacity < 100) {
          timer = requestAnimationFrame(step);
        } else {
          cancelAnimationFrame(timer);
        }
      }
      requestAnimationFrame(step);
    },

    //隐形
    fadeOut: function (element, speed) {
      var opacity = 100;
      utils.setOpacity(element, 100);
      var timer;

      function step() {
        utils.setOpacity(element, opacity -= speed);
        if (opacity > 0) {
          timer = requestAnimationFrame(step);
        } else {
          cancelAnimationFrame(timer);
        }
      }
      requestAnimationFrame(step);
    },

    //添加类
    addClass: function (element, className) {
      var classNames = element.className.split(/\+s/)
      var index = classNames.indexOf(classNames, className)
      if (index === -1) {
        classNames.push(className)
      }
      element.className = classNames.join(' ')
    },

    //移除类
    removeClass: function (element, className) {
      var classNames = element.className.split(/\+s/)
      var index = classNames.indexOf(classNames, className)
      console.log(classNames)
      console.log(index)
      if (index !== -1) {
        classNames.splice(index, 1)
      }
      element.className = classNames.join(' ')
    },


    //判定数据中是否存在特定值
    indexOf: function (arr, item) {
      var i = 0, result = -1;
      for (i; arr.length; i++) {
        if (arr[i] === item) {
          result = i;
          break;
        }
      }
      return result
    }
  }

  /**
   * 回到顶部
   * @param {*} element 
   * @param {*} options 
   */

  function ScrollToTop(element, options) {

    //选定器
    this.element = typeof element === 'string' ? document.querySelector(element) : element;

    //参数
    this.options = utils.extends({}, this.constructor.defaultOptions, options);

    //初始化
    this.init();
  }


  ScrollToTop.defaultOptions = {
    // 默认值为 100，表示滚动条向下滑动 100px 时，出现回到顶部按钮
    showWhen: 100,
    // 回到顶部的速度。默认值为 100，数值越大，速度越快。 100 表示浏览器每次重绘，scrollTop 就减去 100px。
    speed: 100,
    // 元素淡入和淡出的速度。默认值为 10，数值越大，速度越快。 10 表示浏览器每次重绘，元素透明度以 10% 递增或者递减。
    fadeSpeed: 10
  }

  var proto = ScrollToTop.prototype;

  proto.init = function () {
    //隐藏元素
    this.hideElement();
    //控制滚轮
    this.bindScroll();
    //点击事件
    this.bindClick();
  }

  //隐藏元素
  proto.hideElement = function () {
    utils.setOpacity(this.element, 0);
    this.status = 'hide';
  }

  //控制滚轮
  proto.bindScroll = function () {
    var that = this;
    utils.addEvent(window, 'scroll', function () {
      if (utils.getScrollOffsets().y > that.options.showWhen) {
        if (that.status === 'hide') {
          utils.fadeIn(that.element, that.options.speed);
          that.status = 'show';
        }
      } else {
        if (that.status === 'show') {
          utils.fadeOut(that.element, that.options.speed);
          utils.removeClass(that.element, 'backing');
          that.status = 'hide';
        }
      }
    })
  }

  //点击事件
  proto.bindClick = function () {
    var that = this, timer;
    utils.addEvent(that.element, 'click', function () {
      utils.addClass(that.element, 'backing');
      cancelAnimationFrame(timer)
      timer = requestAnimationFrame(function fn() {
        var oTop = document.documentElement.scrollTop || documentElement.body.scrollTop;
        if (oTop > that.options.showWhen) {
          document.documentElement.scrollTop = document.body.scrollTop = oTop - that.options.speed;
          timer = requestAnimationFrame(fn)
        } else {
          cancelAnimationFrame(timer)
        }
      })
    })
  }


  //确定当前环境是node环境还是浏览器环境
  if (typeof exports !== 'undefined' && !exports.nodeType) {
    if (typeof module !== 'undefined' && !module.nodeType && module.exports) {
      exports = exports.module = ScrollToTop;
    } else {
      exports.ScrollToTop = ScrollToTop;
    }
  } else {
    //浏览器环境，_方法挂载到window上
    root.ScrollToTop = ScrollToTop;
  }
}())