
export type BeastBloodlineType = 'Phàm Huyết' | 'Linh Huyết' | 'Cổ Huyết' | 'Thần Huyết' | 'Thánh Huyết';

export interface BeastSpecies {
  name: string;
  category: string; // e.g., 'Yêu Thú', 'Linh Thú', 'Hung Thú', 'Thần Thú'
  bloodline: BeastBloodlineType;
  maxRealm: string; // The typical highest realm this species can reach without mutation
  habitat: string[]; // Preferred regions or environments
  traits: string[]; // Special characteristics
  description: string;
}

export const BEAST_DATA: BeastSpecies[] = [
  {
    name: 'Thanh Phong Lang',
    category: 'Yêu Thú',
    bloodline: 'Phàm Huyết',
    maxRealm: 'Luyện Khí (Đỉnh phong)',
    habitat: ['Thanh Thạch Thành Ngoại Vi', 'Thanh Phong Lâm'],
    traits: ['Tốc độ cực nhanh', 'Săn mồi theo đàn'],
    description: 'Loài sói mang thuộc tính phong, thường xuất hiện ở bìa rừng.'
  },
  {
    name: 'Xích Diễm Hổ',
    category: 'Yêu Thú',
    bloodline: 'Linh Huyết',
    maxRealm: 'Trúc Cơ (Trung kỳ)',
    habitat: ['Vạn Thú Sơn', 'Hỏa Vân Động'],
    traits: ['Lực bộc phát hỏa diễm', 'Sát khí nặng'],
    description: 'Hổ lửa hung dữ, vằn trên lưng phát ra ánh sáng đỏ rực.'
  },
  {
    name: 'Hàn Băng Mãng',
    category: 'Linh Thú',
    bloodline: 'Linh Huyết',
    maxRealm: 'Trúc Cơ (Đại viên mãn)',
    habitat: ['Hàn Băng Thâm Uyên', 'Bắc Cực Băng Nguyên'],
    traits: ['Đóng băng con mồi', 'Vảy cứng như sắt'],
    description: 'Mãng xà khổng lồ sống trong hang lạnh, hơi thở có thể đóng băng vạn vật.'
  },
  {
    name: 'Cửu Thiên Thần Bằng',
    category: 'Thần Thú',
    bloodline: 'Thần Huyết',
    maxRealm: 'Đại Chu Thiên (Hóa Thần)',
    habitat: ['Vô Tận Hư Không', 'Thiên Đình Di Tích'],
    traits: ['Một sải cánh vạn dặm', 'Khống chế thiên lôi'],
    description: 'Sinh vật huyền thoại cư ngụ trên chín tầng mây, là bá chủ bầu trời.'
  },
  {
    name: 'Thôn Phệ Ma Nghê',
    category: 'Hung Thú',
    bloodline: 'Cổ Huyết',
    maxRealm: 'Kim Đan (Trung kỳ)',
    habitat: ['Ma Sát Quỷ Vực', 'Vong Linh Chi Uyên'],
    traits: ['Thôn phệ linh lực', 'Thân thể bất tử (tương đối)'],
    description: 'Dị chủng thái cổ, chuyên hút linh khí của tu sĩ và yêu thú khác.'
  },
  {
    name: 'Nguyên Vương Thạch Quy',
    category: 'Linh Thú',
    bloodline: 'Thánh Huyết',
    maxRealm: 'Nguyên Anh (Đỉnh phong)',
    habitat: ['Thiên Sơn Đỉnh', 'Cổ Hải Chi Để'],
    traits: ['Phòng ngự tuyệt đối', 'Thọ mệnh vạn năm'],
    description: 'Linh quy mang trong mình dòng máu thánh hiền, thường hóa thân thành hòn đá khổng lồ để tu luyện.'
  },
  {
    name: 'Ngân Nguyệt Lang',
    category: 'Yêu Thú',
    bloodline: 'Linh Huyết',
    maxRealm: 'Trúc Cơ (Đại viên mãn)',
    habitat: ['Rừng Rậm Cổ Xưa', 'Nguyệt Quang Lâm'],
    traits: ['Agile', 'Pack Hunter'],
    description: 'Lang vương mang dòng máu nguyệt quang, linh hoạt như gió, chuyên săn mồi dưới ánh trăng.'
  },
  {
    name: 'Hắc Diệm Thú',
    category: 'Hung Thú',
    bloodline: 'Cổ Huyết',
    maxRealm: 'Kim Đan (Đỉnh phong)',
    habitat: ['Hang Động Núi Lửa', 'Hỏa Vực Tuyệt Địa'],
    traits: ['Fire Aura', 'Corrupted Bloodline'],
    description: 'Thú dữ cổ đại, toàn thân bao phủ bởi hắc hỏa mang tà khí, dòng máu bị ô nhiễm nhưng sức mạnh vô cùng đáng sợ.'
  },
  {
    name: 'Thiên Cơ Phượng Hoàng',
    category: 'Thần Thú',
    bloodline: 'Thánh Huyết',
    maxRealm: 'Hóa Thần (Đỉnh phong)',
    habitat: ['Thiên Cung', 'Tiên Vực'],
    traits: ['Divine Power', 'Elemental Master'],
    description: 'Phượng hoàng thần thánh, điều khiển nguyên tố từ thuở khai thiên, mang uy năng tối thượng của thiên cơ.'
  },
  {
    name: 'Lôi Thỏ',
    category: 'Yêu Thú',
    bloodline: 'Phàm Huyết',
    maxRealm: 'Luyện Khí (Trung kỳ)',
    habitat: ['Đồng Cỏ Nguyên Sinh'],
    traits: ['Fast', 'Electric Burst'],
    description: 'Thỏ mang thuộc tính lôi, tốc độ rất nhanh, khi nguy cấp có thể phát ra điện năng.'
  },
  {
    name: 'Địa Long Thú',
    category: 'Hung Thú',
    bloodline: 'Cổ Huyết',
    maxRealm: 'Kim Đan (Sơ kỳ)',
    habitat: ['Dãy Núi Cổ Đại'],
    traits: ['Thick Hide', 'Earth Tremor'],
    description: 'Thú đất to lớn, da cứng như đá, mỗi bước đi làm mặt đất rung chuyển.'
  },
  {
    name: 'Băng Linh Điểu',
    category: 'Linh Thú',
    bloodline: 'Linh Huyết',
    maxRealm: 'Trúc Cơ (Đại viên mãn)',
    habitat: ['Đỉnh Núi Băng Giá'],
    traits: ['Agile', 'Ice Shard'],
    description: 'Chim linh vật hệ băng, có thể phóng ra băng tiễn sắc bén.'
  }
];

export const getBeastByBloodline = (bloodline: BeastBloodlineType) => 
  BEAST_DATA.filter(b => b.bloodline === bloodline);

export const getBeastByHabitat = (habitat: string) =>
  BEAST_DATA.filter(b => b.habitat.some(h => h.includes(habitat)));
