class EReaderView {
  constructor() {
    console.log('EReaderView 생성자 시작');
    this.pageHeight = window.innerHeight;
    this.margins = 0.1;
    this.currentPage = 0;
    this.totalPages = 1;
    this.isButtonsVisible = true;
    this.isKeyboardEnabled = true;
    this.isButtonsOnRight = false;
    this.isFullWidth = true;
    this.navigationButtons = [];
    this.controlPanel = null;
    this.mainContent = null;
    
    this.keydownHandler = this.handleKeydown.bind(this);
    this.mousemoveHandler = this.handleMousemove.bind(this);
    
    this.initialize();
  }

  initialize() {
    console.log('초기화 시작');
    try {
      this.findMainContent();
      
      if (!this.mainContent) {
        console.error('메인 콘텐츠를 찾을 수 없습니다.');
        return;
      }

      this.applyBasicOptimizations();
      this.calculatePages();
      this.addNavigationButtons();
      this.setupEventListeners();
      this.createControlPanel();
      
      console.log('초기화 완료');
    } catch (error) {
      console.error('초기화 중 오류 발생:', error);
    }
  }

  findMainContent() {
    console.log('메인 콘텐츠 찾기 시작');
    let bestElement = null;
    let maxTextLength = 0;
    
    const checkElement = (element) => {
      const excludeTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEADER', 'FOOTER', 'NAV'];
      if (excludeTags.includes(element.tagName)) return;
      
      const style = window.getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden') return;
      if (element.offsetWidth === 0 || element.offsetHeight === 0) return;
      if (element.closest('header') || element.closest('footer') || element.closest('nav')) return;
      
      const text = element.textContent.trim();
      if (text.length > 100 && text.length > maxTextLength) {
        maxTextLength = text.length;
        bestElement = element;
      }
    };

    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );

    while (walker.nextNode()) {
      checkElement(walker.currentNode);
    }

    if (bestElement) {
      console.log('메인 콘텐츠 찾음:', bestElement.tagName, maxTextLength);
      this.mainContent = bestElement;
    } else {
      console.log('메인 콘텐츠를 찾지 못해 body 사용');
      this.mainContent = document.body;
    }
  }

  isValidContent(element) {
    if (!element) return false;
    
    try {
      const style = window.getComputedStyle(element);
      const text = element.textContent.trim();
      
      return (
        text.length > 100 && // 최소 텍스트 길이
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        element.offsetWidth > 0 &&
        element.offsetHeight > 0 &&
        !element.closest('header') && // 헤더 영역 제외
        !element.closest('footer') && // 푸터 영역 제외
        !element.closest('nav')     // 네비게이션 영역 제외
      );
    } catch (error) {
      console.error('콘텐츠 유효성 검사 실패:', error);
      return false;
    }
  }

  addNavigationButtons() {
    console.log('네비게이션 버튼 추가');
    this.navigationButtons.forEach(button => button.remove());
    this.navigationButtons = [];

    const buttonStyle = `
      position: fixed;
      z-index: 10000;
      padding: 20px;
      background: rgba(255, 255, 255, 0.8);
      border: none;
      cursor: pointer;
      transform: translateY(-50%);
      touch-action: manipulation;
      user-select: none;
      -webkit-tap-highlight-color: transparent;
      transition: opacity 0.3s ease;
      font-size: 24px;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 25px;
    `;

    const prevButton = document.createElement('button');
    prevButton.innerHTML = '←';
    prevButton.style.cssText = buttonStyle + 'top: 50%;';
    prevButton.addEventListener('touchstart', (e) => e.preventDefault());
    prevButton.addEventListener('click', () => this.previousPage());

    const nextButton = document.createElement('button');
    nextButton.innerHTML = '→';
    nextButton.style.cssText = buttonStyle + 'top: 50%;';
    nextButton.addEventListener('touchstart', (e) => e.preventDefault());
    nextButton.addEventListener('click', () => this.nextPage());

    this.navigationButtons = [prevButton, nextButton];
    document.body.appendChild(prevButton);
    document.body.appendChild(nextButton);

    this.updateNavigationButtonsPosition();
  }

  setupEventListeners() {
    document.addEventListener('keydown', this.keydownHandler);
    document.addEventListener('mousemove', this.mousemoveHandler);
  }

  handleKeydown(e) {
    if (!this.isKeyboardEnabled && !['k', 'K'].includes(e.key)) {
      return;
    }

    switch(e.key) {
      case 'ArrowLeft':
        if (this.isKeyboardEnabled) {
          this.previousPage();
        }
        break;
      case 'ArrowRight':
        if (this.isKeyboardEnabled) {
          this.nextPage();
        }
        break;
      case 'h':
      case 'H':
        this.toggleNavigationButtons();
        break;
      case 'k':
      case 'K':
        this.toggleKeyboardControls();
        break;
    }
  }

  handleMousemove() {
    if (!this.isButtonsVisible) {
      this.showNavigationButtons();
      if (this.mousemoveTimer) {
        clearTimeout(this.mousemoveTimer);
      }
      this.mousemoveTimer = setTimeout(() => this.hideNavigationButtons(), 2000);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.scrollToCurrentPage();
    } else {
      this.showPageNotification('마지막 페이지입니다');
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.scrollToCurrentPage();
    } else {
      this.showPageNotification('첫 페이지입니다');
    }
  }

  scrollToCurrentPage() {
    if (!this.mainContent) return;

    const viewportHeight = window.innerHeight * (1 - 2 * this.margins);
    const scrollAmount = Math.min(
      this.currentPage * viewportHeight,
      this.mainContent.scrollHeight - viewportHeight
    );
    
    window.scrollTo({
      top: scrollAmount,
      behavior: 'instant'
    });

    console.log(`페이지 ${this.currentPage + 1}/${this.totalPages} 이동`);
  }

  toggleNavigationButtons() {
    this.isButtonsVisible = !this.isButtonsVisible;
    this.navigationButtons.forEach(button => {
      button.style.opacity = this.isButtonsVisible ? '1' : '0';
      button.style.pointerEvents = this.isButtonsVisible ? 'auto' : 'none';
    });
  }

  showNavigationButtons() {
    this.navigationButtons.forEach(button => {
      button.style.opacity = '1';
      button.style.pointerEvents = 'auto';
    });
    this.isButtonsVisible = true;
  }

  hideNavigationButtons() {
    this.navigationButtons.forEach(button => {
      button.style.opacity = '0';
      button.style.pointerEvents = 'none';
    });
    this.isButtonsVisible = false;
  }

  toggleKeyboardControls() {
    this.isKeyboardEnabled = !this.isKeyboardEnabled;
    const status = this.isKeyboardEnabled ? '활성화' : '비활성화';
    this.showNotification(`키보드 컨트롤 ${status}`);
  }

  showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px 20px;
      border-radius: 5px;
      z-index: 10001;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  createControlPanel() {
    const panel = document.createElement('div');
    panel.style.cssText = `
      position: fixed;
      bottom: 70px;
      right: 20px;
      background: rgba(255, 255, 255, 0.7);
      backdrop-filter: blur(5px);
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 10001;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
      font-family: Arial, sans-serif;
      font-size: 14px;
      transition: all 0.3s ease;
    `;

    const buttonToggle = this.createToggleSwitch('네비게이션 버튼', this.isButtonsVisible, (checked) => {
      this.isButtonsVisible = checked;
      this.toggleNavigationButtons();
    });

    const keyboardToggle = this.createToggleSwitch('키보드 컨트롤', this.isKeyboardEnabled, (checked) => {
      this.isKeyboardEnabled = checked;
      this.showNotification(`키보드 컨트롤 ${checked ? '활성화' : '비활성화'}`);
    });

    const positionToggle = this.createToggleSwitch('버튼 오른쪽 정렬', this.isButtonsOnRight, (checked) => {
      this.isButtonsOnRight = checked;
      this.updateNavigationButtonsPosition();
    });

    const layoutToggle = this.createToggleSwitch('전체 너비 모드', this.isFullWidth, (checked) => {
      this.isFullWidth = checked;
      this.applyLayoutMode();
      this.showNotification(`${checked ? '전체 너비' : '집중'} 모드로 변경됨`);
    });

    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = '⚙️';
    toggleButton.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.5);
      backdrop-filter: blur(5px);
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      cursor: pointer;
      z-index: 10002;
      font-size: 20px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    `;

    toggleButton.addEventListener('mouseenter', () => {
      toggleButton.style.background = 'rgba(255, 255, 255, 0.8)';
      toggleButton.style.transform = 'scale(1.1)';
    });

    toggleButton.addEventListener('mouseleave', () => {
      toggleButton.style.background = 'rgba(255, 255, 255, 0.5)';
      toggleButton.style.transform = 'scale(1)';
    });

    panel.appendChild(buttonToggle);
    panel.appendChild(keyboardToggle);
    panel.appendChild(positionToggle);
    panel.appendChild(layoutToggle);

    panel.style.display = 'none';
    this.controlPanel = panel;

    toggleButton.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    document.body.appendChild(panel);
    document.body.appendChild(toggleButton);
  }

  createToggleSwitch(label, initialState, onChange) {
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
    `;

    const toggle = document.createElement('label');
    toggle.style.cssText = `
      position: relative;
      display: inline-block;
      width: 40px;
      height: 20px;
    `;

    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = initialState;
    input.style.cssText = `
      opacity: 0;
      width: 0;
      height: 0;
    `;

    const slider = document.createElement('span');
    slider.style.cssText = `
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    `;

    slider.innerHTML = `
      <span style="
        position: absolute;
        content: '';
        height: 16px;
        width: 16px;
        left: 2px;
        bottom: 2px;
        background-color: white;
        transition: .4s;
        border-radius: 50%;
        transform: ${initialState ? 'translateX(20px)' : 'translateX(0)'};
      "></span>
    `;

    input.addEventListener('change', (e) => {
      slider.querySelector('span').style.transform = 
        e.target.checked ? 'translateX(20px)' : 'translateX(0)';
      onChange(e.target.checked);
    });

    const labelText = document.createElement('span');
    labelText.textContent = label;

    toggle.appendChild(input);
    toggle.appendChild(slider);
    container.appendChild(labelText);
    container.appendChild(toggle);

    return container;
  }

  cleanup() {
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    if (this.mousemoveTimer) {
      clearTimeout(this.mousemoveTimer);
    }
    
    document.removeEventListener('keydown', this.keydownHandler);
    document.removeEventListener('mousemove', this.mousemoveHandler);
    
    const einkStyle = document.getElementById('eink-mode');
    if (einkStyle) {
      einkStyle.remove();
    }

    this.navigationButtons.forEach(button => button.remove());
    if (this.controlPanel) {
      this.controlPanel.remove();
    }
  }

  applyBasicOptimizations() {
    if (!this.mainContent) return;
    console.log('페이지 최적화 시작');
    this.applyLayoutMode();
  }

  calculatePages() {
    if (!this.mainContent) return;
    console.log('페이지 계산 시작');

    const viewportHeight = window.innerHeight * (1 - 2 * this.margins);
    const contentHeight = this.mainContent.scrollHeight;
    this.totalPages = Math.max(1, Math.ceil(contentHeight / viewportHeight));
    
    console.log(`총 ${this.totalPages}페이지로 분할됨`);
  }

  updateNavigationButtonsPosition() {
    const [prevButton, nextButton] = this.navigationButtons;
    if (this.isButtonsOnRight) {
      // 오른쪽에 세로 정렬
      prevButton.style.left = 'auto';
      prevButton.style.right = '10px';
      prevButton.style.top = 'calc(50% - 35px)';  // 중앙에서 위로

      nextButton.style.right = '10px';
      nextButton.style.top = 'calc(50% + 35px)';  // 중앙에서 아래로
    } else {
      // 양쪽에 가로 배치
      prevButton.style.left = '10px';
      prevButton.style.right = 'auto';
      prevButton.style.top = '50%';

      nextButton.style.right = '10px';
      nextButton.style.top = '50%';
    }
  }

  showPageNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      font-family: Arial, sans-serif;
      font-size: 16px;
      z-index: 10001;
      opacity: 0;
      transition: opacity 0.3s ease;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    // 페이드 인
    requestAnimationFrame(() => {
      notification.style.opacity = '1';
    });

    // 페이드 아웃 후 제거
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 1500);
  }

  toggleLayoutMode() {
    this.isFullWidth = !this.isFullWidth;
    this.applyLayoutMode();
  }

  applyLayoutMode() {
    if (!this.mainContent) return;

    if (this.isFullWidth) {
      // 전체 너비 모드
      this.mainContent.style.cssText = `
        width: 100% !important;
        max-width: none !important;
        margin: 0 !important;
        padding: 0 !important;
        font-size: 16px !important;
        line-height: 1.6 !important;
        word-break: break-word !important;
      `;

      // 부모 요소들의 너비 제한 제거
      let parent = this.mainContent.parentElement;
      while (parent && parent !== document.body) {
        parent.style.maxWidth = 'none';
        parent.style.width = '100%';
        parent.style.margin = '0';
        parent.style.padding = '0';
        parent = parent.parentElement;
      }

      document.body.style.margin = '0';
      document.body.style.padding = '0';
      document.body.style.maxWidth = 'none';
      document.body.style.width = '100%';
    } else {
      // 집중 모드 (가운데 정렬, 제한된 너비)
      this.mainContent.style.cssText = `
        width: auto !important;
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 20px !important;
        font-size: 16px !important;
        line-height: 1.6 !important;
        word-break: break-word !important;
      `;

      // 부모 요소들 리셋
      let parent = this.mainContent.parentElement;
      while (parent && parent !== document.body) {
        parent.style.maxWidth = '';
        parent.style.width = '';
        parent.style.margin = '';
        parent.style.padding = '';
        parent = parent.parentElement;
      }

      document.body.style.margin = '';
      document.body.style.padding = '';
      document.body.style.maxWidth = '';
      document.body.style.width = '';
    }

    // 페이지 재계산
    this.calculatePages();
  }
}

const initializeReader = () => {
  try {
    if (!window.eReaderView) {
      console.log('E-Reader View 초기화 시도');
      window.eReaderView = new EReaderView();
    }
  } catch (error) {
    console.error('E-Reader View 초기화 실패:', error);
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeReader);
} else {
  initializeReader();
}

window.addEventListener('load', () => {
  console.log('페이지 완전 로드됨');
  if (!window.eReaderView?.mainContent) {
    console.log('메인 콘텐츠 재검색 시도');
    initializeReader();
  }
}); 