/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface OrgAction {
  id: string;
  name: string;
  contributionCost: number;
  description: string;
  benefitType: 'DISCOUNT' | 'INFO' | 'STEALTH' | 'RESOURCE';
}

export interface OrgMission {
  id: string;
  name: string;
  difficulty: number;
  requirements: string[];
  rewardContribution: number;
  rewardReputation: number;
  rewardItems: string[];
}

export const ORG_MECHANICS = {
  actions: {
    'TRADE_LICENSE': { id: 'trade', name: 'Gia hạn giấy phép thông thương', contributionCost: 100, description: 'Tăng quyền hạn mua bán đồ hiếm', benefitType: 'DISCOUNT' },
    'GATHER_INTEL': { id: 'intel', name: 'Truy cập kho tin tức mật', contributionCost: 150, description: 'Biết trước vị trí xuất hiện của dị bảo', benefitType: 'INFO' },
    'SHADOW_WALK': { id: 'stealth', name: 'Rèn luyện kỹ năng ẩn mình', contributionCost: 200, description: 'Giảm khả năng bị NPC phát hiện khi làm việc xấu', benefitType: 'STEALTH' },
    'ROYAL_PATROL': { id: 'patrol', name: 'Tham gia tuần tra kinh thành', contributionCost: 50, description: 'Nhận được sự tín nhiệm của quan phủ', benefitType: 'RESOURCE' },
  } as Record<string, OrgAction>
};

export const getOrgInteractions = (orgName: string) => {
  switch (orgName) {
    case 'Thiên Bảo Lâu':
      return {
        specialty: 'Thanh Thế & Tài Lộc',
        missions: [
          { id: 'tbl_m1', name: 'Vận chuyển hàng hóa liên thành', difficulty: 2, requirements: [], rewardContribution: 100, rewardReputation: 50, rewardItems: ['Linh Thạch x20'] },
          { id: 'tbl_m2', name: 'Tìm kiếm Linh Dược nghìn năm', difficulty: 4, requirements: ['realm:Trúc Cơ Kỳ'], rewardContribution: 400, rewardReputation: 150, rewardItems: ['Linh Thạch x100', 'Tụ Linh Đan'] },
          { id: 'tbl_m3', name: 'Đại hội đấu giá bảo vệ', difficulty: 5, requirements: ['realm:Trúc Cơ Trung Kỳ'], rewardContribution: 800, rewardReputation: 300, rewardItems: ['Kim Nguyên Bảo'] }
        ]
      };
    case 'Thần Bí Các':
      return {
        specialty: 'Tri Thức & Thiên Cơ',
        missions: [
          { id: 'sbc_m1', name: 'Do thám tông môn bí mật', difficulty: 3, requirements: [], rewardContribution: 150, rewardReputation: 70, rewardItems: ['Ngọc Giản Truyền Tin'] },
          { id: 'sbc_m2', name: 'Giải mã cổ tự cấm địa', difficulty: 5, requirements: ['intelligence:60'], rewardContribution: 500, rewardReputation: 200, rewardItems: ['Bản Đồ Bí Cảnh'] },
          { id: 'sbc_m3', name: 'Truy tìm tung tích Tà Tu', difficulty: 4, requirements: ['realm:Trúc Cơ Kỳ'], rewardContribution: 350, rewardReputation: 120, rewardItems: ['Mật Thư'] }
        ]
      };
    case 'Huyết Nguyệt Lâu':
      return {
        specialty: 'Hành Thích & Ám Sát',
        missions: [
          { id: 'hnl_m1', name: 'Thanh trừng phản đồ cấp thấp', difficulty: 2, requirements: [], rewardContribution: 120, rewardReputation: 40, rewardItems: ['Độc châm'] },
          { id: 'hnl_m2', name: 'Ám sát Trưởng lão ngoại môn', difficulty: 6, requirements: ['realm:Trúc Cơ Kỳ'], rewardContribution: 700, rewardReputation: 250, rewardItems: ['Huyết Sát Kiếm', 'Đoạt Mệnh Đan'] },
          { id: 'hnl_m3', name: 'Lấy thủ cấp Tặc Vương', difficulty: 5, requirements: ['realm:Trúc Cơ Sơ Kỳ'], rewardContribution: 500, rewardReputation: 180, rewardItems: ['Hắc Y Sát Thủ'] }
        ]
      };
    case 'Đại Việt Hoàng Tộc':
      return {
        specialty: 'Quyền Lực & Trật Tự',
        missions: [
          { id: 'dvht_m1', name: 'Dẹp loạn thổ phỉ vùng biên', difficulty: 3, requirements: ['level:15'], rewardContribution: 200, rewardReputation: 100, rewardItems: ['Hoàng Kim Giáp'] },
          { id: 'dvht_m2', name: 'Hộ tống Công chúa du ngoạn', difficulty: 4, requirements: ['realm:Trúc Cơ Kỳ'], rewardContribution: 450, rewardReputation: 200, rewardItems: ['Hoàng Tộc Lệnh'] },
          { id: 'dvht_m3', name: 'Thống lĩnh vạn quân viễn chinh', difficulty: 7, requirements: ['realm:Kim Đan Kỳ'], rewardContribution: 2000, rewardReputation: 800, rewardItems: ['Trấn Quốc Bảo Kiếm'] }
        ]
      };
    default:
      return {
        specialty: 'Tự Do',
        missions: [
          { id: 'free_m1', name: 'Giúp đỡ dân làng', difficulty: 1, requirements: [], rewardContribution: 20, rewardReputation: 10, rewardItems: ['Lương thực'] },
          { id: 'free_m2', name: 'Tiêu diệt dã thú quanh thành', difficulty: 2, requirements: [], rewardContribution: 50, rewardReputation: 25, rewardItems: ['Thịt thú'] }
        ]
      };
  }
};
