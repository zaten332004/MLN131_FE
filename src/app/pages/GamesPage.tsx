import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { CheckCircle2, RotateCcw, Star, XCircle, Puzzle, Scale } from "lucide-react";

const ease = [0.25, 0.46, 0.45, 0.94] as const;
const transition = { duration: 0.35, ease };

interface PairItem {
  id: string;
  term: string;
  definition: string;
}

interface TfQuestion {
  question: string;
  correct: boolean;
  explanation: string;
}

const MATCHING_POOL: PairItem[] = [
  {
    id: "1",
    term: "Cơ cấu xã hội - giai cấp",
    definition: "Hệ thống các giai cấp, tầng lớp xã hội tồn tại khách quan trong một chế độ xã hội.",
  },
  {
    id: "2",
    term: "Giai cấp công nhân",
    definition: "Lực lượng lãnh đạo cách mạng thông qua Đảng, đại diện cho phương thức sản xuất tiên tiến.",
  },
  {
    id: "3",
    term: "Giai cấp nông dân",
    definition: "Đồng minh chiến lược, lực lượng có vị trí quan trọng trong phát triển nông nghiệp, nông thôn.",
  },
  {
    id: "4",
    term: "Đội ngũ trí thức",
    definition: "Lực lượng lao động sáng tạo đặc biệt quan trọng, cầu nối giữa lý luận và thực tiễn.",
  },
  {
    id: "5",
    term: "Đội ngũ doanh nhân",
    definition: "Lực lượng đóng góp tăng trưởng GDP, tạo việc làm và thúc đẩy đổi mới sáng tạo.",
  },
  {
    id: "6",
    term: "Liên minh giai cấp",
    definition: "Sự liên kết, hợp tác, hỗ trợ giữa các giai cấp và tầng lớp nhằm thực hiện mục tiêu chung.",
  },
  {
    id: "7",
    term: "Nội dung kinh tế",
    definition: "Đẩy mạnh công nghiệp hóa, hiện đại hóa và giải quyết hài hòa lợi ích các giai cấp.",
  },
  {
    id: "8",
    term: "Nội dung chính trị",
    definition: "Giữ vững nền tảng tư tưởng, bảo vệ chế độ và phát huy quyền làm chủ của nhân dân.",
  },
  {
    id: "9",
    term: "Nội dung văn hóa - xã hội",
    definition: "Nâng cao dân trí, phát triển nguồn nhân lực, đảm bảo an sinh và công bằng xã hội.",
  },
  {
    id: "10",
    term: "Đồng thuận xã hội",
    definition: "Cơ sở để phát huy tinh thần đại đoàn kết toàn dân tộc.",
  },
  {
    id: "11",
    term: "Thể chế kinh tế thị trường định hướng XHCN",
    definition: "Nền tảng để phát triển kinh tế bền vững và bảo đảm định hướng xã hội chủ nghĩa.",
  },
  {
    id: "12",
    term: "Biến đổi cơ cấu xã hội - giai cấp",
    definition: "Diễn ra phức tạp, đa dạng và gắn chặt với sự biến đổi của cơ cấu kinh tế.",
  },
  {
    id: "13",
    term: "Liên minh công - nông - trí thức",
    definition: "Nền tảng chính trị - xã hội quan trọng trong thời kỳ quá độ lên CNXH.",
  },
  {
    id: "14",
    term: "Đại đoàn kết toàn dân tộc",
    definition: "Đường lối chiến lược của Đảng, được tăng cường trên nền tảng liên minh giai cấp.",
  },
];

const TRUE_FALSE_POOL: TfQuestion[] = [
  {
    question: "Cơ cấu xã hội - giai cấp giữ vai trò trung tâm trong hệ thống các cơ cấu xã hội.",
    correct: true,
    explanation: "Đúng. Vì nó gắn trực tiếp với quan hệ sản xuất và tác động đến các cơ cấu xã hội khác.",
  },
  {
    question: "Trong thời kỳ quá độ, cơ cấu xã hội - giai cấp luôn đơn giản và ổn định.",
    correct: false,
    explanation: "Sai. Cơ cấu này biến đổi phức tạp, đa dạng và xuất hiện các tầng lớp xã hội mới.",
  },
  {
    question: "Giai cấp công nhân giữ vai trò lãnh đạo cách mạng thông qua Đảng Cộng sản.",
    correct: true,
    explanation: "Đúng. Đây là vai trò chính trị cốt lõi của giai cấp công nhân ở Việt Nam.",
  },
  {
    question: "Liên minh giai cấp chỉ có nội dung kinh tế, không có nội dung chính trị.",
    correct: false,
    explanation: "Sai. Liên minh gồm nội dung kinh tế, chính trị và văn hóa - xã hội.",
  },
  {
    question: "Đội ngũ trí thức là lực lượng lao động sáng tạo đặc biệt quan trọng.",
    correct: true,
    explanation: "Đúng. Trí thức góp phần nâng cao trình độ khoa học - công nghệ và trí tuệ dân tộc.",
  },
  {
    question: "Đội ngũ doanh nhân không có vai trò trong phát triển kinh tế xã hội.",
    correct: false,
    explanation: "Sai. Doanh nhân đóng góp tăng trưởng, tạo việc làm và đổi mới sáng tạo.",
  },
  {
    question: "Liên minh công - nông được V.I. Lênin coi là vấn đề mang tính nguyên tắc.",
    correct: true,
    explanation: "Đúng. Đây là nền tảng chính trị - xã hội cho thắng lợi của cách mạng.",
  },
  {
    question: "Nội dung chính trị của liên minh bao gồm xây dựng Nhà nước pháp quyền và bảo vệ chế độ.",
    correct: true,
    explanation: "Đúng. Đây là những nhiệm vụ cốt lõi của nội dung chính trị.",
  },
  {
    question: "Đồng thuận xã hội không ảnh hưởng đến khối liên minh giai cấp.",
    correct: false,
    explanation: "Sai. Đồng thuận xã hội là điều kiện để củng cố khối liên minh và đại đoàn kết.",
  },
  {
    question: "Sự biến đổi cơ cấu xã hội - giai cấp tách rời khỏi biến đổi cơ cấu kinh tế.",
    correct: false,
    explanation: "Sai. Hai quá trình này gắn bó chặt chẽ với nhau.",
  },
  {
    question: "Giai cấp nông dân có vị trí chiến lược trong phát triển nông nghiệp, nông thôn.",
    correct: true,
    explanation: "Đúng. Đây là lực lượng đặc biệt quan trọng ở Việt Nam.",
  },
  {
    question: "Hoàn thiện thể chế kinh tế thị trường định hướng XHCN là một phương hướng tăng cường liên minh.",
    correct: true,
    explanation: "Đúng. Đây là một trong các phương hướng cơ bản được xác định hiện nay.",
  },
  {
    question: "Mâu thuẫn giữa các giai cấp trong thời kỳ quá độ luôn mang tính đối kháng gay gắt.",
    correct: false,
    explanation: "Sai. Mâu thuẫn vẫn tồn tại nhưng xu hướng liên minh và hợp tác ngày càng tăng.",
  },
  {
    question: "Liên minh giai cấp chỉ cần thiết trong đấu tranh giành chính quyền.",
    correct: false,
    explanation: "Sai. Liên minh còn cần thiết trong cả công cuộc cải tạo và xây dựng xã hội mới.",
  },
  {
    question: "Đổi mới hoạt động của Đảng, Nhà nước và Mặt trận góp phần củng cố khối liên minh.",
    correct: true,
    explanation: "Đúng. Đây là giải pháp trực tiếp để tăng cường đại đoàn kết toàn dân tộc.",
  },
  {
    question: "Thanh niên và phụ nữ là các lực lượng xã hội không liên quan đến khối liên minh.",
    correct: false,
    explanation: "Sai. Đây là các lực lượng quan trọng trong cơ cấu xã hội hiện nay.",
  },
  {
    question: "Nội dung văn hóa - xã hội của liên minh gắn với nâng cao chất lượng nguồn nhân lực.",
    correct: true,
    explanation: "Đúng. Đây là mục tiêu then chốt trong xây dựng con người và xã hội.",
  },
];

function shuffle<T>(items: T[]): T[] {
  const cloned = [...items];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function getRandomMatchingSet() {
  const selected = shuffle(MATCHING_POOL).slice(0, 8);
  return {
    terms: shuffle(selected),
    definitions: shuffle(selected),
  };
}

function getRandomTrueFalseSet() {
  return shuffle(TRUE_FALSE_POOL).slice(0, 10);
}

export function GamesPage() {
  const [selectedGame, setSelectedGame] = useState<"matching" | "truefalse" | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-cyan-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transition}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Trò chơi học tập</h1>
          <p className="text-gray-600">Mỗi lần vào game hoặc bấm chơi lại sẽ random bộ câu mới.</p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!selectedGame && (
            <motion.div
              key="menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={transition}
              className="grid md:grid-cols-2 gap-6"
            >
              <motion.button
                onClick={() => setSelectedGame("matching")}
                className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transition, delay: 0.05 }}
                whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <Puzzle size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Game 1: Ghép đôi khái niệm</h2>
                <p className="text-gray-600">Ghép thuật ngữ với định nghĩa đúng. Bộ 8 cặp sẽ đổi mỗi lần chơi.</p>
              </motion.button>

              <motion.button
                onClick={() => setSelectedGame("truefalse")}
                className="text-left bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md p-7"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...transition, delay: 0.1 }}
                whileHover={{ y: -4, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Scale size={24} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Game 2: Đúng / Sai</h2>
                <p className="text-gray-600">Trả lời 10 mệnh đề đúng sai được random từ bộ câu lớn.</p>
              </motion.button>
            </motion.div>
          )}

          {selectedGame === "matching" && (
            <motion.div
              key="matching"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={transition}
            >
              <MatchingGame onBack={() => setSelectedGame(null)} />
            </motion.div>
          )}
          {selectedGame === "truefalse" && (
            <motion.div
              key="truefalse"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={transition}
            >
              <TrueFalseGame onBack={() => setSelectedGame(null)} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

function MatchingGame({ onBack }: { onBack: () => void }) {
  const [gameData, setGameData] = useState(getRandomMatchingSet);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);

  const isComplete = matchedIds.length === gameData.terms.length;

  const handleDefinitionClick = (definitionId: string) => {
    if (!selectedTerm || matchedIds.includes(definitionId)) {
      return;
    }

    if (selectedTerm === definitionId) {
      setMatchedIds((prev) => [...prev, definitionId]);
      setScore((prev) => prev + 15);
      setFeedback("correct");
    } else {
      setScore((prev) => Math.max(0, prev - 5));
      setFeedback("wrong");
    }

    setSelectedTerm(null);
    window.setTimeout(() => setFeedback(null), 700);
  };

  const handleRestart = () => {
    setGameData(getRandomMatchingSet());
    setSelectedTerm(null);
    setMatchedIds([]);
    setScore(0);
    setFeedback(null);
  };

  return (
    <motion.section
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition}
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <motion.button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Quay lại
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">Điểm: {score}</div>
          <motion.button
            onClick={handleRestart}
            className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center"
            aria-label="Chơi lại"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={18} />
          </motion.button>
        </div>
      </div>

      <h2 className="text-2xl font-bold text-gray-900">Ghép thuật ngữ với định nghĩa</h2>
      <p className="text-gray-600 mt-1 mb-6">Bước 1: chọn thuật ngữ. Bước 2: chọn định nghĩa phù hợp.</p>

      <AnimatePresence>
        {feedback === "correct" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700"
          >
            Chính xác.
          </motion.div>
        )}
        {feedback === "wrong" && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700"
          >
            Chưa đúng, thử lại.
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="space-y-3">
          {gameData.terms.map((item, i) => {
            const matched = matchedIds.includes(item.id);
            const selected = selectedTerm === item.id;
            return (
              <motion.button
                key={`term-${item.id}`}
                disabled={matched}
                onClick={() => setSelectedTerm(item.id)}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...transition, delay: i * 0.03 }}
                whileHover={!matched ? { scale: 1.01 } : {}}
                whileTap={!matched ? { scale: 0.99 } : {}}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  matched
                    ? "bg-gray-100 border-gray-200 text-gray-500"
                    : selected
                    ? "bg-blue-50 border-blue-400"
                    : "bg-white border-gray-200 hover:border-blue-300"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{item.term}</span>
                  {matched && <CheckCircle2 size={18} className="text-green-600" />}
                </div>
              </motion.button>
            );
          })}
        </div>

        <div className="space-y-3">
          {gameData.definitions.map((item, i) => {
            const matched = matchedIds.includes(item.id);
            return (
              <motion.button
                key={`def-${item.id}`}
                disabled={!selectedTerm || matched}
                onClick={() => handleDefinitionClick(item.id)}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...transition, delay: i * 0.03 }}
                whileHover={selectedTerm && !matched ? { scale: 1.01 } : {}}
                whileTap={selectedTerm && !matched ? { scale: 0.99 } : {}}
                className={`w-full text-left p-4 rounded-xl border transition ${
                  matched
                    ? "bg-green-50 border-green-300 text-gray-600"
                    : selectedTerm
                    ? "bg-white border-gray-200 hover:border-blue-300"
                    : "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {item.definition}
              </motion.button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ ...transition, delay: 0.1 }}
            className="mt-6 p-6 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white"
          >
            <div className="flex items-center gap-3">
              <Star size={30} />
              <div>
                <h3 className="font-bold text-xl">Hoàn thành game</h3>
                <p>Điểm cuối: {score}. Bấm chơi lại để nhận bộ ghép random mới.</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

function TrueFalseGame({ onBack }: { onBack: () => void }) {
  const [questions, setQuestions] = useState(getRandomTrueFalseSet);
  const [current, setCurrent] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);

  const currentQuestion = questions[current];
  const progress = Math.round(((current + (selectedAnswer !== null ? 1 : 0)) / questions.length) * 100);

  const handleAnswer = (value: boolean) => {
    if (selectedAnswer !== null || completed) {
      return;
    }
    setSelectedAnswer(value);
    if (value === currentQuestion.correct) {
      setScore((prev) => prev + 10);
    }
  };

  const handleNext = () => {
    if (selectedAnswer === null) {
      return;
    }
    if (current === questions.length - 1) {
      setCompleted(true);
      return;
    }
    setCurrent((prev) => prev + 1);
    setSelectedAnswer(null);
  };

  const handleRestart = () => {
    setQuestions(getRandomTrueFalseSet());
    setCurrent(0);
    setSelectedAnswer(null);
    setScore(0);
    setCompleted(false);
  };

  const isCorrect = selectedAnswer === currentQuestion.correct;

  return (
    <motion.section
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition}
    >
      <div className="flex items-center justify-between gap-3 mb-6">
        <motion.button
          onClick={onBack}
          className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          ← Quay lại
        </motion.button>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-100 text-emerald-800 rounded-lg font-semibold">Điểm: {score}</div>
          <motion.button
            onClick={handleRestart}
            className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center justify-center"
            aria-label="Chơi lại"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={18} />
          </motion.button>
        </div>
      </div>

      <div className="mb-5">
        <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
          <span>
            Câu {Math.min(current + 1, questions.length)}/{questions.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-2 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={transition}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!completed ? (
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={transition}
          >
            <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-100 mb-5">
              <h2 className="text-2xl font-bold text-gray-900">{currentQuestion.question}</h2>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <motion.button
                onClick={() => handleAnswer(true)}
                disabled={selectedAnswer !== null}
                className="p-4 rounded-xl border-2 border-green-300 hover:bg-green-50 disabled:opacity-60"
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                <CheckCircle2 className="mx-auto mb-2 text-green-600" />
                <span className="font-semibold">Đúng</span>
              </motion.button>
              <motion.button
                onClick={() => handleAnswer(false)}
                disabled={selectedAnswer !== null}
                className="p-4 rounded-xl border-2 border-red-300 hover:bg-red-50 disabled:opacity-60"
                whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
              >
                <XCircle className="mx-auto mb-2 text-red-600" />
                <span className="font-semibold">Sai</span>
              </motion.button>
            </div>

            {selectedAnswer !== null && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl border ${isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
              >
                <p className={`font-semibold ${isCorrect ? "text-green-700" : "text-red-700"}`}>
                  {isCorrect ? "Chính xác." : "Chưa đúng."}
                </p>
                <p className={`mt-1 ${isCorrect ? "text-green-700" : "text-red-700"}`}>{currentQuestion.explanation}</p>
                <motion.button
                  onClick={handleNext}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {current === questions.length - 1 ? "Xem kết quả" : "Câu tiếp theo"}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="completed"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...transition, delay: 0.05 }}
            className="p-8 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-center"
          >
            <Star className="mx-auto mb-3" size={44} />
            <h3 className="text-3xl font-bold">Hoàn thành</h3>
            <p className="mt-3 text-lg">
              Điểm của bạn: <span className="font-bold">{score}</span> / {questions.length * 10}
            </p>
            <motion.button
              onClick={handleRestart}
              className="mt-5 px-5 py-2 rounded-lg bg-white text-emerald-700 font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              Chơi lại với bộ câu random mới
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
