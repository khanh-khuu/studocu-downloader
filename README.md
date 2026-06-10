# Studocu Downloader - Tiện ích Tải Tài Liệu Studocu Miễn Phí

Đây là một Extension (Tiện ích mở rộng) dành cho trình duyệt Chrome (hoặc các trình duyệt nhân Chromium như Edge, Brave, Opera, Cốc Cốc) giúp bạn xem và tải tài liệu trên trang **Studocu** và **Studeersnel** hoàn toàn miễn phí mà **không cần tài khoản Premium hay đăng nhập**.

## ✨ Tính Năng Nổi Bật

1. **Bypass Blur (Xóa mờ):** Tự động xóa lớp mờ trên các trang tài liệu bị khóa Premium.
2. **Loại bỏ Banner & Quảng cáo:** Hơi các bảng yêu cầu nâng cấp Premium, quảng cáo gây nhiễu, và thanh AI Toolbar che khuất tài liệu.
3. **Tải tài liệu PDF chất lượng cao:** 
   - Tự động cuộn qua các trang để ép tải (force lazy load).
   - Tự động lấy trực tiếp URL ảnh trang tài liệu gốc (sử dụng đánh số hệ Hex trên CDN gốc).
   - Nhúng ảnh dưới dạng **Data URI** để đảm bảo tài liệu không bị lỗi mất ảnh hoặc trang trắng khi lưu.
   - Hỗ trợ giao diện Xem trước & nút **"In / Lưu dưới dạng PDF"** nhanh chóng.

## 🛠️ Hướng Dẫn Cài Đặt (Developer Mode)

Vì đây là tiện ích phát triển cá nhân (không đưa lên Chrome Web Store), bạn cần cài đặt thủ công như sau:

1. Mở trình duyệt Chrome (hoặc Edge/Brave/Cốc Cốc).
2. Truy cập vào quản lý tiện ích bằng cách nhập đường dẫn sau vào thanh địa chỉ:
   ```text
   chrome://extensions/
   ```
3. Bật **"Chế độ nhà phát triển"** (Developer mode) ở góc phía trên bên phải màn hình.
4. Click vào nút **"Tải tiện ích đã giải nén"** (Load unpacked) ở góc phía trên bên trái màn hình.
5. Chọn thư mục chứa dự án này:
   ```text
   /Users/nguyencuong/dev/studocu-downloader
   ```
6. Tiện ích sẽ xuất hiện trong danh sách và sẵn sàng hoạt động!

## 📖 Hướng Dẫn Sử Dụng

1. Truy cập vào bất kỳ tài liệu nào trên trang **Studocu.com** hoặc **Studocu.vn**.
2. Bạn sẽ thấy:
   - Các trang tài liệu bị mờ đã được hiển thị rõ nét.
   - Các banner Premium và quảng cáo tự động biến mất.
   - Một nút màu xanh dương **"Tải xuống"** xuất hiện ở thanh công cụ phía trên tài liệu.
3. Nhấp vào nút **"Tải xuống"**:
   - Trình duyệt sẽ hiển thị thanh tiến trình tải: **"Đang chụp trang X / N"** và **"Đang nhúng ảnh X / N"**.
   - Hãy giữ tab này được hiển thị (active focus) để trình duyệt không đóng băng tiến trình lazy-load.
4. Sau khi tiến trình hoàn tất, một màn hình xem trước (preview) tài liệu sẽ hiển thị cùng nút **"In / Lưu dưới dạng PDF"**.
5. Nhấp vào nút **"In / Lưu dưới dạng PDF"** (hoặc nhấn tổ hợp phím `Ctrl + P` / `Cmd + P`):
   - Tại ô **Máy in đích (Destination)**: Chọn **Lưu dưới dạng PDF (Save as PDF)**.
   - Tại ô **Lề (Margins)**: Chọn **Không (None)**.
   - Tại mục **Tùy chọn khác (More settings)**: Tích chọn **Đồ họa nền (Background graphics)**.
   - Nhấp **Lưu (Save)** để tải file về máy.

## ⚙️ Cơ Chế Kỹ Thuật

- **Next.js Hydration Patching:** Studocu sử dụng React/Next.js với thuộc tính `hasBlurredPages` trong `__NEXT_DATA__`. Extension đã can thiệp thay đổi thuộc tính này và React Fiber state để chặn hoàn toàn việc React tự động kích hoạt lại lớp mờ khi cuộn trang hoặc cập nhật giao diện.
- **Hex Page numbering Bypass:** Thay vì tải các ảnh Thumbnail độ phân giải thấp đã làm mờ, extension tự động phân tích chữ ký `signedQueryParams.png` từ Next.js state và sinh ra URL ảnh chất lượng cao gốc từ CDN của Studocu (`https://doc-assets.studocu.com/...`) dựa trên số trang ở định dạng Hex (Ví dụ: Trang 10 -> `bga.png`).
- **Data URI Embedding:** Việc tải ảnh qua CDN có thể gặp lỗi CORS hoặc hết hạn chữ ký lúc xuất file, nên extension tải song song toàn bộ ảnh và convert sang định dạng Base64/Data URI trực tiếp trong tài liệu trước khi gọi hộp thoại in.
