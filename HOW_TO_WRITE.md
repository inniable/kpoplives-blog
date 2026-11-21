# KPOP LIVES 블로그 운영 & 4개 국어 글 작성 가이드

## 1. 로컬에서 블로그 실행하기

```bash
npm run dev
```
실행 후 브라우저에서 `http://localhost:4321` 로 접속하세요.

## 2. 새 글(뉴스 / 영문 칼럼) 추가하기

`src/content/posts/` 폴더 안에 원하는 파일명으로 `.md` 파일을 생성하면 자동으로 블로그에 발행됩니다.
예: `src/content/posts/my-new-kpop-column.md`

### 4개 국어(EN / KR / JP / ES) 템플릿

```markdown
---
title: "영문 제목 (메인)"
titleKo: "한국어 제목"
titleJp: "일본어 제목 (선택)"
titleEs: "스페인어 제목 (선택)"
description: "영문 한 줄 요약"
descriptionKo: "한국어 한 줄 요약"
descriptionJp: "일본어 한 줄 요약 (선택)"
descriptionEs: "스페인어 한 줄 요약 (선택)"
category: "column" # "news" 또는 "column"
pubDate: 2026-11-21
author: "작성자 이름"
readTime: "5 min read"
readTimeKo: "5분 소요"
readTimeJp: "読了目安 5分"
readTimeEs: "5 min de lectura"
tags: ["Comeback", "Review", "5th-Gen"]
coverImage: "/images/cover-5th-gen.jpg"
featured: false # true로 설정하면 홈 상단 메인 히어로 카드로 노출됩니다
summaryKo: "KR 모드 상단에 표시될 한국어 핵심 요약"
summaryJp: "JP 모드 상단에 표시될 일본어 핵심 요약 (선택)"
summaryEs: "ES 모드 상단에 표시될 스페인어 핵심 요약 (선택)"
---

여기에 영문 본문을 마크다운으로 작성하세요.

<!-- ko -->

(선택 사항) 한국어 전문 번역

<!-- jp -->

(선택 사항) 일본어 전문 번역

<!-- es -->

(선택 사항) 스페인어 전문 번역
```

> **참고:** 특정 언어의 전문 번역 구분선(`<!-- jp -->` 등)을 생략해도 문제없습니다. 해당 언어 모드에서는 상단 요약 박스(있을 경우)와 함께 영문 원문이 자동으로 표시됩니다.

## 3. 실시간 K-POP 리서치 & 초안 자동 생성 (`npm run draft`)

최신 뉴스를 Google 검색으로 바로 찾아 SEO/GEO 규격의 영문 초안(`.md`)까지 자동 생성할 수 있습니다.

```bash
# 오늘의 최신 K-POP 핫이슈 TOP 5 브리핑 받기
npm run draft -- --briefing

# 특정 주제로 실시간 검색 + 영문 칼럼 초안(.md) 자동 생성
npm run draft -- "5th-gen K-Pop girl groups Billboard trends" --type column

# 초안 생성 + 4개 국어(KR/JP/ES) 자동 번역까지 한 번에 실행
npm run draft -- "BTS 2026 world tour news" --type news --translate
```

## 4. 4개 국어 자동 번역 스크립트 사용하기 (현지 매거진 수준)

영문 초안만 작성한 뒤 아래 명령어를 실행하면 **K-POP 전문 용어집 + 언어별 현지 에디터 페르소나 + 2단계 원어민 윤문**을 거쳐 `KR / JP / ES` 제목·요약·본문이 자동으로 `.md` 파일에 채워집니다.

1. `.env.example`을 복사해 `.env` 파일을 만들고 `GEMINI_API_KEY`를 입력합니다.
2. 터미널에서 번역 스크립트를 실행합니다:

```bash
# 특정 글 1편 자동 번역 (EN → KR / JP / ES)
npm run translate -- src/content/posts/my-new-kpop-column.md

# 모든 글 중 아직 번역 안 된 언어만 자동 채우기
npm run translate -- --all

# 일본어와 스페인어만 다시 번역하고 싶을 때
npm run translate -- src/content/posts/my-new-kpop-column.md --langs jp,es --force
```

- K-POP 용어집과 언어별 문체·페르소나는 `scripts/editorial-config.mjs`에서 언제든 자유롭게 추가/수정할 수 있습니다.

## 4. 커버 이미지 추가하기

1. `public/images/` 폴더에 이미지 파일(`.jpg`, `.png`, `.webp`)을 넣습니다.
2. 마크다운 상단 `coverImage`에 `"/images/파일명.jpg"` 형태로 지정합니다.

## 4. 정적 사이트 빌드 (배포용)

```bash
npm run build
```
빌드 결과물은 `dist/` 폴더에 생성되며, Vercel, Netlify, Cloudflare Pages, GitHub Pages 등에 그대로 배포할 수 있습니다.
