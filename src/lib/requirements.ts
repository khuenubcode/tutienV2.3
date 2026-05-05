import { PlayerState, Realm } from '../types';

export const checkRequirements = (requirements: string[], state: PlayerState, realms: Realm[]): { met: boolean; reason?: string } => {
  for (const req of requirements) {
    const parts = (req || '').split(':');
    if (parts.length < 2) continue;
    
    const type = parts[0].trim();
    const value = parts[1].trim();
    
    switch (type.toLowerCase()) {
      case 'realm':
        const requiredRealm = realms.find(r => r.name === value);
        const currentRealm = realms.find(r => r.name === state.realm);
        if (requiredRealm && currentRealm && currentRealm.level < requiredRealm.level) {
          return { met: false, reason: `Cảnh giới yêu cầu tối thiểu: ${value}` };
        }
        break;
      case 'linh thạch':
        const stones = state.inventory.find(i => i.id === 'linh_thach_ha_pham')?.amount || 0;
        if (stones < parseInt(value)) {
          return { met: false, reason: `Yêu cầu ít nhất ${value} Linh Thạch` };
        }
        break;
      case 'karma':
        if (value.startsWith('<')) {
          const val = parseInt(value.replace('<', '').trim());
          if (state.karma >= val) return { met: false, reason: `Yêu cầu Karma thấp hơn ${val}` };
        } else if (value.startsWith('>')) {
          const val = parseInt(value.replace('>', '').trim());
          if (state.karma <= val) return { met: false, reason: `Yêu cầu Karma cao hơn ${val}` };
        }
        break;
      case 'background':
        if (state.background !== value) {
          return { met: false, reason: `Yêu cầu xuất thân: ${value}` };
        }
        break;
      case 'talent':
        if (state.talent !== value) {
          return { met: false, reason: `Yêu cầu thiên phú: ${value}` };
        }
        break;
      case 'level':
        if (state.realmLevel < parseInt(value)) {
          return { met: false, reason: `Yêu cầu cấp độ tối thiểu: ${value}` };
        }
        break;
    }
  }
  return { met: true };
};
