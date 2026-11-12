# backend

AI 호출을 대신 해 주는 서버 쪽 자리입니다. **아직 코드는 없고**(4단계에서 구현), 규격과 가짜 응답만 있습니다.
자세한 명세는 `../docs/개발명세/02_백엔드_명세.md`.

| 경로 | 내용 |
|---|---|
| `.env.example` | 필요한 환경변수 이름(값은 비움) |
| `mock/explain.response.json` | `POST /api/diagnosis/explain` 정상 응답 예시 |
| `mock/explain.fallback.json` | AI를 쓸 수 없을 때의 응답 예시(화면은 규칙 결과만 표시) |

## 만들 폴더 (4단계에 추가)
```
backend/
├─ api/diagnosis/explain.*   AI 설명 문단 1개 생성
├─ ai/                       AI 호출 모듈(교체 가능하게 분리)
├─ lib/                      입력 검증, 호출 한도, 개인정보 가림
└─ tests/
```

## 규칙
- 비밀 키는 환경변수로만 보관하고 저장소에 올리지 않습니다. `.env`는 `.gitignore`에 들어 있습니다.
- 진단과 추천은 서버가 아니라 화면과 `../data/`의 규칙에서 계산합니다.
- AI 호출은 진단 1회당 최대 1회, 출력 길이와 하루 호출 수에 상한을 둡니다.
- 허용한 화면 주소(`FRONT_ORIGINS`)에서 온 요청만 받습니다.
