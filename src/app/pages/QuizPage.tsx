import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Award, CheckCircle2, RotateCcw, XCircle } from "lucide-react";

interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTION_POOL: Question[] = [
  {
    question: "Cơ cấu xã hội - giai cấp được hiểu đúng nhất là gì?",
    options: [
      "Tổng dân số theo độ tuổi",
      "Hệ thống giai cấp, tầng lớp xã hội và quan hệ giữa chúng",
      "Số lượng ngành nghề trong nền kinh tế",
      "Cơ cấu tổ chức bộ máy nhà nước",
    ],
    correct: 1,
    explanation: "Khái niệm này nhấn mạnh hệ thống giai cấp, tầng lớp và các quan hệ xã hội giữa chúng.",
  },
  {
    question: "Vị trí của cơ cấu xã hội - giai cấp trong cơ cấu xã hội là gì?",
    options: [
      "Vai trò phụ",
      "Không đáng kể",
      "Trung tâm và có ý nghĩa quyết định",
      "Chỉ quan trọng trong văn hóa",
    ],
    correct: 2,
    explanation: "Vì nó gắn trực tiếp với quan hệ sản xuất - nền tảng của đời sống xã hội.",
  },
  {
    question: "Sự biến đổi cơ cấu xã hội - giai cấp trong thời kỳ quá độ chịu sự quy định chủ yếu bởi:",
    options: ["Cơ cấu kinh tế", "Địa lý tự nhiên", "Tôn giáo", "Tâm lý cá nhân"],
    correct: 0,
    explanation: "Biến đổi cơ cấu xã hội - giai cấp luôn gắn với biến đổi cơ cấu kinh tế.",
  },
  {
    question: "Liên minh giai cấp, tầng lớp trong thời kỳ quá độ nhằm mục tiêu nào?",
    options: [
      "Duy trì nguyên trạng xã hội",
      "Bảo vệ lợi ích riêng từng nhóm",
      "Thực hiện mục tiêu xây dựng chủ nghĩa xã hội",
      "Thay thế vai trò của Nhà nước",
    ],
    correct: 2,
    explanation: "Liên minh hướng đến mục tiêu chung là xây dựng xã hội mới.",
  },
  {
    question: "Theo quan điểm Mác - Lênin, giai cấp công nhân giữ vai trò gì?",
    options: ["Đồng minh phụ", "Lực lượng lãnh đạo", "Lực lượng trung gian", "Lực lượng đối lập"],
    correct: 1,
    explanation: "Giai cấp công nhân là lực lượng lãnh đạo cách mạng thông qua Đảng.",
  },
  {
    question: "Trong liên minh giai cấp ở Việt Nam, đâu là nền tảng chiến lược?",
    options: [
      "Liên minh công nhân - nông dân - trí thức",
      "Liên minh doanh nhân - trí thức",
      "Liên minh nông dân - tiểu chủ",
      "Liên minh công nhân - doanh nhân",
    ],
    correct: 0,
    explanation: "Đây là nền tảng chính trị - xã hội của khối đại đoàn kết toàn dân tộc.",
  },
  {
    question: "Đội ngũ trí thức có vai trò nổi bật nào?",
    options: [
      "Giảm vai trò khoa học công nghệ",
      "Lao động tay chân là chính",
      "Lao động sáng tạo, thúc đẩy khoa học - công nghệ",
      "Chỉ hoạt động trong giáo dục phổ thông",
    ],
    correct: 2,
    explanation: "Trí thức là lực lượng sáng tạo đặc biệt quan trọng trong thời đại số.",
  },
  {
    question: "Đội ngũ doanh nhân đóng góp chủ yếu vào:",
    options: [
      "Giảm GDP",
      "Tăng trưởng, tạo việc làm và đổi mới sáng tạo",
      "Thu hẹp thị trường",
      "Giảm năng suất lao động",
    ],
    correct: 1,
    explanation: "Doanh nhân góp phần trực tiếp vào tăng trưởng kinh tế và an sinh xã hội.",
  },
  {
    question: "Nội dung nào là cốt lõi nhất của liên minh giai cấp, tầng lớp?",
    options: ["Văn hóa", "Kinh tế", "Lễ nghi", "Địa phương"],
    correct: 1,
    explanation: "Nội dung kinh tế là cơ bản và quyết định nhất.",
  },
  {
    question: "Nội dung chính trị của liên minh giai cấp bao gồm:",
    options: [
      "Giữ vững độc lập dân tộc và bảo vệ chế độ",
      "Chỉ tập trung tăng thu nhập cá nhân",
      "Giảm vai trò pháp luật",
      "Tách rời vai trò lãnh đạo của Đảng",
    ],
    correct: 0,
    explanation: "Đây là nội dung then chốt của phương diện chính trị trong liên minh.",
  },
  {
    question: "Nội dung văn hóa - xã hội của liên minh hướng tới:",
    options: [
      "Giảm tiếp cận giáo dục",
      "Nâng cao chất lượng nguồn nhân lực và an sinh",
      "Tăng bất bình đẳng",
      "Tách rời phát triển với công bằng xã hội",
    ],
    correct: 1,
    explanation: "Mục tiêu là phát triển con người toàn diện, gắn tăng trưởng với tiến bộ xã hội.",
  },
  {
    question: "Phương hướng nào giúp tăng cường liên minh giai cấp, tầng lớp?",
    options: [
      "Phân biệt đối xử giữa các nhóm",
      "Đẩy mạnh công nghiệp hóa, hiện đại hóa",
      "Tách rời khoa học - công nghệ khỏi phát triển",
      "Giảm đồng thuận xã hội",
    ],
    correct: 1,
    explanation: "Đây là phương hướng cơ bản để chuyển biến tích cực cơ cấu xã hội - giai cấp.",
  },
  {
    question: "Hoàn thiện thể chế kinh tế thị trường định hướng XHCN có ý nghĩa gì?",
    options: [
      "Làm suy yếu liên minh",
      "Tạo nền tảng phát triển bền vững và củng cố liên minh",
      "Chỉ có ý nghĩa ngắn hạn",
      "Không liên quan đến liên minh",
    ],
    correct: 1,
    explanation: "Thể chế phù hợp giúp hài hòa lợi ích và thúc đẩy phát triển bền vững.",
  },
  {
    question: "Sự biến đổi cơ cấu xã hội - giai cấp trong thời kỳ quá độ có đặc điểm nào?",
    options: [
      "Đơn điệu và bất biến",
      "Chỉ thay đổi về số lượng dân cư",
      "Phức tạp, đa dạng, xuất hiện tầng lớp mới",
      "Không chịu tác động của kinh tế",
    ],
    correct: 2,
    explanation: "Sự phát triển của nền kinh tế nhiều thành phần làm cơ cấu xã hội đa dạng hơn.",
  },
  {
    question: "Giai cấp nông dân trong thời kỳ quá độ ở Việt Nam có vị trí:",
    options: [
      "Không quan trọng",
      "Chiến lược trong phát triển nông nghiệp, nông thôn",
      "Chỉ là lực lượng bổ sung tạm thời",
      "Không gắn với công nghiệp hóa",
    ],
    correct: 1,
    explanation: "Nông dân giữ vị trí chiến lược trong phát triển nông nghiệp và nông thôn mới.",
  },
  {
    question: "Đại đoàn kết toàn dân tộc được xác định là:",
    options: [
      "Giải pháp ngắn hạn",
      "Đường lối chiến lược",
      "Biện pháp tạm thời",
      "Nhiệm vụ phụ trợ",
    ],
    correct: 1,
    explanation: "Đảng xác định đại đoàn kết toàn dân tộc là đường lối chiến lược lâu dài.",
  },
  {
    question: "Vì sao không nên tuyệt đối hóa cơ cấu xã hội - giai cấp?",
    options: [
      "Vì không quan trọng",
      "Vì cần xem xét đồng thời các cơ cấu xã hội khác",
      "Vì chỉ có ý nghĩa lý thuyết",
      "Vì không gắn với chính trị",
    ],
    correct: 1,
    explanation: "Cần nhìn nhận toàn diện giữa cơ cấu giai cấp với dân tộc, tôn giáo, văn hóa và các lĩnh vực khác.",
  },
  {
    question: "Quan hệ giữa các giai cấp trong thời kỳ quá độ thường biểu hiện:",
    options: [
      "Chỉ đấu tranh, không liên minh",
      "Vừa đấu tranh vừa liên minh",
      "Không đấu tranh, không liên minh",
      "Hoàn toàn đối kháng",
    ],
    correct: 1,
    explanation: "Xu hướng chung là tăng hợp tác, xích lại gần nhau trên lợi ích chung.",
  },
  {
    question: "Đổi mới hoạt động của Đảng, Nhà nước, Mặt trận nhằm:",
    options: [
      "Làm suy yếu đại đoàn kết",
      "Tăng cường khối liên minh và đại đoàn kết toàn dân",
      "Giảm vai trò của nhân dân",
      "Hạn chế dân chủ",
    ],
    correct: 1,
    explanation: "Đây là một trong các phương hướng trọng tâm được xác định trong giai đoạn hiện nay.",
  },
  {
    question: "Kết luận đúng về vai trò của cơ cấu xã hội - giai cấp và liên minh giai cấp là:",
    options: [
      "Không ảnh hưởng đến xây dựng CNXH",
      "Có ý nghĩa chiến lược, quyết định thành công xây dựng CNXH",
      "Chỉ là vấn đề học thuật",
      "Chỉ liên quan đến một nhóm xã hội",
    ],
    correct: 1,
    explanation: "Đây là vấn đề có ý nghĩa chiến lược đối với sự phát triển của Việt Nam hiện nay.",
  },
];

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getRandomQuestions(size = 12): Question[] {
  return shuffle(QUESTION_POOL).slice(0, size);
}

export function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>(() => getRandomQuestions());
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);

  const handleSelectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null) {
      return;
    }
    setSelectedAnswer(answerIndex);
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      return;
    }

    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    setAnswers((prev) => [...prev, isCorrect]);
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswer(null);
    } else {
      setShowResult(true);
    }
  };

  const handleRestart = () => {
    setQuestions(getRandomQuestions());
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setShowResult(false);
    setAnswers([]);
  };

  if (showResult) {
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
        <Navigation />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
            <div className="text-center mb-7">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 mx-auto flex items-center justify-center mb-4">
                <Award size={40} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Kết quả trắc nghiệm</h1>
              <p className="text-gray-600 mt-2">
                Bạn đúng <span className="font-bold text-blue-600">{score}</span> / {questions.length} câu
              </p>
              <p className="text-5xl font-bold mt-4 text-blue-700">{percentage}%</p>
            </div>

            <div className="space-y-3 mb-7">
              {questions.map((question, index) => (
                <div
                  key={question.question}
                  className={`p-4 rounded-xl border ${answers[index] ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
                >
                  <p className="font-semibold text-gray-800 mb-1">
                    Câu {index + 1}: {question.question}
                  </p>
                  <p className={`text-sm ${answers[index] ? "text-green-700" : "text-red-700"}`}>
                    Đáp án đúng: {question.options[question.correct]}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <button
                onClick={handleRestart}
                className="px-5 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <RotateCcw size={18} />
                Làm lại với bộ câu random mới
              </button>
              <button
                onClick={() => (window.location.href = "/knowledge")}
                className="px-5 py-3 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
              >
                Ôn tập kiến thức
              </button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const progress = Math.round(((currentQuestion + 1) / questions.length) * 100);
  const current = questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      <Navigation />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <section className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Trắc nghiệm chương 5</h1>
            <div className="px-4 py-2 rounded-lg bg-blue-100 text-blue-800 font-semibold">
              Điểm: {score}/{questions.length}
            </div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>
              Câu {currentQuestion + 1}/{questions.length}
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200">
            <div className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{ width: `${progress}%` }} />
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{current.question}</h2>

              <div className="space-y-3">
                {current.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = index === current.correct;
                  const showCorrect = selectedAnswer !== null && isCorrect;
                  const showWrong = selectedAnswer !== null && isSelected && !isCorrect;

                  return (
                    <button
                      key={option}
                      disabled={selectedAnswer !== null}
                      onClick={() => handleSelectAnswer(index)}
                      className={`w-full text-left px-4 py-3 rounded-xl border-2 transition ${
                        showCorrect
                          ? "bg-green-50 border-green-300"
                          : showWrong
                          ? "bg-red-50 border-red-300"
                          : isSelected
                          ? "bg-blue-50 border-blue-300"
                          : "bg-white border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-sm font-semibold">
                          {String.fromCharCode(65 + index)}
                        </div>
                        <span>{option}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {selectedAnswer !== null && (
                <div className={`mt-5 p-4 rounded-xl border ${selectedAnswer === current.correct ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                  <div className="flex items-start gap-2">
                    {selectedAnswer === current.correct ? (
                      <CheckCircle2 className="text-green-600 mt-0.5" size={20} />
                    ) : (
                      <XCircle className="text-red-600 mt-0.5" size={20} />
                    )}
                    <div>
                      <p className={`font-semibold ${selectedAnswer === current.correct ? "text-green-700" : "text-red-700"}`}>
                        {selectedAnswer === current.correct ? "Chính xác." : "Chưa đúng."}
                      </p>
                      <p className={`text-sm mt-1 ${selectedAnswer === current.correct ? "text-green-700" : "text-red-700"}`}>
                        {current.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleNext}
                disabled={selectedAnswer === null}
                className={`w-full mt-5 py-3 rounded-lg font-semibold transition-all ${
                  selectedAnswer === null ? "bg-gray-200 text-gray-500 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 active:scale-[0.98]"
                }`}
              >
                {currentQuestion < questions.length - 1 ? "Câu tiếp theo" : "Xem kết quả"}
              </button>
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
      <Footer />
    </div>
  );
}
