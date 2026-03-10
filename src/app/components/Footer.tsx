export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-600">
          <div>
            <h3 className="font-bold text-gray-800 mb-3">Nguồn hình ảnh</h3>
            <ul className="space-y-2">
              <li>• Unsplash.com - ảnh minh họa học tập và cộng đồng</li>
              <li>• Lucide Icons - bộ biểu tượng giao diện</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3">Tài liệu tham khảo</h3>
            <ul className="space-y-2">
              <li>• Giáo trình Chủ nghĩa xã hội khoa học</li>
              <li>• Tài liệu về cơ cấu xã hội - giai cấp ở Việt Nam</li>
              <li>• Các văn kiện về đại đoàn kết toàn dân tộc</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3">Thông tin</h3>
            <p>Nền tảng học tập Chương 5: Cơ cấu xã hội - giai cấp và liên minh giai cấp, tầng lớp.</p>
            <p className="mt-2">© 2026 Dự án giáo dục trực tuyến</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
