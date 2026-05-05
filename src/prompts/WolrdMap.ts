export const WORLD_GEO_PROMPT = `
MỆNH LỆNH NGÔN NGỮ TUYỆT ĐỐI (ABSOLUTE LANGUAGE COMMAND): 
Toàn bộ nội dung hiển thị trong game (Tên Địa Danh, Loại Yêu Thú, Mô Tả...) PHẢI 100% bằng Tiếng Việt hoặc Hán Việt mang phong vị Tu Tiên. 
NGHIÊM CẤM sử dụng tiếng Anh hoặc ngôn ngữ khác.
TUYỆT ĐỐI KHÔNG sử dụng các từ ngữ mang tính chất trò chơi như "Tân thủ thôn", "Khu khởi đầu", "Màn 1". 

BỐI CẢNH THẾ GIỚI MỞ RỘNG MANG TÍNH THAM CHIẾU (Bao gồm các Châu Lục, Vùng đất chính và Các tiểu khu vực vệ tinh):

DANH SÁCH KHU VỰC ĐỂ XÂY DỰNG BẢN ĐỒ (Có thể đưa vào mapData với các thông tin tương ứng):
1. Thiên Nam Tu Tiên Giới:
    - Tông môn: Hoàng Phong Cốc, Thanh Vân Môn, Thiên Sát Tông, Quỷ Linh Môn.
    - Sơn mạch & Rừng: Thái Nhạc Sơn Mạch (yêu thú: Bích Nhãn Xà, Tật Phong Lang), Vạn Man Sơn (yêu thú: Hắc Hùng, Địa Hỏa Yêu Trư).
    - Thành thị & Làng mạc: Gia Nguyên Thành (Thành trì phàm phu tục tử), Thái Nam Trang (Làng mạc tu sĩ giao thương - Cấp 1), Cẩm Cúc Thôn (Làng nhỏ bị dã thú quấy rối).
    - Cấm địa/Hang động: Huyết Sắc Cấm Địa (yêu thú: Huyết Ngô Công, Mặc Giao), Ẩn Thạch Động (yêu thú: Độc Tri Chu).
2. Loạn Tinh Hải:
    - Thế lực: Thiên Tinh Thành (Siêu thành thị trung tâm).
    - Biển và Đảo: Kh魁 Tinh Đảo (Nhỏ, trung lập), Vạn Yêu Tiểu Đảo (Nguy hiểm, yêu thú dồi dào như Phong Dực Báo), Ngoại Tinh Hải (Biển sâu, yêu quái cực mạnh như Thâm Hải Phệ Ngư).
    - Hang động/Vực sâu: Hải Nguyệt Vực Sâu (Khe nứt dưới biển, yêu quái: Uyên Ương Ám Quỷ).
3. Mộ Lan Thảo Nguyên:
    - Bộ tộc/Thảo nguyên: Bộ Lạc Mộ Lan (Trung lập), Thiên Phong Nguyên (Thảo nguyên bão gió, yêu thú: Phong Ma Lang).
    - Cấm địa: Âm Cốt Cốc (Nơi chôn cất yêu thú thượng cổ, quỷ vật: Oán Linh Thú).
4. Đại Tấn (Trung Tâm Tu Tiên):
    - Tông môn/Thành thị: Thái Nhất Môn, Âm La Tông, Thái Nhạc Cung (Thành phố phồn hoa).
    - Đại lâm/Cấm địa: Cảnh Ly Sơn (Khu rừng mê cung, yêu quái: Huyễn Trúc Xà), Vạn Độc Trạch (Đầm lầy vạn độc, yêu quái: Cửu Cửu Tử Hạt).
5. Vùng Đất Khác:
    - Tiểu Cực Cung (Bắc Hải): Bắc Quang Thành, Tịnh Băng Hang (Hang động tột bậc lạnh giá, yêu thú: Hàn Băng Thủy Ngân Yêu), Hãm Tuyết Thôn (Làng mạc băng giá quanh năm).
    - Vô Biên Hải & Yêu/Ma Tộc Lĩnh Địa.

QUY TẮC CẤU TRÚC VÀ LIÊN KẾT (LOGICAL CONNECTIONS):
- Các vùng đất lớn (Thành phố, Tông môn) phải ưu tiên liên kết với các tiểu khu vực vệ tinh xung quanh nó (VD: Gia Nguyên Thành kết nối đến Thái Nam Trang).
- Hang động và cấm địa nên kết nối từ các Sơn Mạch hoặc Cốc (VD: Vạn Man Sơn -> Ẩn Thạch Động, Thiên Tinh Thành -> Kh魁 Tinh Đảo).
- Sử dụng các commonBeasts đặc trưng.
- Sinh đa dạng các type khu vực như: "Continent", "City", "Sect", "Mountain", "Forest", "River", "Sea", "Dungeon", "ForbiddenZone", "Village", "Cave", "Island".

QUY TẮC PHÂN LOẠI KHU VỰC (ZONING RULES):
- "Safe" (An Toàn): Các Thành thị (City), Tông môn (Sect), Làng mạc (Village).
- "Neutral" (Trung Lập): Thảo nguyên (Plain), Các điểm giao thương (Island nhỏ, Valley).
- "Danger" hoặc "Extreme": Hang động (Cave), Rừng rậm (Forest), Cấm địa (ForbiddenZone), Khu vực biển sâu.

Tạo ra dữ liệu JSON của các vùng đất.
LƯU Ý: JSON TRẢ VỀ PHẢI LÀ MỘT ARRAY CÁC OBJECT, KHÔNG KÈM BẤT KỲ VĂN BẢN NÀO KHÁC BÊN NGOÀI.

MẪU DỮ LIỆU BẮT BUỘC:
[
  {
    "id": "gia-nguyen-thanh",
    "type": "City",
    "dangerLevel": "Safe",
    "continentId": "thien-nam",
    "tierId": "T1",
    "name": "Gia Nguyên Thành",
    "discovered": true,
    "description": "Thành phố trung tâm phồn hoa sầm uất tại Thiên Nam.",
    "positionX": 0,
    "positionY": 0,
    "linhKhi": "Bình Thường",
    "cap": "Phàm Nhân",
    "terrain": "Thành trì",
    "difficulty": 1,
    "commonBeasts": ["Ngân Vĩ Thử"],
    "connectedRegionIds": ["thai-nam-trang", "hoang-phong-coc"],
    "ownerFaction": "Việt Quốc"
  }
]

Cấu trúc JSON mỗi region (MapRegion):
{
  "id": "chuỗi định danh duy nhất không dấu", 
  "type": "Continent" | "City" | "Sect" | "Mountain" | "Forest" | "River" | "Sea" | "Dungeon" | "ForbiddenZone" | "Village" | "Cave" | "Island",
  "dangerLevel": "Safe" | "Neutral" | "Danger" | "Extreme",
  "continentId": null,
  "tierId": "T1",
  "name": "Tên",
  "discovered": false,
  "description": "Mô tả",
  "positionX": 100,
  "positionY": -50,
  "linhKhi": "Loãng",
  "cap": "Luyện Khí",
  "terrain": "Địa hình",
  "difficulty": 1,
  "commonBeasts": ["Dã thú"],
  "connectedRegionIds": [],
  "ownerFaction": null
}

ĐẢM BẢO TẠO RA DỮ LIỆU CHI TIẾT THEO MẪU.
`;
