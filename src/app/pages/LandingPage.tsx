import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowRight, BookOpen, Layers, Handshake, Landmark } from "lucide-react";
import { Logo } from "../components/Logo";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const scrollViewport = { once: true, amount: 0.2, margin: "0px 0px -60px 0px" };
const transition = { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const };

export function LandingPage() {
  const highlights = [
    {
      icon: Layers,
      title: "I. Cơ cấu xã hội - giai cấp",
      description:
        "Nắm khái niệm, vị trí và quy luật biến đổi của cơ cấu xã hội - giai cấp trong thời kỳ quá độ lên CNXH.",
    },
    {
      icon: Handshake,
      title: "II. Liên minh giai cấp, tầng lớp",
      description:
        "Hiểu liên minh công nhân - nông dân - trí thức dưới góc độ chính trị và kinh tế, vai trò trong cách mạng.",
    },
    {
      icon: Landmark,
      title: "III. Thực tiễn Việt Nam hiện nay",
      description:
        "Phân tích đặc điểm giai cấp ở Việt Nam, nội dung liên minh và phương hướng tăng cường khối đại đoàn kết.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-sky-50">
      <nav className="bg-white/90 backdrop-blur border-b border-blue-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <span className="font-bold text-gray-900">Học tập Chính trị</span>
          </div>
          <div className="flex items-center gap-3">
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to="/login" className="inline-block px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50">
                Đăng nhập
              </Link>
            </motion.span>
            <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
              <Link to="/register" className="inline-block px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                Đăng ký
              </Link>
            </motion.span>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={transition}
          >
            <motion.div
              className="inline-flex items-center gap-2 bg-white border border-blue-100 px-3 py-2 rounded-full text-sm text-blue-700"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <Logo size={20} />
              <span>Tóm tắt chương học</span>
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-5 leading-tight">
              Cơ cấu xã hội - giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội
            </h1>
            <p className="text-lg text-gray-600 mt-5 leading-relaxed">
              Trang này dành cho người chưa đăng nhập, giúp bạn xem nhanh nội dung chính của chương. Sau khi đăng nhập, bạn
              sẽ vào trang kiến thức chi tiết, trò chơi và trắc nghiệm ngẫu nhiên.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl transition-shadow"
                >
                  Bắt đầu học
                  <ArrowRight size={18} />
                </Link>
              </motion.span>
              <motion.span whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/login"
                  className="inline-block px-6 py-3 rounded-lg border border-gray-300 text-gray-700 hover:border-blue-400"
                >
                  Tôi đã có tài khoản
                </Link>
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...transition, delay: 0.15 }}
          >
            <motion.div
              className="rounded-2xl overflow-hidden"
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)" }}
              transition={{ duration: 0.25 }}
            >
              <ImageWithFallback
                src="https://cdn.thuvienphapluat.vn/phap-luat/2022-2/NTTX/291024/thoi-ky-qua-do.jpg"
                alt="Minh họa thời kỳ quá độ lên chủ nghĩa xã hội"
                className="w-full h-80 object-cover rounded-2xl"
              />
            </motion.div>
            <p className="text-xs text-gray-500 mt-2">
              Nguồn:{" "}
              <a
                className="text-blue-600 hover:underline"
                href="https://thuvienphapluat.vn"
                target="_blank"
                rel="noreferrer"
              >
                Thư Viện Pháp Luật
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item, i) => (
            <motion.article
              key={item.title}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={scrollViewport}
              transition={{ ...transition, delay: i * 0.1 }}
              whileHover={{ y: -6, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
            >
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <item.icon size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h2>
              <p className="text-gray-600">{item.description}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <motion.div
          className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl text-white p-8 md:p-10"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={scrollViewport}
          transition={transition}
          whileHover={{ scale: 1.01 }}
        >
          <div className="flex items-start gap-4">
            <BookOpen className="mt-1" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold">Kết luận chương</h2>
              <p className="mt-3 text-blue-100 max-w-3xl">
                Cơ cấu xã hội - giai cấp và liên minh giai cấp, tầng lớp là vấn đề chiến lược, quyết định hiệu quả của sự
                nghiệp xây dựng CNXH ở Việt Nam.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
