# FlexiFit - Ứng dụng Hướng dẫn & Quản lý Tập Gym Cá nhân (PWA)

**FlexiFit** là một ứng dụng web dạng Progressive Web App (PWA) giúp người dùng quản lý, hướng dẫn và tối ưu hóa quá trình tập luyện thể hình cá nhân theo lịch trình tuần chuyên sâu (Push/Pull/Legs). Ứng dụng hoạt động 100% offline tại thiết bị của bạn, bảo mật dữ liệu tuyệt đối bằng cách lưu trữ trực tiếp trên trình duyệt (`localStorage`) mà không cần tạo tài khoản.

---

## 🌟 Các Tính Năng Nổi Bật

### 1. Lịch Tập Luyện Tuần (Push/Pull/Legs Split)
- **Monday & Thursday (Push):** Tập trung các nhóm cơ đẩy (Ngực, Vai, Tay sau).
- **Tuesday & Friday (Pull):** Tập trung các nhóm cơ kéo (Lưng, Xô, Tay trước, Bụng).
- **Wednesday & Saturday (Legs):** Tập trung phần thân dưới (Đùi trước, Đùi sau, Mông, Bắp chuối).
- **Sunday (Rest Day):** Ngày nghỉ ngơi phục hồi, hiển thị lời khuyên phát triển cơ bắp và phục hồi.
- Theo dõi tiến độ tập luyện hàng ngày thông qua thanh phần trăm (%) hoàn thành sinh động.

### 🧠 2. Bản đồ Cơ bắp Giải phẫu Tương tác SVG (AnatomyViewer)
- Mô phỏng trực quan cơ thể người (mặt trước và mặt sau) bằng đồ họa vector SVG siêu nhẹ.
- Tự động tô màu và làm nổi bật:
  - **Cơ tác động chính (Target Muscle):** Màu Xanh Chuối Neon (`lime-400`).
  - **Cơ tác động phụ (Secondary Muscle):** Màu Cam Thể Thao (`orange-500`).
- Hiển thị ngay bên dưới mỗi bài tập để hướng dẫn người dùng tập trung cảm nhận cơ bắp chính xác.

### ⚡ 3. Ghi Nhận Mức Tạ & Tăng Tiến Sức Mạnh (Progressive Overload)
- Cho phép ghi nhận số lần lặp (Reps) và mức tạ (Kg) cho từng hiệp (Set) tập.
- **Tính năng cao cấp:** Tự động tìm kiếm lịch sử tập luyện gần nhất của bài tập đó và hiển thị gợi ý (ví dụ: *Lần trước: 60kg x 10 reps*) giúp bạn dễ dàng theo dõi và áp dụng nguyên lý tăng tiến tạ qua từng tuần.

### 🔄 4. Đổi Bài Tập Tương Đương (Exercise Swap)
- Khi thiết bị tập trong phòng gym bị chiếm, bạn chỉ cần bấm nút **"Đổi bài"**.
- Hệ thống tự động gợi ý các bài tập thay thế tác động cùng nhóm cơ chính và đồng bộ hóa tiến trình buổi tập.

### ⏱️ 5. Bộ Đếm Thời Gian Nghỉ Ngơi (Rest Timer)
- Đếm ngược thời gian nghỉ từ 60s - 90s (có thể tùy chỉnh thêm/bớt 15s hoặc Bỏ qua).
- Sử dụng **Web Audio API** để phát âm thanh thông báo và **Vibration API** để rung điện thoại di động khi hết giờ nghỉ mà không cần kết nối mạng hoặc tải file âm thanh ngoài.

### 📱 6. Chế Độ Tập Nhanh (Workout Mode)
- Chuyển sang giao diện phóng to, tối giản hóa tối đa để người dùng tập trung cao độ khi đang thực hiện hiệp tập.
- Nút hoàn thành hiệp tập to rõ ràng, dễ dàng thao tác bằng một ngón tay cái khi đang cầm tạ.

### ⚖️ 7. Chỉ Số Cơ Thể & Nhật Ký Tiến Trình (Personal Stats)
- Theo dõi cân nặng hàng ngày và tự động tính toán chỉ số BMI kèm phân loại trạng thái sức khỏe (Gầy, Bình thường, Thừa cân, Béo phì) kèm lời khuyên dinh dưỡng.
- Vẽ **Biểu đồ xu hướng cân nặng SVG** dạng đường cong mượt với hiệu ứng màu gradient lime-400 cao cấp.
- Lưu trữ lịch sử nhật ký tập luyện gần đây.

---

## 🛠️ Công Nghệ Sử Dụng

1. **Frontend:** React 18+ (Khởi tạo bởi Vite cho hiệu năng tối đa và HMR cực nhanh).
2. **Styling:** Tailwind CSS (Giao diện tối Dark Mode hiện đại, màu sắc nhấn thể thao).
3. **Icons:** Lucide React.
4. **PWA Setup:** Native Service Worker (`sw.js`) & Web App Manifest (`manifest.json`).
5. **Dữ liệu & Lưu trữ:** Client-side LocalStorage.

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### Yêu cầu hệ thống
- Đã cài đặt **Node.js** (Khuyến nghị phiên bản 18 trở lên).

### Các bước khởi chạy

1. **Cài đặt các thư viện phụ thuộc:**
   Mở terminal tại thư mục gốc của dự án và chạy lệnh:
   ```bash
   npm install
   ```

2. **Chạy server phát triển (Development):**
   ```bash
   npm run dev
   ```
   Ứng dụng sẽ chạy tại địa chỉ: `http://localhost:5173`.

3. **Biên dịch bản thương mại (Production Build):**
   ```bash
   npm run build
   ```
   Thư mục đầu ra `dist/` chứa mã nguồn đã tối ưu hóa, sẵn sàng triển khai lên các hosting tĩnh như Netlify, Vercel, Firebase Hosting hoặc GitHub Pages.

---

## 📱 Cài Đặt Làm PWA Trên Điện Thoại Di Động

Để trải nghiệm ứng dụng FlexiFit giống như một app Native (không có thanh địa chỉ trình duyệt, hoạt động ngoại tuyến):

1. **Trên Android (Chrome):**
   - Kết nối điện thoại chung Wi-Fi với máy tính và truy cập qua IP cục bộ (ví dụ: `http://192.168.1.X:5173`).
   - Nhấn vào nút menu 3 chấm của Chrome ở góc trên bên phải.
   - Chọn **"Thêm vào màn hình chính" (Add to Home screen)** hoặc **"Cài đặt ứng dụng"**.

2. **Trên iOS / iPhone (Safari):**
   - Truy cập địa chỉ ứng dụng bằng trình duyệt Safari.
   - Nhấn vào biểu tượng **Chia sẻ (Share)** ở thanh công cụ phía dưới.
   - Cuộn xuống dưới và chọn **"Thêm vào màn hình chính" (Add to Home Screen)**.

---

## 💡 Hướng Dẫn Sử Dụng Trong Buổi Tập

1. **Bắt đầu:** Mở ứng dụng, Dashboard sẽ hiển thị lịch tập hôm nay. Bấm **Bắt đầu buổi tập**.
2. **Theo dõi:** Danh sách bài tập của buổi xuất hiện. Bạn có thể chọn bất kỳ bài tập nào để xem bản đồ cơ bắp và hướng dẫn tập luyện.
3. **Tập luyện:** Thực hiện hiệp tập, nhập số Kg và Reps của bạn, sau đó bấm nút **Check hoàn thành**.
4. **Nghỉ ngơi:** Bộ đếm giờ nghỉ sẽ tự động đếm ngược. Khi hết giờ, điện thoại sẽ rung và kêu bíp báo hiệu để bạn bắt đầu hiệp tiếp theo.
5. **Kết thúc:** Sau khi hoàn thành tất cả các hiệp tập của tất cả các bài tập, hệ thống sẽ chúc mừng bạn đã hoàn thành mục tiêu 100% của ngày hôm nay và lưu trữ vào lịch sử.
