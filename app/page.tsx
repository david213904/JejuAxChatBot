import survey from "@/data/survey.json";

// 뼈대 화면입니다. 실제 질문 흐름과 결과 카드는 여기에 만듭니다.
export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "48px 16px" }}>
      <h1>제주AX단 길잡이</h1>
      <p>준비 중입니다. 현재 설문 가안 {survey.questions.length}문항이 데이터에 들어 있습니다.</p>
    </main>
  );
}
