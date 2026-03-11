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

const FAQS: FaqEntry[] = [
  {
    keys: ["khai niem co cau xa hoi", "co cau xa hoi la gi"],
    answer:
      "Theo quan điểm của chủ nghĩa Mác – Lênin, cơ cấu xã hội là tổng thể các cộng đồng người (giai cấp, tầng lớp, nhóm xã hội) cùng với toàn bộ các mối quan hệ xã hội giữa những cộng đồng đó trong một hình thái kinh tế – xã hội nhất định. Cơ cấu xã hội phản ánh mối quan hệ biện chứng giữa cơ sở hạ tầng (quan hệ sản xuất) và kiến trúc thượng tầng (chính trị, pháp luật, ý thức hệ, văn hoá).",
  },
  {
    keys: ["khai niem co cau xa hoi - giai cap", "co cau xa hoi giai cap la gi"],
    answer:
      "Cơ cấu xã hội – giai cấp là hệ thống các giai cấp và tầng lớp xã hội tồn tại khách quan trong một chế độ xã hội nhất định. Nó được xác định thông qua các quan hệ về sở hữu tư liệu sản xuất, vai trò trong tổ chức/quản lý quá trình sản xuất và địa vị chính trị – xã hội.",
  },
  {
    keys: ["quan he so huu tu lieu san xuat", "so huu tu lieu san xuat"],
    answer:
      "Quan hệ sở hữu tư liệu sản xuất (công hữu hay tư hữu, mức độ chiếm hữu) là một quan hệ cơ bản để xác định cơ cấu xã hội – giai cấp, vì nó quyết định lợi ích kinh tế và vị trí của các cộng đồng người trong hệ thống sản xuất.",
  },
  {
    keys: ["vai tro to chuc va quan ly", "to chuc va quan ly qua trinh san xuat"],
    answer:
      "Vai trò trong tổ chức và quản lý quá trình sản xuất (lao động trực tiếp/gián tiếp; quản lý/bị quản lý) là một quan hệ cơ bản để nhận diện vị trí của các giai cấp, tầng lớp trong cơ cấu xã hội – giai cấp.",
  },
  {
    keys: ["dia vi chinh tri - xa hoi", "dia vi chinh tri xa hoi"],
    answer:
      "Địa vị chính trị – xã hội (lãnh đạo hay bị lãnh đạo; thống trị hay bị thống trị) phản ánh quyền lực và vị thế của các giai cấp/tầng lớp trong đời sống xã hội, gắn với nhà nước và các thiết chế chính trị.",
  },
  {
    keys: ["giai cap la gi"],
    answer:
      "Giai cấp là những tập đoàn người có địa vị kinh tế – xã hội tương đồng trong một hệ thống sản xuất nhất định; giữa họ có thể tồn tại quan hệ đối kháng hoặc không đối kháng. Trong thời kỳ quá độ ở Việt Nam, điển hình có giai cấp công nhân và giai cấp nông dân.",
  },
  {
    keys: ["tang lop la gi"],
    answer:
      "Tầng lớp là sự phân hoá bên trong các giai cấp hoặc nằm ở vị trí trung gian giữa các giai cấp, có đặc điểm kinh tế – xã hội riêng biệt. Ví dụ: tầng lớp trí thức, tầng lớp doanh nhân.",
  },
  {
    keys: ["nhom xa hoi la gi"],
    answer:
      "Nhóm xã hội là những cộng đồng người nhỏ hơn, có tính ổn định tương đối hoặc tạm thời, thường được xác định theo nghề nghiệp, độ tuổi, giới tính, tôn giáo… Ví dụ: thanh niên, phụ nữ, người cao tuổi, các nhóm tôn giáo.",
  },
  {
    keys: ["vi tri cua co cau xa hoi - giai cap", "vai tro cua co cau xa hoi - giai cap"],
    answer:
      "Cơ cấu xã hội – giai cấp giữ vai trò trung tâm và có ý nghĩa quyết định trong hệ thống các loại hình cơ cấu xã hội. Vì nó hình thành trực tiếp từ quan hệ sản xuất (nền tảng đời sống xã hội) và gắn chặt với các vấn đề về đảng phái, nhà nước, quyền sở hữu tư liệu sản xuất, tổ chức lao động, phân phối thu nhập và phân hoá giàu nghèo.",
  },
  {
    keys: ["bien doi co tinh quy luat", "quy luat bien doi cua co cau xa hoi - giai cap"],
    answer:
      "Trong thời kỳ quá độ, cơ cấu xã hội – giai cấp biến đổi theo các quy luật cơ bản: (1) gắn liền và bị quy định bởi cơ cấu kinh tế; (2) ngày càng phức tạp, đa dạng, xuất hiện tầng lớp xã hội mới do kinh tế nhiều thành phần và ngành nghề mới; (3) biến đổi trong mối quan hệ vừa đấu tranh vừa liên minh, từng bước xoá bỏ bất bình đẳng xã hội và làm các lực lượng xích lại gần nhau.",
  },
  {
    keys: ["lien minh giai cap, tang lop la gi", "khai niem lien minh giai cap tang lop"],
    answer:
      "Liên minh giai cấp, tầng lớp trong thời kỳ quá độ lên CNXH là sự liên kết, hợp tác và hỗ trợ lẫn nhau giữa các giai cấp, tầng lớp nhằm thực hiện lợi ích chính đáng của các chủ thể trong khối liên minh, đồng thời tạo động lực để thực hiện thắng lợi mục tiêu xây dựng CNXH. Đây là hình thức tổ chức lực lượng cách mạng cao của giai cấp công nhân.",
  },
  {
    keys: ["tam quan trong cua lien minh", "vi sao can lien minh cong nong tri thuc"],
    answer:
      "Tầm quan trọng của liên minh thể hiện ở: (1) Chính trị: tập hợp lực lượng, tạo nền tảng xã hội vững chắc cho chế độ, bảo đảm ổn định chính trị; (2) Kinh tế: gắn kết công nghiệp – nông nghiệp – dịch vụ/khoa học, xây dựng nền tảng vật chất – kỹ thuật cho CNXH, hài hoà lợi ích các lực lượng lao động; (3) Văn hoá – xã hội: gắn tăng trưởng với tiến bộ và công bằng xã hội, nâng cao chất lượng nguồn nhân lực và an sinh xã hội.",
  },
  {
    keys: ["dac diem co cau xa hoi - giai cap o viet nam", "o viet nam hien nay"],
    answer:
      "Ở Việt Nam, cơ cấu xã hội – giai cấp vừa tuân theo quy luật phổ biến của thời kỳ quá độ, vừa mang tính đặc thù của một quốc gia nông nghiệp lạc hậu, từng trải qua chiến tranh và xuất phát điểm thuộc địa nửa phong kiến. Từ đổi mới (Đại hội VI – 1986) đến nay, kinh tế nhiều thành phần làm cơ cấu xã hội đa dạng và phân hoá sâu sắc hơn nhưng vẫn giữ định hướng xã hội chủ nghĩa.",
  },
  {
    keys: ["giai cap cong nhan", "vai tro giai cap cong nhan"],
    answer:
      "Giai cấp công nhân là giai cấp lãnh đạo cách mạng thông qua Đảng Cộng sản Việt Nam; đại diện cho lực lượng sản xuất tiên tiến; ngày càng được trí thức hoá; giữ vai trò tiên phong trong công nghiệp hoá, hiện đại hoá và hội nhập; là nòng cốt trong liên minh công nhân – nông dân – trí thức.",
  },
  {
    keys: ["giai cap nong dan", "vai tro giai cap nong dan"],
    answer:
      "Giai cấp nông dân có vị trí chiến lược trong công nghiệp hoá, hiện đại hoá nông nghiệp – nông thôn; góp phần bảo đảm an ninh lương thực, bảo vệ môi trường và giữ gìn bản sắc văn hoá; là chủ thể quan trọng trong xây dựng nông thôn mới.",
  },
  {
    keys: ["doi ngu tri thuc", "vai tro tri thuc"],
    answer:
      "Đội ngũ trí thức là lực lượng lao động sáng tạo đặc biệt quan trọng trong bối cảnh CMCN 4.0 và kinh tế tri thức; là cầu nối giữa lý luận và thực tiễn; có vai trò quan trọng trong khối liên minh giai cấp, tầng lớp.",
  },
  {
    keys: ["doi ngu doanh nhan", "vai tro doanh nhan"],
    answer:
      "Đội ngũ doanh nhân phát triển nhanh về số lượng và chất lượng; đóng góp quan trọng vào tăng trưởng và tạo việc làm; thúc đẩy đổi mới sáng tạo; được định hướng xây dựng thành lực lượng vững mạnh, có trách nhiệm xã hội.",
  },
  {
    keys: ["noi dung cua lien minh", "noi dung lien minh kinh te chinh tri van hoa xa hoi"],
    answer:
      "Nội dung liên minh giai cấp, tầng lớp gồm: (1) Kinh tế: thoả mãn lợi ích chính đáng, phát huy tiềm lực từng lực lượng, xây dựng cơ cấu kinh tế hợp lý và nền tảng vật chất – kỹ thuật cho CNXH; (2) Chính trị: bảo vệ chế độ, giữ vững độc lập dân tộc và định hướng XHCN, phát huy dân chủ, xây dựng Nhà nước pháp quyền; (3) Văn hoá – xã hội: xây dựng con người phát triển toàn diện, gắn tăng trưởng với tiến bộ và công bằng xã hội, nâng cao chất lượng nguồn nhân lực và an sinh xã hội.",
  },
  {
    keys: ["phuong huong tang cuong lien minh", "giai phap tang cuong lien minh"],
    answer:
      "Phương hướng cơ bản để tăng cường liên minh: đẩy mạnh công nghiệp hoá, hiện đại hoá gắn với kinh tế tri thức; xây dựng hệ thống chính sách xã hội đồng bộ; tăng cường đồng thuận và đại đoàn kết; hoàn thiện thể chế kinh tế thị trường định hướng XHCN; đẩy mạnh khoa học – công nghệ và chuyển đổi số; đổi mới hoạt động của Đảng, Nhà nước, Mặt trận Tổ quốc để củng cố khối liên minh.",
  },
];

export function findFaqAnswer(text: string) {
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

