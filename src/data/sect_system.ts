// src/data/sect_system.ts

export type SectRank = 
  | 'NGOAI_MON'      // Ngoại môn 
  | 'NOI_MON'        // Nội môn
  | 'NONG_COT'       // Nòng cốt
  | 'TRUONG_LAO'     // Trưởng lão
  | 'TONG_CHU'       // Tông chủ

export interface SectAction {
  id: string;
  name: string;
  contributionCost: number;
  description: string;
}

export interface SectMission {
  id: string;
  name: string;
  difficulty: number;
  requirements: string[]; // e.g., ["realm:Trúc Cơ Kỳ"]
  rewardContribution: number;
  rewardReputation: number; // Added for consistency
  rewardItems: string[];
}

export interface SectRankInfo {
  id: SectRank;
  name: string;
  requirementReputation: number;
  benefits: {
    tuViMultiplier: number; // Thưởng tu vi mỗi lần tập luyện
    monthlyLinhThach: number; // Tài nguyên nhận hàng tháng
    accessRestrictedAreas: boolean; // Vào khu vực cấm địa
    exclusiveTechniques: boolean; // Học kỹ năng bí truyền
  };
}

export const SECT_MECHANICS = {
  ranks: [
    { 
      id: 'NGOAI_MON', 
      name: 'Đệ tử Ngoại môn', 
      requirementReputation: 0,
      benefits: { tuViMultiplier: 1.0, monthlyLinhThach: 10, accessRestrictedAreas: false, exclusiveTechniques: false }
    },
    { 
      id: 'NOI_MON', 
      name: 'Đệ tử Nội môn', 
      requirementReputation: 200,
      benefits: { tuViMultiplier: 1.5, monthlyLinhThach: 50, accessRestrictedAreas: false, exclusiveTechniques: true }
    },
    { 
      id: 'NONG_COT', 
      name: 'Đệ tử Nòng cốt', 
      requirementReputation: 1000,
      benefits: { tuViMultiplier: 2.5, monthlyLinhThach: 200, accessRestrictedAreas: true, exclusiveTechniques: true }
    },
    { 
      id: 'TRUONG_LAO', 
      name: 'Trưởng lão', 
      requirementReputation: 5000,
      benefits: { tuViMultiplier: 5.0, monthlyLinhThach: 1000, accessRestrictedAreas: true, exclusiveTechniques: true }
    },
    { 
      id: 'TONG_CHU', 
      name: 'Tông chủ', 
      requirementReputation: 20000,
      benefits: { tuViMultiplier: 10.0, monthlyLinhThach: 5000, accessRestrictedAreas: true, exclusiveTechniques: true }
    },
  ] as SectRankInfo[],
  
  actions: {
    'TRAIN': { id: 'train', name: 'Tu luyện tại bí cảnh tông môn', contributionCost: 50, description: 'Tăng tốc độ tu luyện dựa trên cấp bậc' },
    'COLLECT_RESOURCES': { id: 'collect', name: 'Lãnh bổng lộc hàng tháng', contributionCost: 0, description: 'Nhận Linh Thạch và tài nguyên tu luyện' },
    'UPGRADE_TECHNIQUE': { id: 'upgrade', name: 'Đổi công pháp bí truyền', contributionCost: 800, description: 'Học công pháp cấp cao của tông môn' },
    'MEDITATION': { id: 'meditation', name: 'Tĩnh tọa tham ngộ', contributionCost: 100, description: 'Có cơ hội nhận được tâm đắc võ học' },
  }
};

export const getSectInteractions = (sectName: string) => {
    switch(sectName) {
        case 'Hoàng Phong Cốc':
            return {
                specialty: 'Luyện Khí',
                missions: [
                    { id: 'hpc_task1', name: 'Thu hoạch Linh Thảo', difficulty: 1, requirements: [], rewardContribution: 50, rewardReputation: 10, rewardItems: ['Linh Thảo Low'] },
                    { id: 'hpc_task2', name: 'Bảo vệ lò luyện đan', difficulty: 3, requirements: ['realm:Luyện Khí Viên Mãn'], rewardContribution: 200, rewardReputation: 40, rewardItems: ['Trúc Cơ Đan'] },
                    { id: 'hpc_task3', name: 'Thanh trừng phản đồ', difficulty: 4, requirements: ['realm:Trúc Cơ Kỳ'], rewardContribution: 400, rewardReputation: 100, rewardItems: ['Hoàng Phong Thần Chu'] },
                    { id: 'hpc_task4', name: 'Khảo sát Huyết Sắc Cấm Địa', difficulty: 6, requirements: ['realm:Trúc Cơ Trung Kỳ'], rewardContribution: 1000, rewardReputation: 300, rewardItems: ['Huyết Tinh Thảo', 'Thăng Tiên Lệnh'] }
                ]
            };
        case 'Thanh Vân Môn':
            return {
                specialty: 'Kiếm Đạo',
                missions: [
                    { id: 'tvm_task1', name: 'Luyện kiếm ý', difficulty: 2, requirements: [], rewardContribution: 70, rewardReputation: 15, rewardItems: ['Kiếm phách'] },
                    { id: 'tvm_task2', name: 'Trừ ma vệ đạo', difficulty: 4, requirements: ['realm:Trúc Cơ Kỳ'], rewardContribution: 300, rewardReputation: 80, rewardItems: ['Kiếm quyết bí truyền'] },
                    { id: 'tvm_task3', name: 'Tuần tra thông lộ', difficulty: 2, requirements: [], rewardContribution: 100, rewardReputation: 25, rewardItems: ['Nguyên thạch'] },
                    { id: 'tvm_task4', name: 'Trấn giữ Thông Thiên Phong', difficulty: 7, requirements: ['realm:Kết Đan Kỳ'], rewardContribution: 1500, rewardReputation: 500, rewardItems: ['Tru Tiên Kiếm Khí'] }
                ]
            };
        case 'Thiên Sát Tông':
            return {
                specialty: 'Sát Phạt',
                missions: [
                    { id: 'tst_task1', name: 'Thu thập Huyết Khí', difficulty: 2, requirements: [], rewardContribution: 80, rewardReputation: 20, rewardItems: ['Tà khí'] },
                    { id: 'tst_task2', name: 'Ám sát tông môn đối địch', difficulty: 5, requirements: ['realm:Trúc Cơ Kỳ'], rewardContribution: 500, rewardReputation: 150, rewardItems: ['Máu yêu thú quý'] },
                    { id: 'tst_task3', name: 'Tế lễ Ma Thần', difficulty: 3, requirements: [], rewardContribution: 150, rewardReputation: 40, rewardItems: ['Ma tinh'] },
                    { id: 'tst_task4', name: 'Lãnh đạo ma triều', difficulty: 8, requirements: ['realm:Kết Đan Kỳ'], rewardContribution: 2000, rewardReputation: 600, rewardItems: ['Sát Thần Lệnh'] }
                ]
            };
        default:
            return { 
                specialty: 'Chung', 
                missions: [
                    { id: 'gen_task1', name: 'Tạp dịch tông môn', difficulty: 1, requirements: [], rewardContribution: 30, rewardReputation: 5, rewardItems: ['Linh Thạch Vụn'] },
                    { id: 'gen_task2', name: 'Luyện tập đối kháng', difficulty: 2, requirements: [], rewardContribution: 60, rewardReputation: 15, rewardItems: ['Thối Thể Đan'] }
                ] 
            };
    }
};
