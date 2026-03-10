import React from "react";
import { motion } from "motion/react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Users, Handshake, TrendingUp, BookOpen } from "lucide-react";
import { Link } from "react-router";

const scrollViewport = { once: true, amount: 0.2, margin: "0px 0px -60px 0px" };
const fadeUp = {
  initial: { opacity: 0, y: 28 },
  inView: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
};

export function HomePage() {
  const mainTopics = [
    {
      title: "Khái niệm cơ cấu xã hội – giai cấp",
      description: "Tìm hiểu về cấu trúc xã hội và các giai cấp trong xã hội",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Các giai cấp trong xã hội",
      description: "Phân tích vai trò của giai cấp công nhân, nông dân, trí thức",
      icon: BookOpen,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Liên minh giai cấp",
      description: "Sự hợp tác giữa các giai cấp trong xã hội",
      icon: Handshake,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Vai trò trong thời kỳ quá độ",
      description: "Ý nghĩa của liên minh giai cấp trong xây dựng CNXH",
      icon: TrendingUp,
      color: "bg-amber-100 text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm mb-4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              Chương 5 - Học tập chính trị
            </motion.div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Cơ cấu xã hội – giai cấp và liên minh giai cấp
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Khám phá vai trò của các giai cấp và tầng lớp xã hội trong thời kỳ quá độ lên Chủ nghĩa xã hội. 
              Tìm hiểu về sự hợp tác và liên minh giữa giai cấp công nhân, nông dân và tầng lớp trí thức.
            </p>
            <div className="flex gap-4">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/knowledge"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Bắt đầu học
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  to="/games"
                  className="inline-block bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Chơi game
                </Link>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <motion.div
              className="rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{ scale: 1.02, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.2)" }}
              transition={{ duration: 0.25 }}
            >
              <ImageWithFallback
                src="https://images.unsplash.com/photo-1623412912058-4e4552dbc10d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwcGVvcGxlJTIwY29tbXVuaXR5JTIwc29jaWV0eXxlbnwxfHx8fDE3NzMwMjM2NDZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Cộng đồng xã hội đa dạng"
                className="w-full h-[400px] object-cover"
              />
            </motion.div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Nguồn: Unsplash.com - Hình ảnh cộng đồng xã hội
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
          initial={fadeUp.initial}
          whileInView={fadeUp.inView}
          viewport={scrollViewport}
          transition={fadeUp.transition}
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Giới thiệu chương học</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Cơ cấu xã hội",
                text: "Là sự phân chia xã hội thành các nhóm, tầng lớp khác nhau dựa trên vị trí kinh tế, chính trị và vai trò xã hội của họ.",
                bg: "bg-blue-50",
                iconBg: "bg-blue-500",
              },
              {
                icon: BookOpen,
                title: "Giai cấp",
                text: "Là những nhóm người lớn khác nhau về vị trí trong hệ thống sản xuất xã hội nhất định về lịch sử, về vai trò của họ trong tổ chức lao động xã hội.",
                bg: "bg-green-50",
                iconBg: "bg-green-500",
              },
              {
                icon: Handshake,
                title: "Tầng lớp xã hội",
                text: "Là các nhóm xã hội có vị trí, vai trò và lợi ích tương đối đồng nhất, được hình thành trong quá trình phát triển của xã hội.",
                bg: "bg-purple-50",
                iconBg: "bg-purple-500",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                className={`${item.bg} p-6 rounded-xl`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={scrollViewport}
                transition={{ ...fadeUp.transition, delay: i * 0.1 }}
                whileHover={{ y: -6, boxShadow: "0 12px 24px -8px rgba(0,0,0,0.12)" }}
              >
                <div className={`w-12 h-12 ${item.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                  <item.icon className="text-white" size={24} />
                </div>
                <h3 className="font-bold text-xl mb-3 text-gray-800">{item.title}</h3>
                <p className="text-gray-600">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Topics Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.h2
          className="text-3xl font-bold text-gray-900 mb-8 text-center"
          initial={fadeUp.initial}
          whileInView={fadeUp.inView}
          viewport={scrollViewport}
          transition={fadeUp.transition}
        >
          Các nội dung chính của chương
        </motion.h2>

        <div className="grid md:grid-cols-2 gap-6">
          {mainTopics.map((topic, index) => (
            <motion.div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 cursor-pointer border-2 border-transparent"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={scrollViewport}
              transition={{ ...fadeUp.transition, delay: index * 0.08 }}
              whileHover={{
                y: -8,
                boxShadow: "0 20px 40px -12px rgba(0,0,0,0.15)",
                borderColor: "rgba(59, 130, 246, 0.5)",
              }}
              whileTap={{ scale: 0.99 }}
            >
              <div className={`w-14 h-14 ${topic.color} rounded-lg flex items-center justify-center mb-4`}>
                <topic.icon size={28} />
              </div>
              <h3 className="font-bold text-xl mb-3 text-gray-800">{topic.title}</h3>
              <p className="text-gray-600">{topic.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={scrollViewport}
          transition={{ ...fadeUp.transition, delay: 0.2 }}
        >
          <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/knowledge"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors text-lg shadow-lg hover:shadow-xl"
            >
              <BookOpen size={24} />
              Khám phá nội dung chi tiết
            </Link>
          </motion.span>
        </motion.div>
      </section>

      <Footer />
    </div>
  );
}
