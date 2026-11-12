/* 제주AX단 AI 컨설턴트 위젯 (샘플)
 * - AI API 없이 선택형 진단 흐름만 보여 주는 화면 시안입니다.
 * - 규칙과 교육 목록은 샘플이며, 인터뷰 후 확정합니다.
 * - 교육 데이터 기준일: 2026-11-11 (제주AX단 행사 일정 페이지)
 */
(function () {
  "use strict";

  // ---------- 샘플 데이터 ----------
  var DATA_DATE = "2026-11-11";
  var EVENTS_URL = "https://jejuaxdan.com/events";

  var COURSES = [
    {
      id: "memo", title: "쌓아만 둔 메모, 다시 꺼내 쓰기", org: "제주AX단",
      when: "11/12(목) 10:00~13:00", where: "제주한라대학교 K-하이테크 플랫폼 세미나실 (지관 C동 1층)",
      cost: "무료", status: "모집 중 · 접수 마감 11/11", capacity: "15명", field: "문서·업무",
      target: "Claude Code 또는 Codex 유료 구독 사용자 (홈페이지 안내 기준)",
      link: "https://jejuaxdan.com/f/second-brain-1112", linkLabel: "교육 신청 페이지 열기",
      needsPaid: true, tags: ["office", "dev"], info: "full"
    },
    {
      id: "design", title: "AI 디자인 레벨업", org: "제주콘텐츠진흥원",
      when: "접수 마감 11/19", where: "제주콘텐츠코리아랩 지하 교육실 2",
      cost: "", status: "접수 시작 11/10 · 접수 마감 11/19", capacity: "", field: "",
      target: "", link: EVENTS_URL, linkLabel: "행사 일정 페이지 열기",
      needsPaid: false, tags: ["content"], info: "thin"
    },
    {
      id: "job", title: "AI를 활용한 스마트 취업전략(입사서류준비)", org: "제주고용복지플러스센터",
      when: "접수 시작 11/16", where: "제주고용복지플러스센터 5층 교육장(대면)",
      cost: "", status: "접수 시작 11/16", capacity: "", field: "",
      target: "", link: EVENTS_URL, linkLabel: "행사 일정 페이지 열기",
      needsPaid: false, tags: ["office"], info: "thin"
    },
    {
      id: "kakao", title: "카카오 클래스: AI 비즈니스 실전 과정", org: "외부(온라인 VOD)",
      when: "접수 마감 11/27", where: "온라인 VOD",
      cost: "", status: "접수 마감 11/27", capacity: "", field: "",
      target: "", link: EVENTS_URL, linkLabel: "행사 일정 페이지 열기",
      needsPaid: false, tags: ["shop", "office", "content"], info: "thin"
    }
  ];

  var Q = {
    stuck: {
      text: "AI를 쓰다가 어디서 막혔나요? 가장 가까운 것을 골라 주세요.",
      options: [
        ["bad", "결과가 마음에 안 들어요"],
        ["what", "뭘 시켜야 할지 모르겠어요"],
        ["tool", "도구가 너무 많아요"],
        ["stop", "몇 번 쓰다 끊겨요"],
        ["trust", "틀릴까 봐 못 믿겠어요"],
        ["repeat", "매번 처음부터 시켜요"],
        ["secure", "자료를 넣어도 되는지 불안해요"],
        ["alone", "물어볼 곳이 없어요"],
        ["other", "기타 (직접 쓰기)"]
      ]
    },
    job: {
      text: "어떤 일을 하시나요?",
      options: [["office", "사무·행정"], ["shop", "소상공인·자영업"], ["edu", "교육·강의"], ["content", "콘텐츠·디자인"], ["dev", "개발·IT"], ["etc", "기타"]]
    },
    level: {
      text: "지금까지 AI를 어느 정도 써 보셨나요?",
      options: [["0", "거의 안 써 봤어요"], ["1", "검색 대용·가끔 써요"], ["2", "업무 일부에 써요"], ["3", "반복 업무를 자동화해요"], ["4", "내 업무용 도구를 만들어요"]]
    },
    paid: {
      text: "유료 AI 도구를 구독 중이신가요?",
      options: [["yes", "네, 구독 중이에요"], ["no", "아니요, 무료만 써요"]]
    }
  };

  var JOBLABEL = {};
  Q.job.options.forEach(function (o) { JOBLABEL[o[0]] = o[1]; });

  var STUCK = {
    bad: { name: "결과가 마음에 안 듦", cause: "질문(프롬프트)이 모호하거나 맥락이 부족할 수 있어요.", how: "하는 일, 원하는 결과, 조건을 함께 적어 요청해 보세요.", first: "최근에 시켰다가 실패한 요청을 골라, 상황·목표·형식을 한 줄씩 덧붙여 다시 시켜 보기" },
    what: { name: "뭘 시킬지 모름", cause: "내 업무를 작은 작업 단위로 나눠 본 적이 없을 수 있어요.", how: "하루 업무에서 반복되는 작업 3가지를 적어 보세요.", first: "가장 시간을 많이 쓰는 반복 작업 하나를 골라 AI에게 초안을 맡겨 보기" },
    tool: { name: "도구 선택이 어려움", cause: "도구별 용도와 비용 정보가 부족할 수 있어요.", how: "하려는 일(글쓰기, 정리, 디자인 등)부터 정하고 그에 맞는 도구 하나만 써 보세요.", first: "도구 하나만 정해 이번 주에 같은 작업을 3번 해 보기" },
    stop: { name: "쓰다가 끊김", cause: "업무 흐름에 붙어 있지 않고 작은 성공 경험이 부족할 수 있어요.", how: "하루 한 가지, 작게 적용하는 방식으로 시작해 보세요.", first: "내일 업무 중 10분짜리 작업 하나를 AI와 함께 해 보기" },
    trust: { name: "믿을 수 없음", cause: "검증 방법을 몰라서 불안할 수 있어요.", how: "사실·숫자는 출처를 함께 물어보고 직접 확인하는 습관을 들이세요.", first: "AI 답변에서 숫자 하나를 골라 출처를 확인해 보기" },
    repeat: { name: "반복 작업을 못 넘어감", cause: "템플릿·자동화 개념이 낯설 수 있어요.", how: "자주 쓰는 요청을 틀(템플릿)로 저장해 재사용해 보세요.", first: "자주 쓰는 요청 하나를 빈칸이 있는 템플릿으로 만들어 보기" },
    secure: { name: "보안·개인정보 걱정", cause: "넣어도 되는 정보의 기준이 없을 수 있어요.", how: "이름·연락처·고객 정보는 지우고, 숫자와 사례는 바꿔서 입력하세요.", first: "내가 자주 다루는 자료 중 넣으면 안 되는 항목을 목록으로 만들어 보기" },
    alone: { name: "물어볼 곳이 없음", cause: "함께 배우는 사람이 없어 혼자 막힐 수 있어요.", how: "막힌 상황을 한 문단으로 정리해 커뮤니티에 질문해 보세요.", first: "오픈채팅에 '무엇을 하려 했고 어디서 막혔는지'를 한 문단으로 올려 보기" },
    other: { name: "기타", cause: "입력하신 내용을 바탕으로 운영진이 검토합니다.", how: "정리해서 알려 주신 내용은 교육 기획에 참고돼요. (샘플: 실제로 저장되지 않습니다.)", first: "막힌 상황을 한 문단으로 정리해 두기" }
  };

  var LEVEL_NAME = { "0": "0 탐색", "1": "1 질문", "2": "2 업무 적용", "3": "3 반복 자동화", "4": "4 직접 제작" };
  var LEVEL_NEXT = { "0": "먼저 일상 질문과 글쓰기부터 익히는 입문 안내를 추천해요.", "1": "내 업무 하나에 적용해 보는 단계로 넘어가 보세요.", "2": "반복되는 작업을 템플릿·자동화로 묶는 단계를 배워 보세요.", "3": "내 업무용 도구를 직접 만드는 단계를 살펴보세요.", "4": "만든 것을 다른 사람과 나누고 개선하는 단계를 살펴보세요." };

  // ---------- 상태 ----------
  var state = null;
  var body, panel, launcher, input, expandBtn, handle;

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function scrollDown() { body.scrollTop = body.scrollHeight; }
  function scrollToNode(node) { body.scrollTop = node.offsetTop - body.offsetTop - 8; }
  function say(text, who) {
    var m = el("div", "jx-msg " + (who === "user" ? "jx-user" : "jx-bot"), text);
    body.appendChild(m); scrollDown(); return m;
  }
  function choices(list, onPick) {
    var wrap = el("div", "jx-choices");
    list.forEach(function (o) {
      var b = el("button", "jx-choice", o[1]);
      b.type = "button";
      b.addEventListener("click", function () {
        Array.prototype.forEach.call(wrap.querySelectorAll("button"), function (x) { x.disabled = true; });
        say(o[1], "user");
        onPick(o[0], o[1]);
      });
      wrap.appendChild(b);
    });
    body.appendChild(wrap); scrollDown();
  }

  // ---------- 흐름 ----------
  function reset() {
    body.textContent = "";
    state = {};
    say("안녕하세요. 제주AX단 AI 컨설턴트예요.\nAI를 쓰다 막힌 지점을 짚고, 맞는 배움을 안내해 드려요. (선택형 4문항, 약 2분)");
    menu();
  }
  function menu() {
    choices([["start", "진단 시작하기"], ["events", "교육 일정 보기"]], function (v) {
      if (v === "start") askStuck(); else showEvents();
    });
  }
  function askStuck() {
    state = {};
    say(Q.stuck.text);
    choices(Q.stuck.options, function (v) {
      state.stuck = v;
      if (v === "other") askOtherText(); else askJob();
    });
  }
  function askOtherText() {
    say("어떤 점이 막혔는지 아래 입력창에 한 줄로 적어 주세요. (이름·회사·연락처는 쓰지 마세요)");
    state.waitingOther = true;
    input.focus();
  }
  function askJob() {
    say(Q.job.text);
    choices(Q.job.options, function (v) { state.job = v; askLevel(); });
  }
  function askLevel() {
    say(Q.level.text);
    choices(Q.level.options, function (v) { state.level = v; askPaid(); });
  }
  function askPaid() {
    say(Q.paid.text);
    choices(Q.paid.options, function (v) { state.paid = v; showResult(); });
  }

  function pickCourses() {
    var out = [];
    COURSES.forEach(function (c) {
      var jobMatch = c.tags.indexOf(state.job) !== -1;
      var loose = state.job === "edu" || state.job === "etc";
      if (!jobMatch && !loose) return;
      var reasons = [];
      var blocked = false;
      if (jobMatch) reasons.push("하는 일(" + JOBLABEL[state.job] + ")과 교육 분야가 맞아요.");
      else reasons.push("직접 맞는 분야 분류는 없지만 AI 활용 교육이라 함께 보여 드려요.");
      if (c.needsPaid && state.paid === "no") { blocked = true; reasons.push("유료 구독 사용자 대상이라 지금은 조건이 맞지 않아요."); }
      if (c.needsPaid && state.paid === "yes") reasons.push("유료 구독 중이라 대상 조건에 맞아요.");
      if (state.level === "0" && c.id === "memo") reasons.push("AI를 처음 쓰신다면 먼저 입문 안내를 보시길 권해요.");
      out.push({ c: c, blocked: blocked, reasons: reasons });
    });
    out.sort(function (a, b) { return (a.blocked ? 1 : 0) - (b.blocked ? 1 : 0); });
    return out.slice(0, 3);
  }

  // 클릭하면 상세를 보여 주는 교육 항목
  function courseNode(c, ctx) {
    var d = el("button", "jx-course");
    d.type = "button";
    d.setAttribute("aria-label", c.title + " 자세히 보기");
    var t = el("div"); t.appendChild(el("span", "jx-tag", c.org)); t.appendChild(el("strong", null, c.title)); d.appendChild(t);
    d.appendChild(el("div", null, c.when + (c.cost ? " · " + c.cost : "")));
    d.appendChild(el("div", null, "장소: " + c.where));
    if (c.note) d.appendChild(el("div", "jx-note", c.note));
    d.appendChild(el("span", "jx-more", "자세히 보기 ›"));
    d.addEventListener("click", function () { showDetail(c, ctx); });
    return d;
  }

  function showResult() {
    var s = STUCK[state.stuck];
    var card = el("div", "jx-card");
    card.appendChild(el("h4", null, "진단 결과 · 활용 단계 " + LEVEL_NAME[state.level]));
    var dl = el("dl");
    function row(k, v) { dl.appendChild(el("dt", null, k)); dl.appendChild(el("dd", null, v)); }
    row("막힌 지점", s.name + (state.otherText ? " — " + state.otherText : ""));
    row("가능한 원인", s.cause);
    row("활용 방법", s.how);
    row("오늘 해 볼 첫 실습", s.first);
    row("다음 배울 순서", LEVEL_NEXT[state.level]);
    card.appendChild(dl);

    var picks = pickCourses();
    var head = el("dl"); head.appendChild(el("dt", null, "연결 교육 (일정 기준 " + DATA_DATE + ") · 눌러서 자세히 보기"));
    card.appendChild(head);
    var box = el("div"); box.style.padding = "0 12px";
    if (!picks.length) box.appendChild(el("div", "jx-note", "조건에 맞는 교육을 찾지 못했어요. 교육 일정 페이지에서 확인해 보세요."));
    picks.forEach(function (p) {
      box.appendChild(courseNode(p.c, { reasons: p.reasons }));
      p.reasons.forEach(function (r) {
        if (/맞지 않/.test(r) || /입문/.test(r)) box.appendChild(el("div", "jx-warn", r));
      });
    });
    card.appendChild(box);
    card.appendChild(el("div", "jx-note", "※ 샘플 규칙입니다. 추천 로직과 문구는 회원 인터뷰 후 확정해요."));
    body.appendChild(card);
    say("더 궁금한 점이 있으세요?");
    choices([["again", "다시 진단하기"], ["events", "교육 일정 보기"]], function (v) {
      if (v === "again") askStuck(); else showEvents();
    });
    scrollToNode(card);
  }

  function showDetail(c, ctx) {
    say(c.title + " 자세히 보기", "user");
    var card = el("div", "jx-card");
    card.appendChild(el("h4", null, c.title));
    var dl = el("dl");
    function row(k, v) { dl.appendChild(el("dt", null, k)); dl.appendChild(el("dd", null, v)); }
    row("주관", c.org);
    row("일정", c.when);
    row("장소", c.where);
    row("접수 상태", c.status);
    if (c.cost) row("수강료", c.cost);
    if (c.capacity) row("정원", c.capacity);
    if (c.field) row("분야", c.field);
    if (c.target) row("대상·조건", c.target);
    card.appendChild(dl);

    if (c.info === "thin") {
      card.appendChild(el("div", "jx-warn jx-pad", "정보 부족: 대상, 난이도, 선수 조건은 아직 확인되지 않았어요. 신청 전에 상세 페이지에서 꼭 확인해 주세요."));
    }
    if (ctx && ctx.reasons && ctx.reasons.length) {
      var rdl = el("dl"); rdl.appendChild(el("dt", null, "이 교육을 추천한 이유"));
      card.appendChild(rdl);
      var ul = el("ul", "jx-reasons");
      ctx.reasons.forEach(function (r) { ul.appendChild(el("li", null, r)); });
      card.appendChild(ul);
    }
    var a = el("a", "jx-link", c.linkLabel);
    a.href = c.link; a.target = "_blank"; a.rel = "noopener noreferrer";
    var wrap = el("div", "jx-pad"); wrap.appendChild(a); card.appendChild(wrap);
    card.appendChild(el("div", "jx-note", "※ 정보 기준 " + DATA_DATE + ". 일정과 접수 상태는 바뀔 수 있어요."));
    body.appendChild(card);
    choices([["list", "다른 교육 보기"], ["again", "다시 진단하기"]], function (v) {
      if (v === "list") showEvents(); else askStuck();
    });
    scrollToNode(card);
  }

  function showEvents() {
    var card = el("div", "jx-card");
    card.appendChild(el("h4", null, "교육·행사 일정 (기준 " + DATA_DATE + ")"));
    var box = el("div"); box.style.padding = "8px 12px 0";
    COURSES.forEach(function (c) { box.appendChild(courseNode(c, null)); });
    card.appendChild(box);
    card.appendChild(el("div", "jx-note", "※ 눌러서 자세히 볼 수 있어요. 접수 시작·마감일은 교육 당일과 다를 수 있어요."));
    body.appendChild(card);
    menu();
    scrollToNode(card);
  }

  function onSubmit(e) {
    e.preventDefault();
    var v = input.value.trim();
    if (!v) return;
    input.value = "";
    say(v, "user");
    if (state && state.waitingOther) {
      state.waitingOther = false;
      state.otherText = v.slice(0, 60);
      askJob();
    } else {
      say("(샘플) 이 자리에 AI 답변이 연결돼요. 지금은 위의 버튼으로 진단을 진행해 주세요.");
    }
  }

  // ---------- 창 크기 ----------
  var ICON_EXPAND = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 4h6v6M10 20H4v-6M20 4l-7 7M4 20l7-7"/></svg>';
  var ICON_SHRINK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10h-6V4M4 14h6v6M14 10l7-7M10 14l-7 7"/></svg>';

  function setExpanded(on) {
    panel.classList.toggle("jx-expanded", on);
    panel.style.width = ""; panel.style.height = "";
    expandBtn.innerHTML = on ? ICON_SHRINK : ICON_EXPAND;
    expandBtn.setAttribute("aria-label", on ? "창 작게" : "창 크게");
    expandBtn.setAttribute("title", on ? "창 작게" : "창 크게");
    expandBtn.setAttribute("aria-pressed", on ? "true" : "false");
  }

  function startDrag(e) {
    if (panel.classList.contains("jx-expanded")) return;
    e.preventDefault();
    var r = panel.getBoundingClientRect();
    var sx = e.clientX, sy = e.clientY, sw = r.width, sh = r.height;
    var maxW = window.innerWidth - 32, maxH = window.innerHeight - 48;
    handle.setPointerCapture(e.pointerId);
    function move(ev) {
      var w = Math.min(maxW, Math.max(320, sw + (sx - ev.clientX)));
      var h = Math.min(maxH, Math.max(420, sh + (sy - ev.clientY)));
      panel.style.width = w + "px"; panel.style.height = h + "px";
    }
    function up(ev) {
      handle.releasePointerCapture(ev.pointerId);
      handle.removeEventListener("pointermove", move);
      handle.removeEventListener("pointerup", up);
    }
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", up);
  }

  // ---------- 화면 ----------
  function open() { panel.classList.add("jx-open"); launcher.setAttribute("aria-expanded", "true"); if (!state) reset(); }
  function close() { panel.classList.remove("jx-open"); launcher.setAttribute("aria-expanded", "false"); launcher.focus(); }

  function build() {
    launcher = el("button");
    launcher.id = "jx-launcher"; launcher.type = "button";
    launcher.setAttribute("aria-label", "AI 컨설턴트 열기");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.6 8.6 0 0 1-3.6-.8L3 21l1.9-5.1A8.4 8.4 0 1 1 21 11.5z"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01"/></svg>';
    launcher.addEventListener("click", open);

    panel = el("section"); panel.id = "jx-panel";
    panel.setAttribute("role", "dialog"); panel.setAttribute("aria-label", "제주AX단 AI 컨설턴트");

    handle = el("div", "jx-resize");
    handle.setAttribute("aria-hidden", "true");
    handle.title = "끌어서 크기 조절";
    handle.addEventListener("pointerdown", startDrag);

    var head = el("div", "jx-head");
    var ttl = el("div"); ttl.appendChild(el("strong", null, "제주AX단 AI 컨설턴트")); ttl.appendChild(el("small", null, "막힌 지점을 짚고 맞는 배움을 안내해요"));
    var btns = el("div", "jx-btns");
    expandBtn = el("button", "jx-iconbtn"); expandBtn.type = "button";
    expandBtn.addEventListener("click", function () { setExpanded(!panel.classList.contains("jx-expanded")); });
    var x = el("button", "jx-iconbtn", "✕"); x.type = "button"; x.setAttribute("aria-label", "닫기"); x.addEventListener("click", close);
    btns.appendChild(expandBtn); btns.appendChild(x);
    head.appendChild(ttl); head.appendChild(btns);

    body = el("div", "jx-body"); body.setAttribute("aria-live", "polite");

    var foot = el("form", "jx-foot"); foot.addEventListener("submit", onSubmit);
    input = el("input"); input.type = "text"; input.placeholder = "메시지를 입력하세요"; input.maxLength = 100; input.setAttribute("aria-label", "메시지 입력");
    var send = el("button", null, "보내기"); send.type = "submit";
    foot.appendChild(input); foot.appendChild(send);

    var sample = el("div", "jx-sample", "화면 시안(샘플) · AI 연결 전 · 실제 저장 없음");

    panel.appendChild(handle); panel.appendChild(head); panel.appendChild(body); panel.appendChild(sample); panel.appendChild(foot);
    document.body.appendChild(launcher); document.body.appendChild(panel);
    setExpanded(false);

    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && panel.classList.contains("jx-open")) close(); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
