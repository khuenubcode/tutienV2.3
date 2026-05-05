import { BeastLevel, BeastInstinct } from '../prompts/MindsetBeast';
import { DietType } from '../prompts/ecosystem_simulation';

export interface LootDrop {
  itemId: string;
  chance: number; // 0-1
  minAmount: number;
  maxAmount: number;
}

export type BloodlineType = 'Phàm Huyết' | 'Linh Huyết' | 'Cổ Huyết' | 'Thần Huyết' | 'Thánh Huyết';

export interface BeastDefinition {
  id: string;
  name: string;
  level: BeastLevel;
  bloodlineType?: BloodlineType;
  diet: DietType;
  basePower: number; // 0-1
  reproduction: number; // 0-1
  rarity: 'common' | 'rare' | 'elite' | 'boss';
  habitat: string[];
  instinct: BeastInstinct;
  description: string;
  lootTable: LootDrop[];
  element?: string;
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  realm: string;
  activeSkills: any[];
  passiveSkills: any[];
}

export const BEAST_DATABASE: Record<string, BeastDefinition> = {
  "Thanh Phong Lang": {
    id: "thanh_phong_lang",
    name: "Thanh Phong Lang",
    level: "LOW",
    bloodlineType: "Phàm Huyết",
    diet: "carnivore",
    basePower: 0.4,
    reproduction: 0.2,
    rarity: "common",
    habitat: ["Phàm Giới", "Nam Hoang Vực"],
    instinct: { hunger: 0.6, aggression: 0.7, caution: 0.4, territorial: 0.3, pack: 0.8, bloodline: 0.2 },
    description: "Sói gió có tốc độ cực nhanh, thường đi theo bầy đàn.",
    lootTable: [
      { itemId: "lang_nha", chance: 0.7, minAmount: 1, maxAmount: 2 },
      { itemId: "lang_bi", chance: 0.5, minAmount: 1, maxAmount: 1 },
      { itemId: "phong_linh_thach_vun", chance: 0.1, minAmount: 1, maxAmount: 1 }
    ],
    element: "PHONG",
    hp: 150,
    mp: 50,
    attack: 30,
    defense: 20,
    speed: 80,
    realm: "Luyện Khí (Sơ kỳ)",
    activeSkills: [
      { id: "phong_nhan", name: "Phong Nhận", type: "ACTIVE", baseDamage: 40, scaling: 1.2, element: "PHONG", cost: 10, cooldown: 2 },
      { id: "can_xe", name: "Cắn Xé", type: "ACTIVE", baseDamage: 30, scaling: 1.0, element: "NONE", cost: 0, cooldown: 0 }
    ],
    passiveSkills: [
        { id: "nhanh_nhen", name: "Sói Nhanh Nhẹn", type: "PASSIVE", description: "Tăng 10% tốc độ." }
    ]
  },
  "Xích Diễm Hổ": {
    id: "xich_diem_ho",
    name: "Xích Diễm Hổ",
    level: "MID",
    bloodlineType: "Linh Huyết",
    diet: "carnivore",
    basePower: 0.7,
    reproduction: 0.1,
    rarity: "rare",
    habitat: ["Nam Hoang Vực", "Vạn Thú Sơn Mạch"],
    instinct: { hunger: 0.5, aggression: 0.9, caution: 0.3, territorial: 0.9, pack: 0.1, bloodline: 0.5 },
    description: "Hổ lửa mang trong mình hỏa độc, sức mạnh bộc phát cực lớn.",
    lootTable: [
      { itemId: "ho_cot", chance: 0.8, minAmount: 1, maxAmount: 3 },
      { itemId: "hoa_tinh", chance: 0.4, minAmount: 1, maxAmount: 2 },
      { itemId: "xich_diem_dan", chance: 0.05, minAmount: 1, maxAmount: 1 }
    ],
    element: "HOA",
    hp: 400,
    mp: 150,
    attack: 80,
    defense: 50,
    speed: 60,
    realm: "Trúc Cơ (Trung kỳ)",
    activeSkills: [
      { id: "diem_trach", name: "Diễm Trảo", type: "ACTIVE", baseDamage: 100, scaling: 1.5, element: "HOA", cost: 30, cooldown: 3 },
      { id: "gam_thet", name: "Hổ Khiếu", type: "ACTIVE", baseDamage: 50, scaling: 0.9, element: "HOA", cost: 20, cooldown: 4 }
    ],
    passiveSkills: [
        { id: "hoa_doc", name: "Hỏa Độc", type: "PASSIVE", description: "Đòn đánh thường gây thêm sát thương hỏa theo thời gian." }
    ]
  },
  "Hàn Băng Mãng": {
    id: "han_bang_mang",
    name: "Hàn Băng Mãng",
    level: "HIGH",
    bloodlineType: "Linh Huyết",
    diet: "carnivore",
    basePower: 0.85,
    reproduction: 0.05,
    rarity: "elite",
    habitat: ["Hàn Băng Thâm Uyên", "Bắc Cực Băng Nguyên"],
    instinct: { hunger: 0.3, aggression: 0.6, caution: 0.8, territorial: 1.0, pack: 0.0, bloodline: 0.7 },
    description: "Mãng xà khổng lồ sống trong hang lạnh, hơi thở có thể đóng băng vạn vật.",
    lootTable: [
      { itemId: "bang_tinh", chance: 1.0, minAmount: 2, maxAmount: 5 },
      { itemId: "han_bang_than_thiet", chance: 0.2, minAmount: 1, maxAmount: 1 }
    ],
    element: "BANG",
    hp: 1200,
    mp: 400,
    attack: 150,
    defense: 120,
    speed: 40,
    realm: "Trúc Cơ (Đại viên mãn)",
    activeSkills: [
      { id: "bang_hoi_tho", name: "Hàn Băng Hơi Thở", type: "ACTIVE", baseDamage: 200, scaling: 2.0, element: "BANG", cost: 80, cooldown: 5 },
      { id: "xong_thiet", name: "Đuôi Quật", type: "ACTIVE", baseDamage: 120, scaling: 1.5, element: "BANG", cost: 40, cooldown: 3 }
    ],
    passiveSkills: [
        { id: "bang_giap", name: "Băng Giáp", type: "PASSIVE", description: "Giảm 20% sát thương nhận vào." }
    ]
  },
  "Cửu Thiên Thần Bằng": {
    id: "cuu_thien_than_bang",
    name: "Cửu Thiên Thần Bằng",
    level: "LORD",
    bloodlineType: "Thần Huyết",
    diet: "carnivore",
    basePower: 0.98,
    reproduction: 0.01,
    rarity: "boss",
    habitat: ["Vô Tận Hư Không", "Thiên Đình Di Tích"],
    instinct: { hunger: 0.2, aggression: 0.5, caution: 0.5, territorial: 0.8, pack: 0.0, bloodline: 0.9 },
    description: "Sinh vật huyền thoại cư ngụ trên chín tầng mây, là bá chủ bầu trời.",
    lootTable: [
      { itemId: "than_bang_vu", chance: 1.0, minAmount: 1, maxAmount: 3 }
    ],
    element: "LOI",
    hp: 5000,
    mp: 2000,
    attack: 400,
    defense: 300,
    speed: 150,
    realm: "Hóa Thần (Sơ kỳ)",
    activeSkills: [
      { id: "thien_loi_kich", name: "Thiên Lôi Kích", type: "ACTIVE", baseDamage: 500, scaling: 2.5, element: "LOI", cost: 200, cooldown: 6 },
      { id: "phong_bao", name: "Bão Tố", type: "ACTIVE", baseDamage: 300, scaling: 2.0, element: "PHONG", cost: 150, cooldown: 4 }
    ],
    passiveSkills: [
        { id: "than_toc", name: "Thần Tốc", type: "PASSIVE", description: "Tăng 50% tốc độ, né tránh 30%." }
    ]
  },
  "Thôn Phệ Ma Nghê": {
    id: "thon_phe_ma_nghe",
    name: "Thôn Phệ Ma Nghê",
    level: "LORD",
    bloodlineType: "Cổ Huyết",
    diet: "carnivore",
    basePower: 0.92,
    reproduction: 0.02,
    rarity: "boss",
    habitat: ["Ma Sát Quỷ Vực", "Vong Linh Chi Uyên"],
    instinct: { hunger: 1.0, aggression: 0.8, caution: 0.2, territorial: 0.8, pack: 0.0, bloodline: 0.8 },
    description: "Dị chủng thái cổ, chuyên hút linh khí của tu sĩ và yêu thú khác.",
    lootTable: [
      { itemId: "ma_nghe_dan", chance: 0.5, minAmount: 1, maxAmount: 1 }
    ],
    element: "AM",
    hp: 3000,
    mp: 1000,
    attack: 250,
    defense: 200,
    speed: 50,
    realm: "Kim Đan (Trung kỳ)",
    activeSkills: [
      { id: "hut_linh", name: "Thôn Phệ Linh Lực", type: "ACTIVE", baseDamage: 150, scaling: 1.8, element: "AM", cost: 50, cooldown: 4 },
      { id: "ma_khi", name: "Ma Khí Bùng Nổ", type: "ACTIVE", baseDamage: 200, scaling: 1.5, element: "AM", cost: 100, cooldown: 5 }
    ],
    passiveSkills: [
        { id: "bat_tu", name: "Hồi Phục Ma Tính", type: "PASSIVE", description: "Hồi 2% HP mỗi lượt." }
    ]
  },
  "Nguyên Vương Thạch Quy": {
    id: "nguyen_vuong_thach_quy",
    name: "Nguyên Vương Thạch Quy",
    level: "LORD",
    bloodlineType: "Thánh Huyết",
    diet: "herbivore",
    basePower: 0.95,
    reproduction: 0.01,
    rarity: "boss",
    habitat: ["Thiên Sơn Đỉnh", "Cổ Hải Chi Để"],
    instinct: { hunger: 0.1, aggression: 0.2, caution: 0.9, territorial: 0.9, pack: 0.0, bloodline: 0.9 },
    description: "Linh quy mang trong mình dòng máu thánh hiền, thường hóa thân thành hòn đá khổng lồ.",
    lootTable: [
      { itemId: "thach_quy_linh_thach", chance: 1.0, minAmount: 1, maxAmount: 1 }
    ],
    element: "THO",
    hp: 10000,
    mp: 500,
    attack: 100,
    defense: 800,
    speed: 10,
    realm: "Nguyên Anh (Đại viên mãn)",
    activeSkills: [
      { id: "dia_chan", name: "Địa Chấn", type: "ACTIVE", baseDamage: 100, scaling: 1.0, element: "THO", cost: 100, cooldown: 8 }
    ],
    passiveSkills: [
        { id: "phong_thu_tuyet_doi", name: "Phòng Thủ Tuyệt Đối", type: "PASSIVE", description: "Miễn nhiễm 50% sát thương nhận vào." }
    ]
  },
  "Huyết Sát Ma Chu": {
    id: "huyet_sat_ma_chu",
    name: "Huyết Sát Ma Chu",
    level: "MID",
    bloodlineType: "Cổ Huyết",
    diet: "carnivore",
    basePower: 0.7,
    reproduction: 0.4,
    rarity: "elite",
    habitat: ["Huyết Sát Vực", "Vạn Thú Sơn Mạch"],
    instinct: { hunger: 0.8, aggression: 0.7, caution: 0.4, territorial: 0.6, pack: 0.5, bloodline: 0.2 },
    description: "Nhện đỏ ăn thịt, chuyên giăng lưới bắt mồi trong huyết sương.",
    lootTable: [
      { itemId: "ma_chu_ty", chance: 0.7, minAmount: 2, maxAmount: 5 },
      { itemId: "huyet_doc_tinh", chance: 0.4, minAmount: 1, maxAmount: 1 }
    ],
    element: "AM",
    hp: 300,
    mp: 100,
    attack: 60,
    defense: 30,
    speed: 70,
    realm: "Trúc Cơ (Sơ kỳ)",
    activeSkills: [
      { id: "huyet_si", name: "Huyết Ti", type: "ACTIVE", baseDamage: 80, scaling: 1.2, element: "AM", cost: 20, cooldown: 3 }
    ],
    passiveSkills: [
        { id: "kich_doc", name: "Kịch Độc", type: "PASSIVE", description: "Gây sát thương độc theo thời gian." }
    ]
  },
  "Lôi Thỏ": {
    id: "loi_tho",
    name: "Lôi Thỏ",
    level: "LOW",
    bloodlineType: "Phàm Huyết",
    diet: "herbivore",
    basePower: 0.1,
    reproduction: 0.6,
    rarity: "common",
    habitat: ["Phàm Giới", "Trung Linh Vực"],
    instinct: { hunger: 0.4, aggression: 0.1, caution: 0.9, territorial: 0.1, pack: 0.4, bloodline: 0.1 },
    description: "Thỏ sấm, nhút nhát nhưng có thể phóng điện tê liệt kẻ thù để bỏ chạy.",
    lootTable: [
      { itemId: "loi_mao", chance: 0.9, minAmount: 1, maxAmount: 4 },
      { itemId: "tho_thit", chance: 0.6, minAmount: 1, maxAmount: 2 }
    ],
    element: "LOI",
    hp: 80,
    mp: 30,
    attack: 15,
    defense: 10,
    speed: 100,
    realm: "Luyện Khí (Sơ kỳ)",
    activeSkills: [
      { id: "giat_dien", name: "Phóng Điện", type: "ACTIVE", baseDamage: 20, scaling: 1.0, element: "LOI", cost: 5, cooldown: 2 }
    ],
    passiveSkills: [
        { id: "ne_tranh", name: "Nhanh Nhẹn", type: "PASSIVE", description: "Tăng 5% né tránh." }
    ]
  },
  "Thi Hổ": {
    id: "thi_ho",
    name: "Thi Hổ",
    level: "MID",
    bloodlineType: "Linh Huyết",
    diet: "carnivore",
    basePower: 0.8,
    reproduction: 0.05,
    rarity: "elite",
    habitat: ["Huyết Sát Vực", "Cửu Âm Tuyệt Địa"],
    instinct: { hunger: 0.9, aggression: 1.0, caution: 0.1, territorial: 0.5, pack: 0.0, bloodline: 0.0 },
    description: "Hổ chết sống lại nhờ oán khí, không biết sợ hãi, chỉ biết khát máu.",
    lootTable: [
      { itemId: "thi_dan", chance: 0.7, minAmount: 1, maxAmount: 2 },
      { itemId: "o_nhiem_ho_cot", chance: 0.6, minAmount: 1, maxAmount: 3 }
    ],
    element: "AM",
    hp: 600,
    mp: 50,
    attack: 90,
    defense: 60,
    speed: 40,
    realm: "Trúc Cơ (Đại viên mãn)",
    activeSkills: [
      { id: "thi_doc_trao", name: "Thi Độc Trảo", type: "ACTIVE", baseDamage: 120, scaling: 1.3, element: "AM", cost: 30, cooldown: 4 }
    ],
    passiveSkills: [
        { id: "bat_tu_tan", name: "Thân Xác Cứng Cỏi", type: "PASSIVE", description: "Kháng 10% sát thương vật lý." }
    ]
  },
  "Băng Linh Điểu": {
    id: "bang_linh_dieu",
    name: "Băng Linh Điểu",
    level: "MID",
    bloodlineType: "Linh Huyết",
    diet: "omnivore",
    basePower: 0.6,
    reproduction: 0.3,
    rarity: "rare",
    habitat: ["Bắc Hàn Vực", "Cửu Âm Tuyệt Địa"],
    instinct: { hunger: 0.4, aggression: 0.3, caution: 0.8, territorial: 0.4, pack: 0.2, bloodline: 0.3 },
    description: "Chim băng, cánh mang hàn khí, thường bay lượn ở địa cực.",
    lootTable: [
      { itemId: "bang_linh_vu", chance: 0.8, minAmount: 1, maxAmount: 3 },
      { itemId: "bang_tinh", chance: 0.3, minAmount: 1, maxAmount: 1 }
    ],
    element: "BANG",
    hp: 300,
    mp: 200,
    attack: 50,
    defense: 30,
    speed: 90,
    realm: "Trúc Cơ (Trung kỳ)",
    activeSkills: [
      { id: "bang_vu", name: "Băng Vũ", type: "ACTIVE", baseDamage: 70, scaling: 1.1, element: "BANG", cost: 40, cooldown: 3 }
    ],
    passiveSkills: [
        { id: "bang_khi", name: "Hàn Khí Tỏa Ra", type: "PASSIVE", description: "Giảm 5 tốc độ kẻ địch xung quanh." }
    ]
  },
  "Địa Long Thú": {
    id: "dia_long_thu",
    name: "Địa Long Thú",
    level: "HIGH",
    bloodlineType: "Cổ Huyết",
    diet: "herbivore",
    basePower: 0.9,
    reproduction: 0.1,
    rarity: "elite",
    habitat: ["Nam Hoang Vực", "Vạn Thú Sơn Mạch"],
    instinct: { hunger: 0.6, aggression: 0.4, caution: 0.5, territorial: 0.7, pack: 0.0, bloodline: 0.5 },
    description: "Thú đất khổng lồ, da dày như đá, chuyên đào hang sâu.",
    lootTable: [
      { itemId: "dia_long_linh_giap", chance: 0.6, minAmount: 1, maxAmount: 1 },
      { itemId: "tho_tinh", chance: 0.5, minAmount: 1, maxAmount: 2 }
    ],
    element: "THO",
    hp: 1500,
    mp: 100,
    attack: 70,
    defense: 200,
    speed: 20,
    realm: "Trúc Cơ (Đại viên mãn)",
    activeSkills: [
      { id: "dia_chan", name: "Địa Chấn", type: "ACTIVE", baseDamage: 120, scaling: 1.6, element: "THO", cost: 50, cooldown: 5 }
    ],
    passiveSkills: [
        { id: "da_day", name: "Da Dày", type: "PASSIVE", description: "Kháng 30% sát thương vật lý." }
    ]
  },
  "Hỏa Vân Kỳ Lân": {
    id: "hoa_van_ky_lan",
    name: "Hỏa Vân Kỳ Lân",
    level: "LORD",
    bloodlineType: "Thánh Huyết",
    diet: "herbivore",
    basePower: 0.96,
    reproduction: 0.005,
    rarity: "boss",
    habitat: ["Viêm Sơn Cốc", "Hỏa Linh Địa Mạch"],
    instinct: { hunger: 0.2, aggression: 0.4, caution: 0.6, territorial: 0.9, pack: 0.0, bloodline: 0.95 },
    description: "Thần thú mang trong mình chân hỏa, xuất hiện điềm lành.",
    lootTable: [
      { itemId: "hoa_van_lan_giac", chance: 1.0, minAmount: 1, maxAmount: 1 }
    ],
    element: "HOA",
    hp: 8000,
    mp: 3000,
    attack: 500,
    defense: 400,
    speed: 120,
    realm: "Hóa Thần (Trung kỳ)",
    activeSkills: [
      { id: "chan_hoa_phun", name: "Chân Hỏa Phun", type: "ACTIVE", baseDamage: 600, scaling: 2.5, element: "HOA", cost: 300, cooldown: 6 },
      { id: "hoa_van_giap", name: "Hỏa Vân Giáp", type: "ACTIVE", baseDamage: 0, scaling: 0, element: "HOA", cost: 100, cooldown: 8 }
    ],
    passiveSkills: [
        { id: "hoa_than", name: "Hỏa Thân", type: "PASSIVE", description: "Kháng 80% sát thương hỏa." }
    ]
  },
  "Phệ Hồn Ma Bướm": {
    id: "phe_hon_ma_buom",
    name: "Phệ Hồn Ma Bướm",
    level: "HIGH",
    bloodlineType: "Linh Huyết",
    diet: "carnivore",
    basePower: 0.75,
    reproduction: 0.2,
    rarity: "elite",
    habitat: ["Ma Sát Quỷ Vực", "Vong Linh Chi Uyên"],
    instinct: { hunger: 0.8, aggression: 0.6, caution: 0.5, territorial: 0.3, pack: 0.6, bloodline: 0.4 },
    description: "Bướm ma cổ có khả năng hút linh hồn tu sĩ.",
    lootTable: [
      { itemId: "ma_buom_phan", chance: 0.5, minAmount: 1, maxAmount: 3 },
      { itemId: "hon_phach_dan", chance: 0.3, minAmount: 1, maxAmount: 1 }
    ],
    element: "AM",
    hp: 400,
    mp: 800,
    attack: 100,
    defense: 50,
    speed: 150,
    realm: "Trúc Cơ (Đại viên mãn)",
    activeSkills: [
      { id: "hon_stabs", name: "Phệ Hồn Thứ", type: "ACTIVE", baseDamage: 100, scaling: 1.5, element: "AM", cost: 60, cooldown: 3 },
      { id: "noi_so", name: "Nỗi Sợ Hãi", type: "ACTIVE", baseDamage: 0, scaling: 0, element: "AM", cost: 40, cooldown: 5 }
    ],
    passiveSkills: [
        { id: "ma_anh", name: "Ma Ảnh", type: "PASSIVE", description: "Tăng 20% né tránh." }
    ]
  },
  "Huyền Minh Qui xà": {
    id: "huyen_minh_qui_xa",
    name: "Huyền Minh Qui xà",
    level: "HIGH",
    bloodlineType: "Linh Huyết",
    diet: "carnivore",
    basePower: 0.88,
    reproduction: 0.03,
    rarity: "elite",
    habitat: ["Cổ Hải Chi Để", "Bắc Hải Vực"],
    instinct: { hunger: 0.4, aggression: 0.5, caution: 0.7, territorial: 0.8, pack: 0.0, bloodline: 0.6 },
    description: "Sinh vật cổ đại mang hình dáng quy xà, kiểm soát dòng nước và hàn khí.",
    lootTable: [
      { itemId: "huyen_minh_linh_dan", chance: 0.5, minAmount: 1, maxAmount: 1 }
    ],
    element: "THUY",
    hp: 2000,
    mp: 600,
    attack: 120,
    defense: 250,
    speed: 30,
    realm: "Trúc Cơ (Đại viên mãn)",
    activeSkills: [
      { id: "huyen_minh_thuy", name: "Huyền Minh Thủy Tế", type: "ACTIVE", baseDamage: 150, scaling: 1.5, element: "THUY", cost: 60, cooldown: 4 }
    ],
    passiveSkills: [
        { id: "thuy_kiem", name: "Thủy Kiếm Hộ Thể", type: "PASSIVE", description: "Phản lại 10% sát thương." }
    ]
  }
};
