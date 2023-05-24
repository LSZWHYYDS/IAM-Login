import styles from './jigsaw.css';
import request from 'umi-request';
import { parseQueryString } from '@/utils/common.utils';
import { message } from 'antd';
function getLoginConfig() {
  // console.log(slientId.getBoundingClientRect().width);
  const USERNAME_LOGIN = sessionStorage.getItem('use-seStorage-storage-state-demo1');
  return request(
    `/iam/login/slider?tcode=${sessionStorage.getItem(
      'tcode',
    )}&username=${USERNAME_LOGIN.replaceAll('"', '')}&screenWidth=${
      parseInt(slientId.getBoundingClientRect().width) - 4
    }`,
    {
      method: 'GET',
    },
  );
}
function getlengthConfig(length) {
  const USERNAME = sessionStorage.getItem('use-seStorage-storage-state-demo1');
  return request(
    `/iam/login/sliderVerify?tcode=${sessionStorage.getItem(
      'tcode',
    )}&username=${USERNAME.replaceAll('"', '')}&length=${parseInt(length)}`,
    {
      method: 'GET',
    },
  );
}
// w 330 h 170 404px h:260px
// const w = 388; // canvas宽度
// const h = 260; // canvas高度
let w, h;

const l = 42; // 滑块边长
const r = 9; // 滑块半径
const PI = Math.PI;
const L = l + r * 2 + 3; // 滑块实际边长
let self_Create_Element, self_Create_Element_Small, clientEnd, textElement;
let coordinatesX, that;
function createImgElement(width, height, id) {
  const div = document.createElement('div');
  div.id = id;
  div.style.width = width + 'px';
  div.style.height = height + 'px';
  return div;
}

function getRandomNumberByRange(start, end) {
  return Math.round(Math.random() * (end - start) + start);
}

function createCanvas(width, height) {
  const canvas = document.createElement('div');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function createImg(onload) {
  setTimeout(() => {
    onload();
  }, 700);
}

function createElement(tagName, className) {
  const element = document.createElement(tagName);
  className && (element.className = styles[className]);
  return element;
}

function setClass(element, className) {
  element.className = styles[className];
}

function addClass(element, className) {
  element.classList.add(styles[className]);
}

function removeClass(element, className) {
  element.classList.remove(styles[className]);
}

class Jigsaw {
  constructor({ el, width = w, height = h, onSuccess, onFail, onRefresh }) {
    Object.assign(el.style, {
      position: 'relative',
      width: '100%',
      height: '100%',
      margin: '0 auto',
    });
    this.width = width;
    this.height = height;
    this.el = el;
    this.onSuccess = onSuccess;
    this.onFail = onFail;
    this.onRefresh = onRefresh;
  }

  init() {
    that = this;
    this.initDOM();
    this.bindEvents();
    let timer = null;
    timer = setInterval(() => {
      if (sessionStorage.getItem('use-seStorage-storage-state-demo1')) {
        this.initImg();
        clearInterval(timer);
        timer = null;
      }
    }, 300);
  }
  initDOM() {
    const { width, height } = this;
    const divWrapper = (self_Create_Element = createImgElement(w, h, 'wrapperSilder')); // 创建html元素
    const smallDivWrapper = (self_Create_Element_Small = createImgElement(
      40,
      40,
      'smallDivWrapper',
    )); // 创建html元素
    const block = createCanvas(width, height); // 滑块
    setClass(block, 'block');
    const sliderContainer = createElement('div', 'sliderContainer');
    sliderContainer.id = 'wrapperContainer';
    sliderContainer.style.width = '100%';
    sliderContainer.style.pointerEvents = 'none';
    const refreshIcon = createElement('div', 'refreshIcon');
    refreshIcon.style.zIndex = '99999';
    const sliderMask = createElement('div', 'sliderMask');
    const slider = createElement('div', 'slider');
    const sliderIcon = createElement('span', 'sliderIcon');
    const text = createElement('span', 'sliderText');
    text.innerHTML = '向右滑动填充拼图';
    // todo
    textElement = text;
    // 增加loading
    const loadingContainer = createElement('div', 'loadingContainer');
    loadingContainer.style.width = '100%';
    loadingContainer.style.height = '260px';
    const loadingIcon = createElement('div', 'loadingIcon');
    const loadingText = createElement('span');
    loadingText.innerHTML = '加载中...';
    loadingContainer.appendChild(loadingIcon);
    loadingContainer.appendChild(loadingText);

    const el = this.el;
    el.appendChild(loadingContainer);
    // el.appendChild(canvas)
    el.appendChild(divWrapper);
    el.appendChild(refreshIcon);
    el.appendChild(block);
    slider.appendChild(sliderIcon);
    sliderMask.appendChild(slider);
    sliderContainer.appendChild(sliderMask);
    sliderContainer.appendChild(text);
    el.appendChild(sliderContainer);

    Object.assign(this, {
      divWrapper,
      smallDivWrapper,
      block,
      sliderContainer,
      loadingContainer,
      refreshIcon,
      slider,
      sliderMask,
      sliderIcon,
      text,
    });
  }

  setLoading(isLoading) {
    this.loadingContainer.style.display = isLoading ? '' : 'none';
    this.sliderContainer.style.pointerEvents = isLoading ? 'none' : '';
  }

  initImg() {
    const img = createImg(() => {
      this.setLoading(false);
      this.draw();
    });
  }

  async draw() {
    try {
      let data = await getLoginConfig();
      if (!self_Create_Element.children.length) {
        self_Create_Element.appendChild(self_Create_Element_Small); // 让小图定位在大图的上边
      }
      self_Create_Element.style.cssText = `width:100%;height:260px;
      background-image:url(data:image/png;base64,${data.data.big_image_base64});position:relative;z-index:-3;background-repeat:no-repeat;`;
      self_Create_Element_Small.style.cssText = `width:60px;height:60px;
         background-image:url(data:image/png;base64,${data.data.small_image_base64});
         position:absolute;top:${data.data.pos_y}px;left:0;background-repeat:no-repeat;`;
    } catch (error) {}
  }

  bindEvents() {
    this.el.onselectstart = () => false;
    this.refreshIcon.onclick = () => {
      this.reset();
      typeof this.onRefresh === 'function' && this.onRefresh();
    };
    let originX,
      originY,
      trail = [],
      isMouseDown = false;
    const handleDragStart = function (e) {
      e.preventDefault();
      e.stopPropagation();
      originX = e.clientX || e.touches[0].clientX;
      originY = e.clientY || e.touches[0].clientY;
      isMouseDown = true;
      textElement.style.display = 'none';
    };
    const width = this.width;
    const handleDragMove = (e) => {
      if (!isMouseDown) return false;
      e.preventDefault();
      e.stopPropagation();
      const eventX = e.clientX || e.touches[0].clientX;
      const eventY = e.clientY || e.touches[0].clientY;
      const moveX = eventX - originX;
      const moveY = eventY - originY;
      if (moveX < 0 || moveX + 58 >= width) return false;
      this.slider.style.left = moveX + 'px';
      const blockLeft = ((width - 60 - 30) / (width - 60)) * moveX;
      this.block.style.left = blockLeft + 'px';
      self_Create_Element_Small.style.left = moveX + 'px';
      addClass(this.sliderContainer, 'sliderContainer_active');
      this.sliderMask.style.width = moveX + 'px';
      trail.push(moveY);
    };
    const handleDragEnd = (e) => {
      // 可以算出移动的距离
      coordinatesX = this.slider.style.left;
      // 发送接口
      if (!isMouseDown) return false;
      isMouseDown = false;
      const eventX = e.clientX || e.changedTouches[0].clientX;
      if (eventX === originX) return false;
      removeClass(this.sliderContainer, 'sliderContainer_active');
      this.trail = trail;
      getlengthConfig(coordinatesX).then((rs) => {
        if (rs.data.errCode == '1010251') {
          message.error('验证超时');
          setTimeout(this.reset.bind(this), 100);
          return;
        } else if (rs.data.errCode == true) {
          addClass(this.sliderContainer, 'sliderContainer_success');
          typeof this.onSuccess === 'function' && this.onSuccess();
          // setTimeout(this.reset.bind(this), 10)
        } else {
          addClass(this.sliderContainer, 'sliderContainer_fail');
          typeof this.onFail === 'function' && this.onFail();
          setTimeout(this.reset.bind(this), 500);
        }
      });
    };
    this.slider.addEventListener('mousedown', handleDragStart);
    this.slider.addEventListener('touchstart', handleDragStart);
    this.block.addEventListener('mousedown', handleDragStart);
    this.block.addEventListener('touchstart', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    document.addEventListener('touchend', handleDragEnd);
  }

  verify() {
    const arr = this.trail; // 拖动时y轴的移动距离
    const average = arr.reduce(sum) / arr.length;
    const deviations = arr.map((x) => x - average);
    const stddev = Math.sqrt(deviations.map(square).reduce(sum) / arr.length);
    const left = parseInt(this.block.style.left);
    return {
      spliced: Math.abs(left - this.x) < 10,
      verified: stddev !== 0, // 简单验证拖动轨迹，为零时表示Y轴上下没有波动，可能非人为操作
    };
  }

  reset() {
    const { width, height } = this;
    // 重置样式
    setClass(this.sliderContainer, 'sliderContainer');
    this.slider.style.left = 0 + 'px';
    this.block.width = width;
    this.block.style.left = 0 + 'px';
    this.sliderMask.style.width = 0 + 'px';
    // 重新加载图片
    this.setLoading(true);
    textElement.style.display = 'block';
    createImg(() => {
      that.setLoading(false);
      that.draw();
    });
  }
}
export function windowObj() {
  window.jigsaw = {
    init: function (opts) {
      const valElement = document.getElementById('slientId');
      w = parseInt(valElement.getBoundingClientRect().width) - 4;
      h = 260;
      return new Jigsaw(opts).init();
    },
  };
}
