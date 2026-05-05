// src/data/world_map_system.ts

export type LocationType = 'TÔNG_MÔN' | 'THÀNH_PHỐ' | 'CẤM_ĐỊA' | 'THẢO_NGUYÊN' | 'VÙNG_BIỂN' | 'LÀNG_MẠC' | 'HANG_ĐỘNG' | 'ĐẢO_NHỎ' | 'RỪNG_SÂU' | 'SƠN_MẠCH' | 'BÍ_CẢNH';
export type DangerLevel = 'Safe' | 'Neutral' | 'Danger' | 'Extreme';

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  dangerLevel: DangerLevel;
  continentId: string;
  description?: string;
  commonBeasts?: string[];
}

export interface Continent {
  id: string;
  name: string;
  description: string;
}

export interface Path {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  name: string;
  travelTimeDays: number; // Thời gian di chuyển ước tính
}

export const WORLD_MAP = {
  continents: [
    { id: 'thien_nam', name: 'Thiên Nam Tu Tiên Giới', description: 'Vùng đất chính của Việt Quốc, Nguyên Vũ Quốc. Nơi linh khí ôn hòa, thích hợp trồng linh thảo.' },
    { id: 'loan_tinh_hai', name: 'Loạn Tinh Hải', description: 'Vùng biển vô tận chứa đầy di tích cổ và vô số hòn đảo lớn nhỏ.' },
    { id: 'mo_lan', name: 'Mộ Lan Thảo Nguyên', description: 'Vùng du mục rộng lớn nổi tiếng với pháp thuật phối hợp và các dị thú mạnh mẽ.' },
    { id: 'dai_tan', name: 'Đại Tấn', description: 'Trung tâm tu tiên giới với linh mạch đỉnh cấp và các thượng cổ tông môn.' },
    { id: 'tieu_cuc', name: 'Tiểu Cực Cung', description: 'Vùng đất băng giá quanh năm ở Bắc Hải, quê hương của tu sĩ Băng thuộc tính.' },
    { id: 'vo_bien_hai', name: 'Vô Biên Hải', description: 'Khối đại dương u ám ngăn cách giữa Thiên Nam và Mộ Lan, ẩn chứa nhiều bí ẩn thượng cổ.' }
  ] as Continent[],

  locations: [
    // Thiên Nam
    { id: 'hoang_phong_coc', name: 'Hoàng Phong Cốc', type: 'TÔNG_MÔN', dangerLevel: 'Safe', continentId: 'thien_nam', description: 'Một trong Thất đại phái của Việt Quốc, sơn môn cắm rễ tại Thái Nhạc Sơn Mạch.', commonBeasts: ['Thanh Trúc Linh Xà'] },
    { id: 'thai_nhac_son_mach', name: 'Thái Nhạc Sơn Mạch', type: 'SƠN_MẠCH', dangerLevel: 'Neutral', continentId: 'thien_nam', description: 'Dãy núi rộng lớn trải dài, nơi Hoàng Phong Cốc đặt tổng đà. Ngoại vi có nhiều dã thú.', commonBeasts: ['Bích Nhãn Xà', 'Thiết Giáp Thú', 'Tật Phong Lang'] },
    { id: 'thai_trang', name: 'Thái Nam Trang', type: 'LÀNG_MẠC', dangerLevel: 'Safe', continentId: 'thien_nam', description: 'Trang viên của gia tộc tu tiên, nơi tổ chức phường thị cho tu sĩ cấp thấp.', commonBeasts: ['Tiểu Hỏa Quyên', 'Ngân Vĩ Thử'] },
    { id: 'gia_nguyen_thanh', name: 'Gia Nguyên Thành', type: 'THÀNH_PHỐ', dangerLevel: 'Safe', continentId: 'thien_nam', description: 'Thành trì thế tục phồn hoa, bến cảng giao thương sầm uất.', commonBeasts: ['Dã Lang', 'Hắc Hùng'] },
    { id: 'thanh_van_mon', name: 'Thanh Vân Môn', type: 'TÔNG_MÔN', dangerLevel: 'Safe', continentId: 'thien_nam', description: 'Tông môn cường thịnh thiên về ngự kiếm thuật và đạo pháp tự nhiên.', commonBeasts: ['Bạch Tiên Hạc'] },
    { id: 'huyet_sac_cam_dia', name: 'Cấm địa Huyết Sắc', type: 'CẤM_ĐỊA', dangerLevel: 'Extreme', continentId: 'thien_nam', description: 'Mảnh vỡ không gian, khu vực cực kỳ nguy hiểm chứa nhiều linh thảo Trúc Cơ hiếm. Chỉ mở mỗi 60 năm.', commonBeasts: ['Huyết Ngô Công', 'Sơn Viên Khổng Lồ', 'Mặc Giao', 'Độc Mãng'] },
    { id: 'van_man_san', name: 'Vạn Man Sơn', type: 'SƠN_MẠCH', dangerLevel: 'Danger', continentId: 'thien_nam', description: 'Dãy núi man hoang đầy rẫy yêu thú cường đại.', commonBeasts: ['Thạch Cự Nhân', 'Địa Hỏa Yêu Trư', 'Tật Phong Cuồng Lang'] },
    { id: 'an_thach_dong', name: 'Ẩn Thạch Động', type: 'HANG_ĐỘNG', dangerLevel: 'Neutral', continentId: 'thien_nam', description: 'Hang động sâu thẳm dưới lòng đất Vạn Man Sơn, nơi cư ngụ của nhiều loài quỷ vật.', commonBeasts: ['Độc Tri Chu', 'Hấp Huyết Biển Bức'] },
    { id: 'cam_nha_tieu_thon', name: 'Cẩm Cúc Thôn', type: 'LÀNG_MẠC', dangerLevel: 'Safe', continentId: 'thien_nam', description: 'Một ngôi làng hẻo lánh dưới chân núi Vạn Man, dân làng thường xuyên bị yêu thú quấy phá.', commonBeasts: ['Hắc Trư Yêu'] },

    // Loạn Tinh Hải
    { id: 'thien_tinh_thanh', name: 'Thiên Tinh Thành', type: 'THÀNH_PHỐ', dangerLevel: 'Safe', continentId: 'loan_tinh_hai', description: 'Siêu thành thị hình nón lơ lửng trên đỉnh ngọn núi giữa biển khơi, được bảo vệ bởi Thiên Tinh Song Thánh.', commonBeasts: ['Linh Ngư', 'Thanh Hải Oanh'] },
    { id: 'khue_tinh_dao', name: 'Kh魁 Tinh Đảo', type: 'ĐẢO_NHỎ', dangerLevel: 'Neutral', continentId: 'loan_tinh_hai', description: 'Hòn đảo nhỏ sầm uất tập trung vô số tán tu đánh bắt yêu thú.', commonBeasts: ['Lôi Đầu Cầu', 'Độc Hải Xà', 'Thiết Giáp Tinh Tôm'] },
    { id: 'ngo_tinh_hai', name: 'Ngoại Tinh Hải', type: 'VÙNG_BIỂN', dangerLevel: 'Extreme', continentId: 'loan_tinh_hai', description: 'Vùng biển sâu bão táp mịt mù, nơi sinh sống của vô vàn yêu thú cấp 5 trở lên.', commonBeasts: ['Anh Ninh Thú', 'Thâm Hải Phệ Ngư', 'Bát Cảo Quái'] },
    { id: 'van_yeu_tieu_dao', name: 'Vạn Yêu Tiểu Đảo', type: 'ĐẢO_NHỎ', dangerLevel: 'Danger', continentId: 'loan_tinh_hai', description: 'Hòn đảo san hô hoang vắng thỉnh thoảng có yêu thú cực hiếm dừng chân.', commonBeasts: ['Phong Dực Báo', 'U Lăng Nga', 'Huyễn Linh Điểu'] },
    { id: 'vuc_sau_hai_nguyệt', name: 'Hải Nguyệt Vực Sâu', type: 'HANG_ĐỘNG', dangerLevel: 'Extreme', continentId: 'loan_tinh_hai', description: 'Khe nứt tăm tối dưới đáy Loạn Tinh Hải, nơi ánh sáng không thể lọt tới.', commonBeasts: ['Uyên Ương Ám Quỷ', 'Ngọc Toái Giao'] },

    // Mộ Lan
    { id: 'mo_lan_bo_toc', name: 'Bộ Lạc Mộ Lan', type: 'THẢO_NGUYÊN', dangerLevel: 'Neutral', continentId: 'mo_lan', description: 'Khu vực sinh sống của người Mộ Lan, lều bạt trải dài, linh khí phong phú nhưng dã man.', commonBeasts: ['Bốc Lộ Linh Dương', 'Thiết Đề Mã'] },
    { id: 'thien_phong_nguyen', name: 'Thiên Phong Nguyên', type: 'THẢO_NGUYÊN', dangerLevel: 'Danger', continentId: 'mo_lan', description: 'Đồng cỏ chết chóc với những cơn lốc xoáy sắc như đao bất chợt xuất hiện.', commonBeasts: ['Phong Ma Lang', 'Thảo Nguyên Cuồng Nhan', 'Bạo Phong Sư'] },
    { id: 'am_cot_coc', name: 'Âm Cốt Cốc', type: 'CẤM_ĐỊA', dangerLevel: 'Extreme', continentId: 'mo_lan', description: 'Khe nứt tự nhiên chứa đựng vô số xương cốt yêu thú thời thượng cổ.', commonBeasts: ['Cốt Yêu', 'Oán Linh Thú', 'Hủ Thi Thứu'] },

    // Đại Tấn
    { id: 'thai_nhat_mon', name: 'Thái Nhất Môn', type: 'TÔNG_MÔN', dangerLevel: 'Safe', continentId: 'dai_tan', description: 'Đệ nhất chính đạo tông môn tại Đại Tấn, tọa lạc trên Thái Nhất Thần Sơn.', commonBeasts: ['Kim Quan Điêu', 'Hộ Phái Thần Kiếm Linh'] },
    { id: 'am_la_tong', name: 'Âm La Tông', type: 'TÔNG_MÔN', dangerLevel: 'Safe', continentId: 'dai_tan', description: 'Đại phái ma đạo hùng mạnh sử dụng quỷ vật và sát khí để xưng bá.', commonBeasts: ['Thi Sát', 'Bạch Cốt Yêu', 'Huyết Vu Bức'] },
    { id: 'canh_ly_son', name: 'Cảnh Ly Sơn', type: 'RỪNG_SÂU', dangerLevel: 'Danger', continentId: 'dai_tan', description: 'Khu rừng mê cung âm u bao quanh Âm La Tông, sương phù lượn lờ.', commonBeasts: ['Huyễn Trúc Xà', 'Thủ Mộ Quái', 'Ám Toản Phong'] },
    { id: 'van_doc_trach', name: 'Vạn Độc Trạch', type: 'CẤM_ĐỊA', dangerLevel: 'Extreme', continentId: 'dai_tan', description: 'Đầm lầy độc khí bốc lên ngùn ngụt, nơi sinh sống của hàng tỷ độc trùng.', commonBeasts: ['Cửu Cửu Tử Hạt', 'Diệt Nhan Thù', 'Lục Thủy Mãng'] },
    { id: 'thai_nhac_cung', name: 'Thái Nhạc Cung', type: 'THÀNH_PHỐ', dangerLevel: 'Safe', continentId: 'dai_tan', description: 'Khu thương mại dưới sự bảo hộ của Thái Nhất Môn, xa hoa vô bỉ.', commonBeasts: ['Cẩm Linh Thử'] },

    // Tiểu Cực Cung
    { id: 'bac_quang_thanh', name: 'Bắc Quang Thành', type: 'THÀNH_PHỐ', dangerLevel: 'Safe', continentId: 'tieu_cuc', description: 'Thành phố nằm dưới ánh hào quang của cực quang phía Bắc. Quanh năm đắm chìm trong hàn khí.', commonBeasts: ['Băng Tinh Hồ Lôi'] },
    { id: 'tinh_bang_hang', name: 'Tịnh Băng Hang', type: 'HANG_ĐỘNG', dangerLevel: 'Extreme', continentId: 'tieu_cuc', description: 'Nơi khí lạnh Cực Âm có thể đóng băng cả Nguyên Anh và linh lực.', commonBeasts: ['Hàn Băng Thủy Ngân Yêu', 'Băng Điêu Khổng Lồ', 'Tuyết Quái'] },
    { id: 'ham_tuyet_chon', name: 'Hãm Tuyết Thôn', type: 'LÀNG_MẠC', dangerLevel: 'Neutral', continentId: 'tieu_cuc', description: 'Một ngôi làng nhỏ dựng bằng băng thú tạc vào vách đá.', commonBeasts: ['Băng Lang', 'Tuyết Thỏ'] }
  ] as Location[],

  paths: [
    // Thiên Nam Routing
    { id: 'path_hpc_tnsm', fromLocationId: 'hoang_phong_coc', toLocationId: 'thai_nhac_son_mach', name: 'Sơn Môn Chi Đạo', travelTimeDays: 1 },
    { id: 'path_tnsm_tt', fromLocationId: 'thai_nhac_son_mach', toLocationId: 'thai_trang', name: 'Tiểu Lộ Cốc', travelTimeDays: 2 },
    { id: 'path_tt_gn', fromLocationId: 'thai_trang', toLocationId: 'gia_nguyen_thanh', name: 'Quan Đạo Thất Đỉnh', travelTimeDays: 3 },
    { id: 'path_gn_hscd', fromLocationId: 'gia_nguyen_thanh', toLocationId: 'huyet_sac_cam_dia', name: 'Phong Hóa Cốc Đạo', travelTimeDays: 7 },
    { id: 'path_hpc_tvm', fromLocationId: 'hoang_phong_coc', toLocationId: 'thanh_van_mon', name: 'Ngự Kiếm Chuyển Di', travelTimeDays: 2 },
    { id: 'path_tvm_vms', fromLocationId: 'thanh_van_mon', toLocationId: 'van_man_san', name: 'Nam Lâm Đạo', travelTimeDays: 4 },
    { id: 'path_vms_atd', fromLocationId: 'van_man_san', toLocationId: 'an_thach_dong', name: 'Bí Lộ Dưới Đất', travelTimeDays: 1 }, 
    { id: 'path_vms_cct', fromLocationId: 'van_man_san', toLocationId: 'cam_nha_tieu_thon', name: 'Lối Mòn Chân Núi', travelTimeDays: 1 },
    
    // Loạn Tinh Hải Routing
    { id: 'path_ttt_ktd', fromLocationId: 'thien_tinh_thanh', toLocationId: 'khue_tinh_dao', name: 'Lộ Tuyến Truyền Tống', travelTimeDays: 1 },
    { id: 'path_ttt_nth', fromLocationId: 'thien_tinh_thanh', toLocationId: 'ngo_tinh_hai', name: 'Cổng Viễn Dương', travelTimeDays: 15 },
    { id: 'path_nth_vytd', fromLocationId: 'ngo_tinh_hai', toLocationId: 'van_yeu_tieu_dao', name: 'Luồng Sóng Ác', travelTimeDays: 7 },
    { id: 'path_nth_vshn', fromLocationId: 'ngo_tinh_hai', toLocationId: 'vuc_sau_hai_nguyệt', name: 'Đường Xuống Đáy Biển', travelTimeDays: 3 },

    // Mộ Lan Routing
    { id: 'path_mlbt_tpn', fromLocationId: 'mo_lan_bo_toc', toLocationId: 'thien_phong_nguyen', name: 'Đường Săn Thú', travelTimeDays: 5 },
    { id: 'path_tpn_acc', fromLocationId: 'thien_phong_nguyen', toLocationId: 'am_cot_coc', name: 'Giao Địa Chết Chóc', travelTimeDays: 4 },

    // Đại Tấn Routing
    { id: 'path_tnm_tnc', fromLocationId: 'thai_nhat_mon', toLocationId: 'thai_nhac_cung', name: 'Thần Đạo Chấn Thiên', travelTimeDays: 1 },
    { id: 'path_tnc_alt', fromLocationId: 'thai_nhac_cung', toLocationId: 'am_la_tong', name: 'Trận Tuyến Chính Tà', travelTimeDays: 20 },
    { id: 'path_alt_cls', fromLocationId: 'am_la_tong', toLocationId: 'canh_ly_son', name: 'Đường Xuống Hoàng Tuyền', travelTimeDays: 2 },
    { id: 'path_cls_vdt', fromLocationId: 'canh_ly_son', toLocationId: 'van_doc_trach', name: 'U Ám Tử Đạo', travelTimeDays: 10 },

    // Tiểu Cực Cung Routing
    { id: 'path_bqt_htt', fromLocationId: 'bac_quang_thanh', toLocationId: 'ham_tuyet_chon', name: 'Đường Mòn Băng Tuyết', travelTimeDays: 3 },
    { id: 'path_htt_tbh', fromLocationId: 'ham_tuyet_chon', toLocationId: 'tinh_bang_hang', name: 'Cực Hàn Mật Đạo', travelTimeDays: 5 },

    // Inter-Continental Routing
    { id: 'path_thien_nam_loan_tinh', fromLocationId: 'thien_tinh_thanh', toLocationId: 'thanh_van_mon', name: 'Hải Lộ Xuyên Không (Cổ Trận)', travelTimeDays: 0 }, // Dùng trận pháp tức thì
    { id: 'path_thien_nam_mo_lan', fromLocationId: 'van_man_san', toLocationId: 'mo_lan_bo_toc', name: 'Đường Mòn Biên Giới', travelTimeDays: 20 },
    { id: 'path_mo_lan_dai_tan', fromLocationId: 'mo_lan_bo_toc', toLocationId: 'thai_nhat_mon', name: 'Đại Lộ Thông Tấn', travelTimeDays: 40 },
    { id: 'path_loan_tinh_tieu_cuc', fromLocationId: 'ngo_tinh_hai', toLocationId: 'bac_quang_thanh', name: 'Hải Lưu Băng Giá', travelTimeDays: 60 }
  ] as Path[]
};

export const getAccessibleLocations = (currentLocationId: string): Path[] => {
    return WORLD_MAP.paths.filter(p => p.fromLocationId === currentLocationId || p.toLocationId === currentLocationId);
};
