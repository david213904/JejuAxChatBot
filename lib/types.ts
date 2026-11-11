// 데이터 파일의 형식입니다. 데이터 담당과 개발 담당이 이 형식으로 약속합니다.

export type Stage = 0 | 1 | 2 | 3 | 4;

/** data/courses.json: 제주AX단 교육 */
export interface Course {
  id: string;
  title: string;
  date: string | null; // 예: "2026-11-12", 일정이 없으면 null
  place: string | null;
  priceKrw: number | null; // 무료는 0
  capacity: number | null;
  stages: Stage[]; // 어느 단계에 맞는지
  blockers: string[]; // 어떤 막힘에 맞는지 (survey.json의 tag)
  fields: string[]; // 업무 분야 태그 (예: "자영업", "교육")
  requirement: string | null; // 예: "Claude Code 또는 Codex 유료 구독자"
  url: string | null; // 신청 또는 상세 링크
  status: "open" | "past";
  source: string; // 정보 출처
  checkedAt: string; // 마지막 확인일
}

/** data/videos.json: 검증된 유튜브 영상 */
export interface Video {
  id: string;
  title: string;
  url: string;
  channel: string;
  durationMin: number;
  publishedAt: string;
  stages: Stage[];
  blockers: string[];
  fields: string[];
  note: string; // 추천 이유 한 줄
  verifiedBy: string; // 확인한 사람
  verifiedAt: string;
}

/** data/survey.json: 객관식 문항 */
export interface SurveyOption {
  label: string;
  tag: string; // 분기와 판정에 쓰는 태그
  stage?: Stage; // 단계 판정용 (Q1에서 사용)
}
export interface SurveyQuestion {
  id: string;
  text: string;
  purpose: string;
  multiple: boolean;
  options: SurveyOption[];
}
