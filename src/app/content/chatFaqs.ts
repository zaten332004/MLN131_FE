function normalize(text: string) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\s+/g, " ")
    .trim();
}

type FaqEntry = { keys: string[]; answer: string };

// Short, deterministic FAQ answers used as UI fallback (server also has a richer FAQ matcher).
const FAQS: FaqEntry[] = [
  {
    keys: ["khai niem co cau xa hoi", "co cau xa hoi la gi"],
    answer:
      "Cơ cấu xã hội là tổng thể các cộng đồng người (giai cấp, tầng lớp, nhóm xã hội) cùng với toàn bộ các mối quan hệ xã hội giữa những cộng đồng đó trong một hình thái kinh tế – xã hội nhất định; phản ánh quan hệ giữa cơ sở hạ tầng và kiến trúc thượng tầng.",
  },
  {
    keys: ["khai niem co cau xa hoi - giai cap", "co cau xa hoi giai cap la gi"],
    answer:
      "Cơ cấu xã hội – giai cấp là hệ thống các giai cấp và tầng lớp xã hội tồn tại khách quan trong một chế độ xã hội nhất định, được xác định qua quan hệ sở hữu tư liệu sản xuất, vai trò tổ chức/quản lý sản xuất và địa vị chính trị – xã hội.",
  },
  {
    keys: ["vi tri cua co cau xa hoi - giai cap", "vai tro cua co cau xa hoi - giai cap"],
    answer:
      "Cơ cấu xã hội – giai cấp giữ vai trò trung tâm, chi phối nhiều cơ cấu xã hội khác vì nó hình thành trực tiếp từ quan hệ sản xuất và gắn với các vấn đề về nhà nước, quyền sở hữu, tổ chức lao động và phân phối thu nhập.",
  },
  {
    keys: ["bien doi co tinh quy luat", "quy luat bien doi"],
    answer:
      "Trong thời kỳ quá độ, cơ cấu xã hội – giai cấp biến đổi theo quy luật: gắn với cơ cấu kinh tế; đa dạng, phức tạp và xuất hiện tầng lớp mới; vừa đấu tranh vừa liên minh, từng bước xoá bất bình đẳng xã hội và làm các lực lượng xích lại gần nhau.",
  },
  {
    keys: ["lien minh giai cap, tang lop la gi", "khai niem lien minh"],
    answer:
      "Liên minh giai cấp, tầng lớp là sự liên kết – hợp tác – hỗ trợ giữa các giai cấp, tầng lớp nhằm thực hiện lợi ích chính đáng và tạo động lực thực hiện mục tiêu xây dựng CNXH; hạt nhân là liên minh công nhân – nông dân – trí thức do Đảng lãnh đạo.",
  },
  {
    keys: ["noi dung lien minh", "noi dung cua lien minh"],
    answer:
      "Nội dung liên minh gồm: (1) Kinh tế: hài hoà lợi ích, phát huy tiềm lực, xây dựng cơ sở vật chất – kỹ thuật; (2) Chính trị: bảo vệ chế độ, giữ vững độc lập và định hướng XHCN; (3) Văn hoá – xã hội: gắn tăng trưởng với tiến bộ, công bằng và an sinh.",
  },
  {
    keys: ["phuong huong tang cuong lien minh", "giai phap tang cuong"],
    answer:
      "Phương hướng tăng cường liên minh: đẩy mạnh CNH-HĐH gắn kinh tế tri thức; xây dựng chính sách xã hội đồng bộ; tăng đồng thuận và đại đoàn kết; hoàn thiện thể chế thị trường định hướng XHCN; đẩy mạnh KH-CN và chuyển đổi số; đổi mới hoạt động của các tổ chức trong hệ thống chính trị.",
  },
];

export function findFaqAnswerLocal(text: string) {
  const n = normalize(text);
  if (!n) return "";

  let bestAnswer = "";
  let bestLen = 0;

  for (const faq of FAQS) {
    for (const key of faq.keys) {
      const k = normalize(key);
      if (!k) continue;
      if (n.includes(k) && k.length > bestLen) {
        bestLen = k.length;
        bestAnswer = faq.answer;
      }
    }
  }

  return bestAnswer;
}

