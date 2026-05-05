/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Realm, Sect, Talent, Background, Recipe, MapRegion, InventoryItem, Rarity, Organization } from '../types';

export const REALMS: Realm[] = [
  {
    name: 'Phàm Nhân',
    level: 0,
    description: 'Chưa bước vào con đường tu tiên, cơ thể phàm nhân yếu ớt, linh lực chưa tụ.',
    stages: ['Thanh Niên', 'Trung Niên', 'Lão Niên'],
    stageMultipliers: [1.0, 1.0, 1.0]
  },
  {
    name: 'Luyện Khí Kỳ',
    level: 1,
    description: 'Cảm ứng linh khí trời đất, dẫn vào cơ thể, tẩy tủy phạt mao.',
    stages: ['Luyện Khí Tầng 1', 'Luyện Khí Tầng 2', 'Luyện Khí Tầng 3', 'Luyện Khí Tầng 4', 'Luyện Khí Tầng 5', 'Luyện Khí Tầng 6', 'Luyện Khí Tầng 7', 'Luyện Khí Tầng 8', 'Luyện Khí Tầng 9', 'Luyện Khí Tầng 10'],
    stageMultipliers: [1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0]
  },
  {
    name: 'Trúc Cơ Kỳ',
    level: 2,
    description: 'Đúc tầng cơ sở cho con đường tu tiên, thọ nguyên tăng đến 200 năm.',
    stages: ['Trúc Cơ Sơ Kỳ', 'Trúc Cơ Trung Kỳ', 'Trúc Cơ Hậu Kỳ', 'Trúc Cơ Viên Mãn'],
    stageMultipliers: [2.5, 3.0, 3.5, 4.0]
  },
  {
    name: 'Kim Đan Kỳ',
    level: 3,
    description: 'Linh khí ngưng tụ thành đan, thoát thai hoán cốt, thọ nguyên 500 năm.',
    stages: ['Kim Đan Sơ Kỳ', 'Kim Đan Trung Kỳ', 'Kim Đan Hậu Kỳ', 'Kim Đan Viên Mãn'],
    stageMultipliers: [5.0, 6.0, 7.0, 8.5]
  },
  {
    name: 'Nguyên Anh Kỳ',
    level: 4,
    description: 'Phá đan sinh anh, có thể xuất khiếu du ngoạn, thọ nguyên ngàn năm.',
    stages: ['Nguyên Anh Sơ Kỳ', 'Nguyên Anh Trung Kỳ', 'Nguyên Anh Hậu Kỳ', 'Nguyên Anh Viên Mãn'],
    stageMultipliers: [10.0, 12.0, 15.0, 18.0]
  },
  {
    name: 'Hóa Thần Kỳ',
    level: 5,
    description: 'Tiếp xúc linh hồn, nắm bắt quy tắc thiên địa, thọ nguyên vạn năm.',
    stages: ['Hóa Thần Sơ Kỳ', 'Hóa Thần Trung Kỳ', 'Hóa Thần Hậu Kỳ', 'Hóa Thần Viên Mãn'],
    stageMultipliers: [25.0, 30.0, 35.0, 45.0]
  },
  {
    name: 'Luyện Hư Kỳ',
    level: 6,
    description: 'Luyện ảo thành thật, dung nhập hư không.',
    stages: ['Luyện Hư Sơ Kỳ', 'Luyện Hư Trung Kỳ', 'Luyện Hư Hậu Kỳ', 'Luyện Hư Viên Mãn'],
    stageMultipliers: [60.0, 80.0, 100.0, 120.0]
  },
  {
    name: 'Hợp Thể Kỳ',
    level: 7,
    description: 'Thân thể và Nguyên Anh hợp nhất, vĩnh hằng bất diệt.',
    stages: ['Hợp Thể Sơ Kỳ', 'Hợp Thể Trung Kỳ', 'Hợp Thể Hậu Kỳ', 'Hợp Thể Viên Mãn'],
    stageMultipliers: [150.0, 200.0, 250.0, 300.0]
  },
  {
    name: 'Đại Thừa Kỳ',
    level: 8,
    description: 'Viên mãn chi cảnh, chuẩn bị độ kiếp phi thăng.',
    stages: ['Đại Thừa Sơ Kỳ', 'Đại Thừa Trung Kỳ', 'Đại Thừa Hậu Kỳ', 'Đại Thừa Viên Mãn'],
    stageMultipliers: [400.0, 500.0, 600.0, 800.0]
  },
  {
    name: 'Độ Kiếp Kỳ',
    level: 9,
    description: 'Đón nhận thiên kiếp, vượt qua thành tiên, thất bại thành tro bụi.',
    stages: ['Độ Kiếp Sơ Kỳ', 'Độ Kiếp Trung Kỳ', 'Độ Kiếp Hậu Kỳ', 'Độ Kiếp Viên Mãn'],
    stageMultipliers: [1000.0, 1500.0, 2000.0, 3000.0]
  }
];

export const LINH_CAN = [
  'Kim Linh Căn (Đơn)', 'Mộc Linh Căn (Đơn)', 'Thủy Linh Căn (Đơn)', 'Hỏa Linh Căn (Đơn)', 'Thổ Linh Căn (Đơn)',
  'Lôi Linh Căn (Dị)', 'Phong Linh Căn (Dị)', 'Băng Linh Căn (Dị)', 'Kiếm Linh Căn (Dị)',
  'Kim-Mộc Song Linh Căn', 'Thủy-Hỏa Song Linh Căn', 'Thổ-Kim Song Linh Căn',
  'Tam Linh Căn (Tạp)', 'Tứ Linh Căn (Tạp)', 'Ngũ Linh Căn (Phế)',
  'Hư Linh Căn (Phế Vật)', 'Ẩn Linh Căn (Kỳ Ngộ)', 'Hỗn Độn Linh Căn (Chí Cao)', 'Thôn Phệ Linh Căn (Cấm Kỵ)'
];

export const ORGANIZATIONS: Organization[] = [
  {
    id: 'thien_bao_lau',
    name: 'Thiên Bảo Lâu',
    type: 'Thương Nhân',
    tenet: 'Hữu lộc cùng hưởng, giao thương vạn giới.',
    description: 'Thương hội lớn nhất thiên hạ, chi nhánh trải khắp các thành thị, nắm giữ huyết mạch kinh tế của giới tu tiên.',
    baseLocation: 'Thiên Bảo Thành',
    leader: 'Kim Vạn Lượng',
    requirements: ['Linh Thạch: 100', 'Talent: Thiên Phú Giao Tiếp'],
    ranks: [
      { id: 'bronze', name: 'Đồng Hội Viên', requirementReputation: 0, perks: ['Giảm giá mua đồ 5%'] },
      { id: 'silver', name: 'Bạc Hội Viên', requirementReputation: 500, perks: ['Giảm giá mua đồ 10%', 'Bán đồ được giá hơn 5%'] },
      { id: 'gold', name: 'Vàng Hội Viên', requirementReputation: 2000, perks: ['Giảm giá mua đồ 15%', 'Truy cập kho đấu giá bí mật'] },
      { id: 'diamond', name: 'Kim Cương Hội Viên', requirementReputation: 5000, perks: ['Giảm giá mua đồ 25%', 'Thương nhân VIP phục vụ tận nơi'] }
    ]
  },
  {
    id: 'than_bi_cac',
    name: 'Thần Bí Các',
    type: 'Nghiên Cứu',
    tenet: 'Tri thức là sức mạnh, bí mật là tiền tệ.',
    description: 'Tổ chức chuyên thu thập tin tức và bán thông tin mật. Không ai biết chủ nhân thực sự của nó là ai.',
    requirements: ['Realm: Luyện Khí Kỳ', 'Intelligence: 50'],
    ranks: [
      { id: 'scout', name: 'Thám Tử Tập Sự', requirementReputation: 0, perks: ['Thông tin thời tiết linh khí'] },
      { id: 'informant', name: 'Người Đưa Tin', requirementReputation: 300, perks: ['Dự báo Boss xuất hiện'] },
      { id: 'agent', name: 'Mật Thám', requirementReputation: 1500, perks: ['Thông tin chi tiết về NPC'] },
      { id: 'master', name: 'Chủ Các', requirementReputation: 4000, perks: ['Bản đồ toàn cảnh bí cảnh ẩn'] }
    ]
  },
  {
    id: 'huyet_nguyet_lau',
    name: 'Huyết Nguyệt Lâu',
    type: 'Ám Sát',
    tenet: 'Thu tiền nhân quả, tiễn biệt u minh.',
    description: 'Tổ chức sát thủ thần bí, chỉ cần đủ tiền thì ai cũng có thể là mục tiêu.',
    requirements: ['Realm: Trúc Cơ Kỳ', 'Karma: < 0'],
    ranks: [
      { id: 'dagger', name: 'Chuôi Kiếm', requirementReputation: 0, perks: ['Kỹ năng ẩn thân sơ cấp'] },
      { id: 'blade', name: 'Lưỡi Kiếm', requirementReputation: 1000, perks: ['Độc dược đặc chế'] },
      { id: 'shadow', name: 'Bóng Đêm', requirementReputation: 2500, perks: ['Ám sát từ xa', 'Xóa bỏ dấu vết karma'] },
      { id: 'reaper', name: 'Tử Thần', requirementReputation: 6000, perks: ['Bản lĩnh nhất kích tất sát'] }
    ]
  },
  {
    id: 'dai_viet_hoang_toc',
    name: 'Đại Việt Hoàng Tộc',
    type: 'Hoàng Gia',
    tenet: 'Hoàng quyền tối cao, phàm tu nhất thống.',
    description: 'Thế lực thế tục mạnh nhất Việt Quốc, quản lý hàng trăm triệu phàm nhân và tu sĩ cấp thấp.',
    baseLocation: 'Kinh Thành',
    requirements: ['Background: Gia Tộc Chi Tử', 'Level: 10'],
    ranks: [
      { id: 'soldier', name: 'Cấm Vệ Quân', requirementReputation: 0, perks: ['Quyền tài phán phàm giới'] },
      { id: 'general', name: 'Đại Tướng Quân', requirementReputation: 2000, perks: ['Điều động binh lính hỗ trợ'] },
      { id: 'duke', name: 'Vương Gia', requirementReputation: 5000, perks: ['Hưởng bổng lộc linh thạch hàng tháng'] }
    ]
  }
];

export const SECTS: Sect[] = [
  {
    id: 'huang_feng_gu',
    name: 'Hoàng Phong Cốc',
    align: 'Chính',
    tenet: 'Phò chính diệt tà, bảo vệ phàm nhân, lấy khí dưỡng thân.',
    specialty: 'Luyện Khí & Ngự Kiếm',
    description: 'Một trong thất đại môn phái của Việt Quốc, trấn thủ Thái Nhạc Sơn Mạch.',
    requirements: ['Realm: Luyện Khí Tầng 1', 'Karma: > 0']
  },
  {
    id: 'qing_yun_men',
    name: 'Thanh Vân Môn',
    align: 'Chính',
    tenet: 'Kiếm đạo chính tông, thủ hộ thương sinh, thiên hạ vi tiên.',
    specialty: 'Kiếm Đạo',
    description: 'Tông môn chính đạo uy chấn thiên hạ, kiếm pháp chính tông.',
    requirements: ['Realm: Luyện Khí Tầng 3', 'Talent: Kiếm Linh Căn (Dị)']
  },
  {
    id: 'tian_sha_zong',
    name: 'Thiên Sát Tông',
    align: 'Ma',
    tenet: 'Lấy sát chứng đạo, tàn sát chúng sinh, nghịch thiên cải mệnh.',
    specialty: 'Sát Phạt & Huyết Thuật',
    description: 'Ma đạo tông môn vô cùng tàn bạo, lấy sát dưỡng đạo.',
    requirements: ['Realm: Luyện Khí Tầng 1', 'Karma: < -10']
  },
  {
    id: 'gui_ling_men',
    name: 'Quỷ Linh Môn',
    align: 'Ma',
    tenet: 'Quỷ đạo trường sinh, nô dịch linh hồn, luyện hóa âm thi.',
    specialty: 'Quỷ Đạo & Ngự Thi',
    description: 'Bí thuật quỷ dị, am hiểu điều khiển âm thi và quỷ hồn.',
    requirements: ['Realm: Luyện Khí Tầng 5', 'Karma: < 0']
  },
  {
    id: 'tian_xing_gong',
    name: 'Tinh Cung',
    align: 'Chính',
    tenet: 'Duy ngã độc tôn, ổn định trật tự, thống trị vạn phương.',
    specialty: 'Tinh Thần Đại Pháp',
    description: 'Thế lực tối cao cai trị Thiên Tinh Thành và Loạn Tinh Hải qua nhiều vạn năm.',
    requirements: ['Realm: Trúc Cơ Kỳ', 'Level: 20']
  },
  {
    id: 'ni_xing_ming',
    name: 'Nghịch Tinh Minh',
    align: 'Ma',
    tenet: 'Phá vỡ gông xiềng, lật đổ áp bức, tự do tuyệt đối.',
    specialty: 'Hỗn Hợp Bí Thuật',
    description: 'Liên minh các thế lực muốn lật đổ sự thống trị của Tinh Cung tại Loạn Tinh Hải.',
    requirements: ['Realm: Trúc Cơ Kỳ', 'Karma: < 0']
  },
  {
    id: 'mu_lan_ren',
    name: 'Mộ Lan Nhân',
    align: 'Trung Lập',
    tenet: 'Tổ tiên che chở, bộ lạc là trên hết, chiến đấu đến cùng.',
    specialty: 'Pháp Thuật Liên Hợp',
    description: 'Các bộ tộc du mục tại Mộ Lan Thảo Nguyên, nổi tiếng với khả năng phối hợp chiến đấu.',
    requirements: ['Realm: Luyện Khí Tầng 7']
  },
  {
    id: 'tai_yi_men',
    name: 'Thái Nhất Môn',
    align: 'Chính',
    tenet: 'Chính khí lẫm nhiên, thiên địa nhất vị, duy trì thiên đạo.',
    specialty: 'Thiên Địa Chính Khí',
    description: 'Một trong những tông môn mạnh nhất Đại Tấn, đại diện cho chính đạo đỉnh phong.',
    requirements: ['Realm: Kết Đan Kỳ', 'Karma: > 100']
  },
  {
    id: 'hua_yi_men',
    name: 'Hóa Ý Môn',
    align: 'Chính',
    tenet: 'Ý cảnh vô biên, tham ngộ nhân sinh, vạn vật hóa hư.',
    specialty: 'Ý Cảnh Tu Luyện',
    description: 'Tông môn thần bí tại Đại Tấn, am hiểu về sức mạnh ý cảnh và linh hồn.',
    requirements: ['Realm: Nguyên Anh Kỳ']
  }
];

export const BACKGROUNDS: Background[] = [
  {
    id: 'orphan',
    name: 'Lưu Lạc Cô Nhi',
    description: 'Ngươi lớn lên từ những khu ổ chuột, hiểu rõ sự tàn khốc của nhân gian.',
    startingItems: [
      { id: 'banh_bao_kho', name: 'Bánh bao khô', description: 'Một mẩu bánh bao cứng ngắc, chỉ đủ lót dạ.', type: 'CONSUMABLE', rarity: 'Phàm', amount: 3 },
      { id: 'manh_ngoc_vo', name: 'Mảnh ngọc vỡ', description: 'Kỷ vật duy nhất về thân thế của bạn.', type: 'TREASURE', rarity: 'Phàm', amount: 1 }
    ],
    startingReputation: { 'Tán Tu Liên Minh': 10 },
    passive: 'Khả năng sinh tồn cao, dễ dàng tìm thấy tài nguyên trong tự nhiên.'
  },
  {
    id: 'noble',
    name: 'Gia Tộc Chi Tử',
    description: 'Sinh ra trong nhung lụa, mang theo tài nguyên và danh tiếng của gia tộc.',
    startingItems: [
      { id: 'linh_thach_ha_pham', name: 'Linh thạch hạ phẩm', description: 'Đơn vị tiền tệ cơ bản của tu tiên giới.', type: 'CURRENCY', rarity: 'Phàm', amount: 10 },
      { id: 'linh_can_dan', name: 'Linh căn đan', description: 'Đan dược hỗ trợ cảm ứng linh khí.', type: 'CONSUMABLE', rarity: 'Linh', amount: 1 }
    ],
    startingReputation: { 'Thanh Vân Môn': 20, 'Vạn Vật Các': 15 },
    passive: 'Giao tiếp tốt, nhận được sự tôn trọng từ các thế lực chính nghĩa.'
  },
  {
    id: 'wanderer',
    name: 'Khổ Hạnh Tăng',
    description: 'Du hành khắp nơi, tâm cảnh vững vàng, không bị ngoại vật lay động.',
    startingItems: [
      { id: 'gay_truc', name: 'Gậy trúc', description: 'Vật dụng hỗ trợ di chuyển đường dài.', type: 'EQUIPMENT', rarity: 'Phàm', amount: 1 },
      { id: '灵泉_water', name: 'Bình nước linh tuyền', description: 'Chứa nước suối mang chút linh lực.', type: 'CONSUMABLE', rarity: 'Phàm', amount: 1 }
    ],
    startingReputation: { 'Vạn Vật Các': 10 },
    passive: 'Tâm ma khó xâm nhập, tốc độ hồi phục mana nhanh hơn.'
  }
];

export const RECIPES: Recipe[] = [
  {
    id: 'heal_pill',
    name: 'Hồi Huyết Đan',
    materials: { 'Linh Thảo': 2, 'Linh Tuyền': 1 },
    result: 'Hồi Huyết Đan (Hạ phẩm)',
    description: 'Hồi phục 30% HP ngay lập tức.',
    type: 'Đan dược',
    difficulty: 10,
    requiredTuVi: 10
  },
  {
    id: 'mana_pill',
    name: 'Bổ Linh Đan',
    materials: { 'Linh Thảo': 1, 'Linh Thạch Vụn': 1 },
    result: 'Bổ Linh Đan (Hạ phẩm)',
    description: 'Hồi phục 30% Mana ngay lập tức.',
    type: 'Đan dược',
    difficulty: 15,
    requiredTuVi: 10
  },
  {
    id: 'luyen_khi_dan',
    name: 'Luyện Khí Đan',
    materials: { 'Linh Thảo': 3, 'Tụ Linh Hoa': 1 },
    result: 'Luyện Khí Đan',
    description: 'Đan dược cấp thấp giúp ngưng tụ linh khí, tăng nhanh tu vi.',
    type: 'Đan dược',
    difficulty: 30,
    requiredTuVi: 50
  },
  {
    id: 'truc_co_dan',
    name: 'Trúc Cơ Đan',
    materials: { 'Trúc Cơ Thảo': 2, 'Huyết Nhân Sâm': 1, 'Linh Tuyền': 2 },
    result: 'Trúc Cơ Đan',
    description: 'Tăng mạnh tỷ lệ đột phá lên Trúc Cơ Kỳ.',
    type: 'Đan dược',
    difficulty: 70,
    requiredTuVi: 1000 // Close to Truc Co
  },
  {
    id: 'thoi_the_dan',
    name: 'Thối Thể Đan',
    materials: { 'Thạch Nam Thảo': 4, 'Huyết Yêu Thú': 1 },
    result: 'Thối Thể Đan',
    description: 'Giúp rèn luyện nhục thân, tăng cường cơ sở, mở rộng linh mạch.',
    type: 'Đan dược',
    difficulty: 40,
    requiredTuVi: 200
  },
  {
    id: 'hoa_linh_dan',
    name: 'Hóa Linh Đan',
    materials: { 'Hóa Linh Quả': 1, 'Tụ Linh Hoa': 3 },
    result: 'Hóa Linh Đan',
    description: 'Dược lực ôn hòa, dùng trong các lần đột phá cảnh giới nhỏ để phá vỡ bình cảnh.',
    type: 'Đan dược',
    difficulty: 50,
    requiredTuVi: 500
  },
  {
    id: 'ket_dan_hoan',
    name: 'Kết Đan Hoàn',
    materials: { 'Ngưng Đan Thảo': 2, 'Yêu Đan (Trúc Cơ)': 1, 'Thiên Sơn Tuyết Liên': 1 },
    result: 'Kết Đan Hoàn',
    description: 'Giúp ngưng tụ kim đan, bảo vệ tâm mạch.',
    type: 'Đan dược',
    difficulty: 85,
    requiredTuVi: 3000
  },
  {
    id: 'nguyen_anh_dan',
    name: 'Ngưng Anh Đan',
    materials: { 'Cửu Khúc Linh Sâm': 1, 'Anh Đề Tuyền': 1, 'Yêu Đan (Kết Đan)': 1 },
    result: 'Ngưng Anh Đan',
    description: 'Giúp rèn luyện thần hồn, phá nát kim đan để hóa thành Nguyên Anh.',
    type: 'Đan dược',
    difficulty: 95,
    requiredTuVi: 10000
  },
  {
    id: 'simple_talisman',
    name: 'Hộ Thân Phù',
    materials: { 'Giấy Bùa': 1, 'Chu Sa': 1 },
    result: 'Hộ Thân Phù',
    description: 'Tăng phòng ngự trong trận chiến tiếp theo.',
    type: 'Khác',
    difficulty: 5
  }
];

export const NPC_ANATOMY_FIELDS = [
  'Khuôn mặt', 'Ánh mắt', 'Đôi môi', 'Làn da', 'Khung xương', 'Chiều cao', 'Cân nặng',
  'Cổ', 'Bờ vai', 'Cánh tay', 'Bàn tay', 'Ngực (Kích thước)', 'Ngực (Hình dáng)', 'Đầu vú', 'Quầng vú',
  'Eo', 'Bụng', 'Rốn', 'Lưng', 'Mông', 'Đùi', 'Bắp chân', 'Bàn chân',
  'Vùng kín (Mọc lông)', 'Âm hộ (Hình dáng)', 'Môi lớn', 'Môi bé', 'Âm vật (Hạt le)', 'Cửa mình', 'Màng trinh', 'Dịch tiết',
  'Hương thơm cơ thể', 'Giọng nói', 'Khí chất', 'Phản ứng sinh lý', 'Vết sẹo/Hình xăm', 'Điểm nhạy cảm', 'Tư thế đặc trưng', 'Trạng thái chuẩn bị'
];

export const NPC_STYLES = [
  'Thanh Lãnh', 'Tà Mị Quyến Rũ', 'Lạnh Lùng Sát Phạt', 'Thiên Chân Thiên Tài', 
  'Yêu Tộc/Bán Yêu', 'Ma Đạo', 'Y Sư/Luyện Đan', 'Kiếm Tu', 'Quyền Quý Cổ Phong', 
  'Ẩn Thế Cao Nhân', 'Song Tu/Tình Đạo'
];

export const WORLD_LORE = `
Thế giới vô cùng rộng lớn bao gồm Thiên Nam Tu Tiên Giới, Loạn Tinh Hải, Mộ Lan Thảo Nguyên và trung tâm tu tiên thế giới - Đại Tấn. 
Thiên Nam gồm các quốc gia như Việt Quốc, Nguyên Vũ Quốc với các đại sơn mạch như Thái Nhạc Sơn Mạch và cấm địa Huyết Sắc - nơi chứa đựng linh dược nghìn năm nhưng đầy rẫy cấm chế chết người.
Loạn Tinh Hải là vùng biển vô tận, nơi Tinh Cung và Nghịch Tinh Minh tranh hùng, cùng ngoại hải đầy rẫy yêu thú cấp cao và các di tích cổ xưa ẩn mình trong sương mù.
Đại Tấn là nơi hội tụ các đại tông môn như Thái Nhất Môn, nơi đỉnh cao của tu tiên giới nhân loại với những đại thành tu tiên nguy nga tráng lệ.
Ngoài ra còn có Vô Biên Hải huyền bí, Yêu Tộc và Ma Tộc Lĩnh Địa đầy rẫy hiểm cảnh. Những vùng Ngoại Không Loạn Lưu hay Cổ Chiến Trường là nơi tu sĩ tìm kiếm mảnh vỡ Linh Bảo và truyền thừa thượng cổ, nhưng cái giá phải trả thường là mạng sống.
Truyền thuyết về phi thăng lên Linh Giới và Tiên Giới thông qua Hư Thiên Điện hay các Không Gian Toàn Đạo luôn là mục đích tối thượng của mọi tu sĩ.

Hệ thống danh tiếng ảnh hưởng đến giá cả và thái độ của NPC. 
Càng nhiều nhân quả (Karma), thiên kiếp càng mạnh nhưng sức mạnh bộc phát càng lớn.
`;
