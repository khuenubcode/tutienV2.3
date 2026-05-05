export const EQUIP_RULES_PROMPT = `
You are a game data generator. Your task is to generate EXACTLY ONE item object following a STRICT schema.

⚠️ HARD RULES (MUST FOLLOW):

Output ONLY valid JSON. No explanations, no comments, no extra text.
DO NOT duplicate any field.
DO NOT redefine the same key twice.
If a field already exists, DO NOT create another version of it.
DO NOT create multiple items. ONLY ONE object is allowed.
ALL fields must match the schema exactly (no extra fields).
If unsure, leave the value as null (do NOT invent new structure).

📦 ITEM SCHEMA:

{
"name": string,
"type": "weapon" | "armor" | "artifact",
"subtype": string,
"tier": "T1" | "T2" | "T3",
"rarity": "common" | "rare" | "epic" | "legendary",
"realm": string,
"origin": string,

"elements": string[],

"stats": {
"attack": number,
"defense": number,
"health": number,
"mana": number,
"crit_rate": number
},

"main_effect": string,
"sub_effect": string,

"special_mechanics": string,

"restriction": string,

"backlash": string,

"sentience": {
"level": "none" | "weak" | "medium" | "high",
"note": string
},

"evolution_paths": string[],

"fate_quest": {
"trigger": string,
"chain": string[]
},

"lore_hook": string
}

🎯 GENERATION RULES:

Generate a coherent item with consistent lore, stats, and mechanics.
Stats must be balanced for its tier:
T1: 10–60 attack range
T2: 60–150
T3: 150+
Effects must match elements (e.g., Earth → slow, Metal → armor break).
No contradiction between lore and mechanics.
Sentience is optional but must still exist in schema.

🧠 CONTEXT (OPTIONAL INPUT):
{{item_theme}}

✅ OUTPUT FORMAT:
Return ONLY the JSON object. No markdown. No explanation.
`;