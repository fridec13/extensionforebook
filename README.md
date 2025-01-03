# Extension for eBook

이 프로젝트는 웹 페이지를 eBook처럼 읽을 수 있게 해주는 브라우저 확장 프로그램입니다.

## 주요 기능

- 페이지 분할 및 네비게이션
  - 화면 크기에 맞춘 자동 페이지 분할
  - 좌우 화살표 버튼으로 페이지 이동
- 읽기 최적화
  - 본문 자동 감지
  - 가독성 최적화 (글자 크기, 줄 간격 등)
  - 이미지 크기 자동 조절
- E-ink 모드
  - 흑백 최적화 모드
  - 이미지 그레이스케일 변환

## 설치 방법

1. 이 저장소를 클론합니다
```bash
git clone https://github.com/[username]/extensionforebook.git
```

2. Chrome 브라우저에서 `chrome://extensions`로 이동합니다
3. 우측 상단의 '개발자 모드'를 활성화합니다
4. '압축해제된 확장 프로그램을 로드합니다' 버튼을 클릭하고 클론한 디렉토리를 선택합니다

## 기술 스택

- JavaScript (ES6+)
- Chrome Extension API
- DOM Manipulation

## 라이선스

MIT License

## 기여하기

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request