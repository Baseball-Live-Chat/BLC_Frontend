# ⚾ BLC Frontend (Baseball Live Chat)

<div align="center">

![Vue.js](https://img.shields.io/badge/Vue.js-35495E?style=for-the-badge&logo=vuedotjs&logoColor=4FC08D)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=JavaScript&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-yellow?style=for-the-badge&logo=vue.js&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)

**실시간으로 야구 경기를 보며 팬들과 소통하는 플랫폼 프론트엔드** 🔥

[주요 기능](#-주요-기능) • [설치 가이드](#-설치-및-실행) • [프로젝트 구조](#-프로젝트-구조) • [개발 가이드](#-개발-가이드)

</div>

---

## 📖 프로젝트 소개

BLC Frontend는 **Vue.js 3**를 기반으로 구축된 야구 팬들을 위한 실시간 소통 플랫폼의 프론트엔드입니다. 현대적인 SPA(Single Page Application) 아키텍처를 사용하여 빠르고 반응성 있는 사용자 경험을 제공합니다.

### 🎯 **주요 특징**
- 📱 **반응형 디자인** - 모바일부터 데스크톱까지 완벽 지원
- ⚡ **실시간 통신** - Socket.io를 통한 즉시 메시지 전송
- 🎨 **팀별 브랜딩** - 각 야구팀의 고유 색상과 로고 적용
- 🔄 **상태 관리** - Pinia를 활용한 효율적인 상태 관리

---

## ✨ 주요 기능

### 🏟️ **경기 정보 대시보드**
- 📊 실시간 스코어 및 이닝 정보
- 🏆 각 팀의 로고와 브랜딩 색상 표시
- ⏰ 경기 상태 (LIVE, 종료, 예정) 실시간 업데이트
- 📈 인기 경기 순위 및 시청자 수

### 💬 **팀별 분리 채팅**
- 🔴 **홈팀 응원단** vs 🔵 **원정팀 응원단** 독립적인 채팅방
- ⚡ 실시간 메시지 전송 및 수신
- 🎪 빠른 응원 메시지 템플릿
- 👤 사용자별 메시지 구분 표시
- 📝 메시지 길이 제한 및 입력 가이드

### 📝 **실시간 문자중계**
- 🔥 경기의 주요 순간들을 실시간 업데이트
- ⚾ 투구별, 타구별 상세 상황 전달
- 📊 자동 스크롤 및 최신 정보 우선 표시

### 🎨 **사용자 인터페이스**
- 🌈 각 팀의 고유 색상 테마 적용
- 🖼️ 팀 로고 이미지 지원
- 📱 모바일 최적화된 터치 인터페이스
- ⚡ 부드러운 애니메이션과 전환 효과

---

## 🛠️ 기술 스택

### **핵심 프레임워크**
- **Vue.js 3.3.0** - Composition API를 활용한 모던 프론트엔드
- **Vue Router 4.2.0** - SPA 라우팅 관리
- **Pinia 2.1.0** - 직관적인 상태 관리

### **통신 & 데이터**
- **Axios 1.4.0** - HTTP 클라이언트
- **Socket.io Client 4.7.0** - 실시간 양방향 통신

### **개발 환경**
- **Vue CLI 5.0** - 프로젝트 빌드 도구
- **ESLint** - 코드 품질 관리
- **Prettier** - 코드 포맷팅
- **CSS3** - 반응형 스타일링

---

## 🚀 설치 및 실행

### 📋 **필수 요구사항**
```
Node.js 16.0.0 이상
npm 8.0.0 이상 또는 yarn 1.22.0 이상
```

### 🖥️ **로컬 개발 환경 설정**

```bash
# 1. 저장소 클론
git clone https://github.com/your-username/blc-project.git
cd blc-project/blc_frontend

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run serve
```

🌐 **브라우저에서 http://localhost:8080 접속**

### ⚙️ **사용 가능한 명령어**

```bash
# 개발 서버 실행 (핫 리로드 포함)
npm run serve

# 프로덕션 빌드
npm run build

# ESLint로 코드 검사
npm run lint

# ESLint로 코드 자동 수정
npm run lint:fix

# Prettier로 코드 포맷팅
npm run format
```

---

## 📁 프로젝트 구조

```
blc_frontend/
├── 📁 public/
│   ├── 📁 images/
│   │   └── 📁 teams/              # 팀 로고 이미지
│   │       ├── doosan.png         # 두산 베어스
│   │       ├── lg.png             # LG 트윈스
│   │       └── ...
│   └── index.html
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 common/
│   │   │   └── Header.vue         # 공통 헤더
│   │   ├── 📁 game/
│   │   │   ├── GameCard.vue       # 경기 카드
│   │   │   ├── GameStatus.vue     # 경기 상태
│   │   │   └── RankingSection.vue # 인기 순위
│   │   ├── 📁 chat/
│   │   │   ├── TeamChatSection.vue   # 팀별 채팅 메인
│   │   │   ├── TeamChatInput.vue     # 채팅 입력
│   │   │   └── ChatMessage.vue       # 채팅 메시지
│   │   └── 📁 commentary/
│   │       ├── LiveCommentary.vue    # 실시간 문자중계
│   │       └── CommentaryItem.vue    # 중계 아이템
│   ├── 📁 views/
│   │   ├── Home.vue               # 메인 페이지
│   │   └── GameDetail.vue         # 경기 상세 페이지
│   ├── 📁 stores/
│   │   ├── game.js                # 경기 상태 관리
│   │   ├── chat.js                # 채팅 상태 관리
│   │   └── commentary.js          # 문자중계 상태 관리
│   ├── 📁 utils/
│   │   └── teamUtils.js           # 팀 정보 유틸리티
│   ├── 📁 router/
│   │   └── index.js               # 라우터 설정
│   ├── 📁 assets/
│   │   └── 📁 styles/
│   │       └── main.css           # 글로벌 스타일
│   ├── App.vue                    # 루트 컴포넌트
│   └── main.js                    # 앱 진입점
├── package.json                   # 프로젝트 설정
├── vue.config.js                  # Vue CLI 설정
└── README.md                      # 프로젝트 문서
```

---

## 🎨 팀 이미지 설정

### 📷 **팀 로고 추가하기**

1. **이미지 준비**
   ```
   - 권장 크기: 100x100px
   - 형식: PNG (투명 배경 권장)
   - 파일명: 팀명.png (예: doosan.png)
   ```

2. **이미지 저장 위치**
   ```
   public/images/teams/
   ├── doosan.png      # 두산 베어스
   ├── lg.png          # LG 트윈스
   ├── samsung.png     # 삼성 라이온즈
   ├── kia.png         # 기아 타이거즈
   ├── lotte.png       # 롯데 자이언츠
   ├── nc.png          # NC 다이노스
   ├── hanwha.png      # 한화 이글스
   ├── kt.png          # KT 위즈
   ├── ssg.png         # SSG 랜더스
   └── kiwoom.png      # 키움 히어로즈
   ```

3. **팀 정보 설정**
   ```javascript
   // src/utils/teamUtils.js에서 팀 색상 및 정보 수정
   export const TEAM_INFO = {
     두산: {
       name: '두산 베어스',
       image: '/images/teams/doosan.png',
       color: '#131230',      // 메인 색상
       bgColor: '#f8f9ff'     // 배경 색상
     },
     // ... 다른 팀들
   }
   ```

---

## 🧩 컴포넌트 가이드

### 🏠 **페이지 컴포넌트**

#### **Home.vue**
- 경기 목록 및 인기 순위 표시
- 각 경기 카드 클릭 시 상세 페이지로 이동

#### **GameDetail.vue**  
- 경기 상세 정보 및 실시간 채팅
- 문자중계와 팀별 채팅을 동시 표시

### 💬 **채팅 컴포넌트**

#### **TeamChatSection.vue**
```vue
<TeamChatSection 
  :gameId="gameId" 
  :game="gameData" 
/>
```

#### **TeamChatInput.vue**
```vue
<TeamChatInput
  :selectedTeam="selectedTeam"
  :homeTeam="homeTeam"
  :awayTeam="awayTeam"
  :homeColor="homeColor"
  :awayColor="awayColor"
  @sendMessage="handleMessage"
/>
```

#### **ChatMessage.vue**
```vue
<ChatMessage
  :message="messageData"
  :teamColor="teamColor"
/>
```

---

## 🗃️ 상태 관리 (Pinia)

### 🎮 **Game Store**
```javascript
// 경기 관련 상태 관리
const gameStore = useGameStore()

// 사용 예시
gameStore.fetchGames()           // 경기 목록 조회
gameStore.fetchGameDetail(id)    // 경기 상세 조회
gameStore.cheerForTeam(id, team) // 팀 응원
```

### 💬 **Chat Store**
```javascript
// 채팅 관련 상태 관리
const chatStore = useChatStore()

// 사용 예시
chatStore.connectToGame(gameId, gameData)  // 채팅방 연결
chatStore.setSelectedTeam('home')          // 응원팀 선택
chatStore.sendMessage(content, team)       // 메시지 전송
chatStore.disconnect()                     // 연결 해제
```

### 📝 **Commentary Store**
```javascript
// 문자중계 관련 상태 관리
const commentaryStore = useCommentaryStore()

// 사용 예시
commentaryStore.fetchCommentaries(gameId)  // 중계 내용 조회
commentaryStore.addCommentary(data)        // 새 중계 추가
```

---

## 🎨 스타일링 가이드

### 🌈 **색상 팔레트**
```css
/* 메인 컬러 */
--primary-blue: #2c5aa0;
--primary-dark: #1e3a5f;

/* 상태 컬러 */
--live-red: #ff4757;
--success-green: #2ed573;
--warning-orange: #ffa502;

/* 그레이 스케일 */
--gray-100: #f8f9fa;
--gray-300: #e9ecef;
--gray-600: #666666;
--gray-900: #333333;
```

### 📱 **반응형 브레이크포인트**
```css
/* 모바일 */
@media (max-width: 768px) { ... }

/* 태블릿 */
@media (min-width: 769px) and (max-width: 1024px) { ... }

/* 데스크톱 */
@media (min-width: 1025px) { ... }
```

---

## 🛡️ 코드 품질

### 📏 **ESLint 설정**
- Vue 3 Essential 규칙 적용
- Prettier와 통합된 포맷팅
- console.log 허용 (개발 단계)

### 🎯 **Prettier 설정**
```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid"
}
```

---

## 🔧 개발 가이드

### 🆕 **새 컴포넌트 추가**
1. 적절한 폴더에 `.vue` 파일 생성
2. `<template>`, `<script setup>`, `<style scoped>` 구조 사용
3. props와 emits 명확히 정의
4. Prettier 규칙 준수

### 🔄 **상태 관리 추가**
1. `stores/` 폴더에 새 스토어 파일 생성
2. `defineStore`를 사용한 Pinia 스토어 정의
3. `state`, `getters`, `actions` 구조 준수

### 🎨 **스타일 작성**
1. `scoped` 스타일 사용 권장
2. CSS 변수 활용한 일관된 색상
3. 반응형 디자인 고려
4. 팀별 색상은 `teamUtils.js` 활용

---

## 🚀 배포

### 📦 **프로덕션 빌드**
```bash
npm run build
```

빌드된 파일은 `dist/` 폴더에 생성됩니다.

### 🌐 **배포 환경**
- **Netlify** - 정적 사이트 호스팅
- **Vercel** - SPA 최적화 배포
- **GitHub Pages** - 무료 호스팅
- **AWS S3 + CloudFront** - 엔터프라이즈 배포

---

## 🐛 문제 해결

### ❗ **자주 발생하는 이슈**

#### Socket.io 연결 오류
```bash
# 해결 방법: 백엔드 서버 확인 후 연결 설정 수정
// src/stores/chat.js에서 서버 URL 확인
```

#### 팀 이미지 로드 실패
```bash
# 해결 방법: public/images/teams/ 폴더에 이미지 파일 존재 확인
# 파일명이 teamUtils.js와 일치하는지 확인
```

#### 빌드 오류
```bash
# 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

---

## 📈 향후 계획

### 🎯 **단기 목표 (v1.1)**
- [ ] 사용자 로그인 시스템
- [ ] 채팅 메시지 필터링
- [ ] 이모지 반응 기능
- [ ] PWA (Progressive Web App) 지원

### 🚀 **장기 목표 (v2.0)**
- [ ] 실시간 비디오 스트리밍 연동
- [ ] AI 기반 경기 예측
- [ ] 소셜 미디어 연동
- [ ] 다국어 지원

---

## 🤝 기여하기

### 🔧 **개발 환경 준비**
1. 이 저장소를 Fork
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 Push (`git push origin feature/amazing-feature`)
5. Pull Request 생성

### 📝 **코딩 컨벤션**
- Vue 3 Composition API 사용
- ESLint + Prettier 규칙 준수
- 컴포넌트명은 PascalCase
- 파일명은 PascalCase.vue

---

## 📄 라이센스

이 프로젝트는 MIT 라이센스 하에 있습니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 👥 팀

**Frontend Developer**: [Your Name](mailto:your.email@example.com)

**기술 스택**: Vue.js, JavaScript, CSS3, Pinia, Socket.io

---

<div align="center">

**⚾ 야구를 사랑하는 모든 팬들을 위한 플랫폼 ⚾**

Made with ❤️ and ☕ by BLC Team

</div>