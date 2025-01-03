// 페이지 분할 및 네비게이션 핵심 로직
class EReaderView {
  constructor() {
    this.pageHeight = window.innerHeight;
    this.margins = 0.1;
    this.currentPage = 0;
    this.isEinkMode = false;
    
    // 성능을 위해 캐시 사용
    this.cachedElements = null;
    this.cachedBreakPoints = null;
    
    // 디바운스 타이머
    this.resizeTimer = null;
    
    this.init();
  }

  init() {
    // 메인 콘텐츠 찾기 (가장 기본적인 방법으로 단순화)
    this.findMainContent();
    
    // 기본 최적화 적용
    this.applyBasicOptimizations();
    
    // 이벤트 리스너 설정
    this.setupEventListeners();
  }

  findMainContent() {
    // 콘텐츠 감지 우선순위
    const selectors = [
      'article',
      'main',
      '.content',
      '#content',
      '.post-content',
      '.article-content',
      '.entry-content'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element && this.isValidContent(element)) {
        this.mainContent = element;
        return;
      }
    }
    
    // fallback: 가장 긴 텍스트를 포함한 요소 찾기
    const body = document.body;
    let maxLength = 0;
    let bestElement = body;
    
    const walker = document.createTreeWalker(
      body,
      NodeFilter.SHOW_ELEMENT,
      null,
      false
    );
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.textContent.trim();
      if (text.length > maxLength && this.isValidContent(node)) {
        maxLength = text.length;
        bestElement = node;
      }
    }
    
    this.mainContent = bestElement;
  }

  isValidContent(element) {
    const style = window.getComputedStyle(element);
    const text = element.textContent.trim();
    
    return (
      text.length > 100 && // 최소 텍스트 길이
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  applyBasicOptimizations() {
    if (!this.mainContent) return;

    // 스타일 최적화를 위한 클래스 추가
    this.mainContent.classList.add('e-reader-content');
    
    // 스타일 요소 생성
    const style = document.createElement('style');
    style.textContent = `
      .e-reader-content {
        max-width: 800px !important;
        margin: 0 auto !important;
        padding: 20px !important;
        font-size: 16px !important;
        line-height: 1.6 !important;
        word-break: break-word !important;
      }
      
      .e-reader-content img {
        max-width: 100% !important;
        height: auto !important;
        display: block !important;
        margin: 20px auto !important;
      }
    `;
    
    document.head.appendChild(style);
  }

  setupEventListeners() {
    // 간단한 네비게이션 버튼
    this.addNavigationButtons();
    
    // 리사이즈 이벤트 디바운싱
    window.addEventListener('resize', () => {
      if (this.resizeTimer) clearTimeout(this.resizeTimer);
      this.resizeTimer = setTimeout(() => {
        this.pageHeight = window.innerHeight;
        this.updateView();
      }, 250);
    });
  }

  addNavigationButtons() {
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
    `;

    // 이전 페이지 버튼
    const prevButton = document.createElement('button');
    prevButton.innerHTML = '←';
    prevButton.style.cssText = buttonStyle + 'left: 10px; top: 50%;';
    prevButton.addEventListener('touchstart', (e) => e.preventDefault());
    prevButton.onclick = () => this.previousPage();

    // 다음 페이지 버튼
    const nextButton = document.createElement('button');
    nextButton.innerHTML = '→';
    nextButton.style.cssText = buttonStyle + 'right: 10px; top: 50%;';
    nextButton.addEventListener('touchstart', (e) => e.preventDefault());
    nextButton.onclick = () => this.nextPage();

    document.body.appendChild(prevButton);
    document.body.appendChild(nextButton);
  }

  nextPage() {
    this.currentPage++;
    this.scrollToCurrentPage();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.scrollToCurrentPage();
    }
  }

  scrollToCurrentPage() {
    const viewportHeight = window.innerHeight;
    const contentHeight = Math.max(
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight
    );
    const maxPages = Math.ceil(contentHeight / (viewportHeight * (1 - 2 * this.margins)));
    
    // 페이지 범위 체크
    if (this.currentPage >= maxPages) {
      this.currentPage = maxPages - 1;
    }
    
    const scrollAmount = this.currentPage * (this.pageHeight * (1 - 2 * this.margins));
    window.scrollTo(0, scrollAmount);
  }

  // 간단한 E-ink 모드 토글
  toggleEinkMode() {
    this.isEinkMode = !this.isEinkMode;
    
    const style = document.createElement('style');
    style.id = 'eink-mode';
    
    if (this.isEinkMode) {
      style.textContent = `
        body, article, main, .content, #content {
          background: white !important;
          color: black !important;
          font-weight: normal !important;
        }
        img {
          filter: grayscale(100%) !important;
        }
      `;
      document.head.appendChild(style);
    } else {
      const existingStyle = document.getElementById('eink-mode');
      if (existingStyle) existingStyle.remove();
    }
  }

  updateView() {
    // 현재 페이지 위치 유지하면서 뷰 업데이트
    const currentScroll = window.scrollY;
    this.currentPage = Math.floor(currentScroll / (this.pageHeight * (1 - 2 * this.margins)));
    this.scrollToCurrentPage();
  }

  cleanup() {
    // 이벤트 리스너 제거
    if (this.resizeTimer) {
      clearTimeout(this.resizeTimer);
    }
    
    // 스타일 제거
    const einkStyle = document.getElementById('eink-mode');
    if (einkStyle) {
      einkStyle.remove();
    }
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
  const reader = new EReaderView();
  
  // 페이지 언로드 시 정리
  window.addEventListener('unload', () => {
    reader.cleanup();
  });
  
  // 에러 처리
  window.addEventListener('error', (e) => {
    console.error('E-Reader View Error:', e);
  });
}); 