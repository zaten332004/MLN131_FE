import React from "react";
import { motion } from "motion/react";
import { Navigation } from "../components/Navigation";
import { Footer } from "../components/Footer";
import { Logo } from "../components/Logo";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { BookOpen, Layers, Handshake, Landmark, CheckCircle2, Users } from "lucide-react";

const scrollViewport = { once: true, amount: 0.15, margin: "0px 0px -80px 0px" };
const easeOutQuad = [0.25, 0.46, 0.45, 0.94] as const;
const scrollVariants = {
  "fade-up": {
    initial: { opacity: 0, y: 28 },
    inView: { opacity: 1, y: 0 },
    transition: { duration: 0.45, ease: easeOutQuad },
  },
  "fade-left": {
    initial: { opacity: 0, x: -24 },
    inView: { opacity: 1, x: 0 },
    transition: { duration: 0.45, ease: easeOutQuad },
  },
  "zoom-in": {
    initial: { opacity: 0, scale: 0.96 },
    inView: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: easeOutQuad },
  },
};

const cardMotionClass =
  "transition-all duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-md";

const classCards = [
  {
    id: "giai-cap-cong-nhan",
    title: "Giai cấp công nhân",
    summary:
      "Lực lượng lãnh đạo cách mạng thông qua Đảng, đại diện cho phương thức sản xuất tiên tiến, giữ vai trò nòng cốt trong công nghiệp hóa, hiện đại hóa.",
    points: [
      "Đại diện lực lượng sản xuất hiện đại.",
      "Có tổ chức, kỷ luật và tinh thần đoàn kết cao.",
      "Giữ vai trò tiên phong trong chuyển đổi số và hội nhập.",
    ],
    image: "/images/giai-cap-cong-nhanh.jpg",
    sourceLabel: "Ảnh trong thư mục public",
    sourceUrl: "/images/giai-cap-cong-nhanh.jpg",
  },
  {
    id: "giai-cap-nong-dan",
    title: "Giai cấp nông dân",
    summary:
      "Lực lượng đông đảo, đồng minh chiến lược của giai cấp công nhân; giữ vai trò trọng yếu trong phát triển nông nghiệp, nông thôn và an ninh lương thực.",
    points: [
      "Chủ thể quan trọng trong xây dựng nông thôn mới.",
      "Gắn với mục tiêu công nghiệp hóa nông nghiệp.",
      "Góp phần gìn giữ bản sắc văn hóa và môi trường sinh thái.",
    ],
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Rizi%C3%A8re_vietnam.jpg/500px-Rizi%C3%A8re_vietnam.jpg",
    sourceLabel: "Wikimedia Commons - Rizière Vietnam",
    sourceUrl: "https://commons.wikimedia.org/wiki/File:Rizi%C3%A8re_vietnam.jpg",
  },
  {
    id: "doi-ngu-tri-thuc",
    title: "Đội ngũ trí thức",
    summary:
      "Lực lượng lao động sáng tạo đặc biệt quan trọng trong nền kinh tế tri thức, là cầu nối giữa lý luận và thực tiễn, góp phần nâng tầm trí tuệ quốc gia.",
    points: [
      "Thúc đẩy khoa học - công nghệ và đổi mới sáng tạo.",
      "Đóng vai trò then chốt trong giáo dục, nghiên cứu.",
      "Tạo nền tảng tri thức cho phát triển bền vững.",
    ],
    image: "/images/doi-ngu-tri-thuc.jpg",
    sourceLabel: "Báo QĐND - Đội ngũ trí thức",
    sourceUrl:
      "https://media.qdnd.vn/long-form/doi-ngu-tri-thuc-nhung-nguoi-lam-hung-thinh-dat-nuoc-bai-1-tri-thuc-la-von-lieng-quy-bau-cua-dan-toc-57199",
  },
  {
    id: "doi-ngu-doanh-nhan",
    title: "Đội ngũ doanh nhân",
    summary:
      "Lực lượng phát triển nhanh về số lượng và chất lượng; đóng góp trực tiếp vào tăng trưởng GDP, tạo việc làm, thúc đẩy đổi mới sáng tạo và trách nhiệm xã hội.",
    points: [
      "Liên kết sản xuất - thị trường - công nghệ.",
      "Đóng góp vào an sinh xã hội và giảm nghèo.",
      "Là thành phần quan trọng trong cơ cấu xã hội hiện nay.",
    ],
    image: "/images/doi-ngu-doanh-nhan2.jpg",
    sourceLabel: "Tạp chí ngày mới online",
    sourceUrl: "https://ngaymoionline.com.vn/phat-trien-doi-ngu-doanh-nhan-dap-ung-yeu-cau-phat-trien-cua-dat-nuoc-55811.html",
  },
];

export function KnowledgePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-6">
          <aside className="hidden lg:block">
            <motion.div
              className="sticky top-20 space-y-4"
              initial={scrollVariants["fade-left"].initial}
              animate={scrollVariants["fade-left"].inView}
              transition={scrollVariants["fade-left"].transition}
            >
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h2 className="font-bold text-gray-900 mb-3">Phụ lục</h2>
                <nav className="space-y-2 text-sm">
                  {[
                    { href: "#tong-quan", label: "Tổng quan chương" },
                    { href: "#phan-1", label: "I. Cơ cấu xã hội - giai cấp" },
                    { href: "#cac-giai-cap", label: "Phân tích từng giai cấp" },
                    { href: "#phan-2", label: "II. Liên minh giai cấp, tầng lớp" },
                    { href: "#phan-3", label: "III. Thực tiễn Việt Nam" },
                    { href: "#ket-luan", label: "Kết luận chương" },
                  ].map((item) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      className="block text-blue-700 hover:underline"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </nav>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Thuật ngữ nhanh</h3>
                <ul className="text-xs text-gray-600 space-y-2">
                  <li>
                    <strong>Cơ cấu xã hội - giai cấp:</strong> Hệ thống các giai cấp, tầng lớp và quan hệ xã hội giữa chúng.
                  </li>
                  <li>
                    <strong>Liên minh giai cấp:</strong> Liên kết hợp tác công nhân - nông dân - trí thức.
                  </li>
                  <li>
                    <strong>Nội dung liên minh:</strong> Kinh tế, chính trị, văn hóa - xã hội.
                  </li>
                </ul>
              </div>

            </motion.div>
          </aside>

          <div className="space-y-6">
            <motion.section
              id="tong-quan"
              className={`scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 ${cardMotionClass}`}
              initial={scrollVariants["fade-up"].initial}
              whileInView={scrollVariants["fade-up"].inView}
              viewport={scrollViewport}
              transition={scrollVariants["fade-up"].transition}
            >
              <div className="grid xl:grid-cols-2 gap-6 items-center">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-full text-sm">
                    <Logo size={20} />
                    <span>Nội dung chương học</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-4 leading-tight">
                    Cơ cấu xã hội - giai cấp và liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên chủ nghĩa xã hội
                  </h1>
                  <p className="text-gray-600 mt-4 leading-relaxed">
                    Chương học tập trung làm rõ vị trí của cơ cấu xã hội - giai cấp, quy luật biến đổi của cơ cấu này, tầm
                    quan trọng của liên minh giai cấp và phương hướng vận dụng trong thực tiễn Việt Nam hiện nay.
                  </p>
                </div>

                <div>
                  <ImageWithFallback
                    src="https://image.luatvietnam.vn/uploaded/665twebp/images/original/2023/06/09/giai-cap-la-gi_0906142048.jpeg"
                    alt="Cộng đồng xã hội đa dạng"
                    className="w-full h-56 md:h-64 object-cover rounded-xl"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Nguồn:{" "}
                    <a
                      className="text-blue-600 hover:underline"
                      href="https://luatvietnam.vn/linh-vuc-khac/giai-cap-la-gi-883-94346-article.html"
                      target="_blank"
                      rel="noreferrer"
                    >
                      LuatVietnam - Giai cấp là gì?
                    </a>
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section
              id="phan-1"
              className={`scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 ${cardMotionClass}`}
              initial={scrollVariants["fade-up"].initial}
              whileInView={scrollVariants["fade-up"].inView}
              viewport={scrollViewport}
              transition={scrollVariants["fade-up"].transition}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <Layers size={22} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">I. Cơ cấu xã hội - giai cấp trong thời kỳ quá độ</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5 items-start">
                <article className="p-5 rounded-xl bg-blue-50 border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-2">1. Khái niệm và vị trí</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>
                      Cơ cấu xã hội - giai cấp là hệ thống các giai cấp, tầng lớp xã hội tồn tại khách quan trong một chế độ
                      xã hội nhất định.
                    </li>
                    <li>
                      Được xác định qua 3 quan hệ cơ bản: sở hữu tư liệu sản xuất, vai trò trong tổ chức quản lý sản xuất và
                      địa vị chính trị - xã hội.
                    </li>
                    <li>
                      Giữ vị trí trung tâm trong các loại hình cơ cấu xã hội vì gắn trực tiếp với nền tảng kinh tế - chính trị
                      của xã hội.
                    </li>
                  </ul>
                </article>

                <article className="p-4 rounded-xl bg-amber-50 border border-amber-100 self-start">
                  <ImageWithFallback
                    src="https://image.luatvietnam.vn/uploaded/665twebp/images/original/2023/06/09/giai-cap-la-gi_0906142048.jpeg"
                    alt="Tranh minh họa phân tầng giai cấp xã hội"
                    className="w-full h-52 object-cover object-center rounded-lg"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Nguồn:{" "}
                    <a
                      className="text-blue-600 hover:underline"
                      href="https://luatvietnam.vn/linh-vuc-khac/giai-cap-la-gi-883-94346-article.html"
                      target="_blank"
                      rel="noreferrer"
                    >
                      LuatVietnam - Giai cấp là gì?
                    </a>
                  </p>
                </article>
              </div>

              <article className="p-5 rounded-xl bg-cyan-50 border border-cyan-100 mt-5">
                  <h3 className="font-bold text-gray-900 mb-2">2. Biến đổi có tính quy luật</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>Biến đổi gắn liền với chuyển dịch cơ cấu kinh tế trong thời kỳ quá độ.</li>
                    <li>
                      Xuất hiện các tầng lớp xã hội mới do phát triển kinh tế nhiều thành phần và mô hình lao động mới.
                    </li>
                    <li>
                      Quan hệ giữa các giai cấp vừa đấu tranh vừa liên minh, từng bước giảm bất bình đẳng xã hội và tăng hợp
                      tác trên nền lợi ích chung.
                    </li>
                  </ul>
              </article>
            </motion.section>

            <motion.section
              id="cac-giai-cap"
              className={`scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 ${cardMotionClass}`}
              initial={scrollVariants["fade-up"].initial}
              whileInView={scrollVariants["fade-up"].inView}
              viewport={scrollViewport}
              transition={scrollVariants["fade-up"].transition}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Users size={22} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Phân tích từng giai cấp, tầng lớp tiêu biểu</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                {classCards.map((item) => (
                  <motion.article
                    key={item.id}
                    id={item.id}
                    className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${cardMotionClass}`}
                    initial={scrollVariants["zoom-in"].initial}
                    whileInView={scrollVariants["zoom-in"].inView}
                    viewport={scrollViewport}
                    transition={{ ...scrollVariants["zoom-in"].transition, delay: 0.05 }}
                  >
                    <ImageWithFallback src={item.image} alt={item.title} className="w-full h-44 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                      <p className="text-gray-600 mt-2 text-sm leading-relaxed">{item.summary}</p>
                      <ul className="mt-3 space-y-1.5 text-sm text-gray-700">
                        {item.points.map((point) => (
                          <li key={point} className="flex items-start gap-2">
                            <CheckCircle2 className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-gray-500 mt-3">
                        Nguồn:{" "}
                        <a className="text-blue-600 hover:underline" href={item.sourceUrl} target="_blank" rel="noreferrer">
                          {item.sourceLabel}
                        </a>
                      </p>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.section>

            <motion.section
              id="phan-2"
              className={`scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 ${cardMotionClass}`}
              initial={scrollVariants["fade-up"].initial}
              whileInView={scrollVariants["fade-up"].inView}
              viewport={scrollViewport}
              transition={scrollVariants["fade-up"].transition}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  <Handshake size={22} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">II. Liên minh giai cấp, tầng lớp</h2>
              </div>

              <div className="space-y-4">
                <article className="p-5 rounded-xl bg-green-50 border border-green-100">
                  <h3 className="font-bold text-gray-900 mb-2">Dưới góc độ chính trị</h3>
                  <p className="text-gray-700">
                    Trong xã hội có giai cấp, liên minh công nhân - nông dân - trí thức là nguyên tắc chiến lược để tạo sức
                    mạnh tổng hợp bảo đảm thắng lợi của cách mạng và giữ vững ổn định chính trị trong quá trình xây dựng xã hội
                    mới.
                  </p>
                </article>

                <article className="p-5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <h3 className="font-bold text-gray-900 mb-2">Dưới góc độ kinh tế</h3>
                  <p className="text-gray-700">
                    Liên minh xuất phát từ yêu cầu khách quan của công nghiệp hóa, hiện đại hóa: liên kết chặt chẽ giữa công
                    nghiệp - nông nghiệp - dịch vụ - khoa học công nghệ, đồng thời hài hòa lợi ích kinh tế của các chủ thể.
                  </p>
                </article>

                <article className="p-5 rounded-xl bg-lime-50 border border-lime-100">
                  <h3 className="font-bold text-gray-900 mb-2">Ý nghĩa tổng quát</h3>
                  <p className="text-gray-700">
                    Liên minh giai cấp là hình thức tổ chức lực lượng xã hội ở trình độ cao, kết hợp hợp tác và hỗ trợ lẫn nhau
                    để tạo động lực phát triển bền vững theo định hướng xã hội chủ nghĩa.
                  </p>
                </article>
              </div>
            </motion.section>

            <motion.section
              id="phan-3"
              className={`scroll-mt-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 ${cardMotionClass}`}
              initial={scrollVariants["fade-up"].initial}
              whileInView={scrollVariants["fade-up"].inView}
              viewport={scrollViewport}
              transition={scrollVariants["fade-up"].transition}
            >
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Landmark size={22} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  III. Cơ cấu xã hội - giai cấp và liên minh ở Việt Nam hiện nay
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <article className="p-5 rounded-xl bg-purple-50 border border-purple-100">
                  <h3 className="font-bold text-gray-900 mb-2">1. Đặc điểm cơ cấu xã hội - giai cấp</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>Công nhân: lực lượng lãnh đạo, tiên phong trong sản xuất hiện đại.</li>
                    <li>Nông dân: lực lượng nền tảng trong phát triển nông nghiệp, nông thôn.</li>
                    <li>Trí thức: nguồn lực sáng tạo then chốt trong kinh tế tri thức.</li>
                    <li>Doanh nhân: động lực thúc đẩy tăng trưởng, đổi mới sáng tạo và tạo việc làm.</li>
                  </ul>
                </article>

                <article className="p-5 rounded-xl bg-fuchsia-50 border border-fuchsia-100">
                  <h3 className="font-bold text-gray-900 mb-2">2. Nội dung liên minh ở Việt Nam</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>Kinh tế: phát triển nhanh, bền vững, hài hòa lợi ích các lực lượng xã hội.</li>
                    <li>Chính trị: giữ vững độc lập dân tộc, ổn định chế độ, phát huy dân chủ.</li>
                    <li>Văn hóa - xã hội: phát triển con người toàn diện, giảm nghèo, nâng cao dân trí.</li>
                  </ul>
                </article>
              </div>

              <article className="p-5 rounded-xl bg-indigo-50 border border-indigo-100">
                <h3 className="font-bold text-gray-900 mb-3">3. Phương hướng cơ bản</h3>
                <div className="grid md:grid-cols-2 gap-3 text-gray-700">
                  {[
                    "Đẩy mạnh công nghiệp hóa, hiện đại hóa gắn với phát triển kinh tế tri thức.",
                    "Xây dựng hệ thống chính sách xã hội đồng bộ về giáo dục, lao động, việc làm, an sinh.",
                    "Tăng cường đồng thuận xã hội và tinh thần đại đoàn kết toàn dân tộc.",
                    "Hoàn thiện thể chế kinh tế thị trường định hướng XHCN và đẩy mạnh khoa học - công nghệ.",
                    "Đổi mới hoạt động của Đảng, Nhà nước, Mặt trận Tổ quốc nhằm củng cố khối liên minh.",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2">
                      <CheckCircle2 className="text-indigo-600 mt-0.5 flex-shrink-0" size={17} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            </motion.section>

            <motion.section
              id="ket-luan"
              className={`scroll-mt-24 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl text-white p-6 md:p-8 ${cardMotionClass}`}
              initial={scrollVariants["fade-up"].initial}
              whileInView={scrollVariants["fade-up"].inView}
              viewport={scrollViewport}
              transition={scrollVariants["fade-up"].transition}
            >
              <div className="flex items-start gap-3">
                <BookOpen className="mt-1" size={24} />
                <div>
                  <h2 className="text-2xl font-bold">Kết luận chương</h2>
                  <p className="mt-3 text-blue-100">
                    Cơ cấu xã hội - giai cấp và liên minh giai cấp, tầng lớp có ý nghĩa chiến lược đối với sự nghiệp xây dựng
                    chủ nghĩa xã hội ở Việt Nam. Nhận thức đúng và vận dụng sáng tạo các quy luật khách quan sẽ góp phần củng
                    cố khối đại đoàn kết toàn dân tộc, thực hiện mục tiêu phát triển đất nước bền vững.
                  </p>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
