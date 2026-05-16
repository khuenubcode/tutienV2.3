import { GoogleGenAI, Type, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { PlayerState, GameHistoryItem, NPC, InventoryItem } from "../types";
import { TALK_RULES } from "../../Promtp/TalkRule";
import { NPC_AGE_RULES } from "../../Promtp/AgeRule";
import { SEXUAL_POSE_RULES } from "../../Promtp/sexualPoseRule";
import { LOGIC_NFSW } from "../../Promtp/logicNFSW";

export interface AIUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  proPromptTokens: number;
  proCompletionTokens: number;
  flashPromptTokens: number;
  flashCompletionTokens: number;
}

let sessionUsage: AIUsage = {
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  proPromptTokens: 0,
  proCompletionTokens: 0,
  flashPromptTokens: 0,
  flashCompletionTokens: 0
};

export function getSessionUsage(): AIUsage {
  return { ...sessionUsage };
}

export function resetSessionUsage() {
  sessionUsage = {
    promptTokens: 0,
    completionTokens: 0,
    totalTokens: 0,
    proPromptTokens: 0,
    proCompletionTokens: 0,
    flashPromptTokens: 0,
    flashCompletionTokens: 0
  };
}

function getAllKeys(customApiKey?: string, preferCustomKey: boolean = true): string[] {
  const defaultGeminiKey = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") || "";
  
  // Split potential multiple keys (comma or newline or semicolon)
  const rawKeys = customApiKey || "";
  const customKeys = rawKeys
    .split(/[,\n;]+/) // Use + to handle multiple delimiters
    .map(k => k.trim())
    .filter(k => k !== "");
    
  let keys: string[] = [];
  
  if (preferCustomKey) {
    if (customKeys.length > 0) {
      keys = [...customKeys];
      // Always keep default key as ultimate fallback at the end if not already provided
      if (defaultGeminiKey && !keys.includes(defaultGeminiKey)) {
        keys.push(defaultGeminiKey);
      }
    } else if (defaultGeminiKey) {
      keys = [defaultGeminiKey];
    }
  } else {
    // Favor default key first
    if (defaultGeminiKey) {
      keys.push(defaultGeminiKey);
    }
    customKeys.forEach(k => {
      if (!keys.includes(k)) keys.push(k);
    });
  }
  
  // Deduplicate and return
  return Array.from(new Set(keys)).filter(k => k && k.length > 5);
}

async function fetchAIWrapper(
  customApiKey: string,
  prompt: string,
  systemPrompt?: string,
  isJson: boolean = false,
  responseSchema?: any,
  tier: 'flash' | 'pro' = 'flash',
  preferCustomKey: boolean = true
): Promise<string> {
  const keys = getAllKeys(customApiKey, preferCustomKey);
  
  if (keys.length === 0) {
    throw new Error("Không tìm thấy Thiên Cơ (API Key). Bạn có thể thêm Key riêng trong phần Thiết Lập hoặc liên hệ người quản trị.");
  }

  const modelName = tier === 'pro' ? 'gemini-3.1-pro-preview' : 'gemini-3-flash-preview';
  let lastError: any = null;

  // Key performance tracking
  const keyCooldowns = new Set<string>();

  // Try each key in sequence
  for (let i = 0; i < keys.length; i++) {
    const keyToUse = keys[i];
    if (keyCooldowns.has(keyToUse)) continue;

    let currentTier = tier;
    let currentModel = modelName;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      attempts++;
      try {
        const ai = new GoogleGenAI({ apiKey: keyToUse });
        const response = await ai.models.generateContent({
          model: currentModel,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: isJson ? "application/json" : undefined,
            responseSchema: isJson ? responseSchema : undefined,
            maxOutputTokens: 8192, // Increased for longer story segments
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_CIVIC_INTEGRITY, threshold: HarmBlockThreshold.BLOCK_NONE }
            ]
          },
        });

        const usage = response.usageMetadata;

        if (usage) {
          const pTokens = usage.promptTokenCount || 0;
          const cTokens = usage.candidatesTokenCount || 0;
          const tTokens = usage.totalTokenCount || 0;

          sessionUsage.promptTokens += pTokens;
          sessionUsage.completionTokens += cTokens;
          sessionUsage.totalTokens += tTokens;

          if (currentTier === 'pro') {
            sessionUsage.proPromptTokens += pTokens;
            sessionUsage.proCompletionTokens += cTokens;
          } else {
            sessionUsage.flashPromptTokens += pTokens;
            sessionUsage.flashCompletionTokens += cTokens;
          }
        }

        // Check if response contains candidates
        const candidates = (response as any).candidates;
        const resultText = response.text || (candidates?.[0]?.content?.parts?.[0]?.text) || "";
        
        if (isJson && !resultText.trim()) {
          const firstCandidate = candidates?.[0];
          const finishReason = firstCandidate?.finishReason;
          const safetyRatings = firstCandidate?.safetyRatings;
          const promptFeedback = (response as any).promptFeedback;
          
          console.error("Empty AI Response Diagnostic:", {
            finishReason,
            safetyRatings,
            promptFeedback,
            responseKeys: Object.keys(response)
          });
          
          if (finishReason === 'SAFETY' || (promptFeedback && promptFeedback.blockReason === 'SAFETY')) {
            throw new Error("Nội dung bị chặn bởi bộ lọc an toàn của Thiên Cơ. Thiên cơ bất khả lộ, hãy thử đổi cách diễn đạt.");
          }
          
          if (finishReason === 'RECITATION') {
            throw new Error("Mô hình phát hiện nội dung vi phạm bản quyền (RECITATION).");
          }

          throw new Error(`Thiên Cơ im hơi lặng tiếng (Rỗng). Finish Reason: ${finishReason || 'Unknown'}`);
        }

        // Clean markdown code blocks if necessary
        let cleanedText = resultText.trim();
        if (isJson) {
          if (cleanedText.startsWith("```json")) {
            cleanedText = cleanedText.replace(/^```json\n?/, "").replace(/\n?```$/, "");
          } else if (cleanedText.startsWith("```")) {
            cleanedText = cleanedText.replace(/^```\n?/, "").replace(/\n?```$/, "");
          }
        }

        return cleanedText;
      } catch (e: any) {
        lastError = e;
        
        // Extract error message from various possible places in the error object
        let errorMsgText = "";
        if (typeof e === 'string') {
          errorMsgText = e;
        } else if (e.message) {
          errorMsgText = e.message;
        } else if (e.error?.message) {
          errorMsgText = e.error.message;
        } else {
          errorMsgText = JSON.stringify(e);
        }
        
        const lowerError = errorMsgText.toLowerCase();
        const isQuota = lowerError.includes("quota") || 
                        lowerError.includes("limit") || 
                        lowerError.includes("exhausted") || 
                        lowerError.includes("429") || 
                        lowerError.includes("too many requests") ||
                        lowerError.includes("resource_exhausted");

        if (isQuota) {
          // If the key is exhausted for the primary model, try the ultimate fallback model with same key once
          if (currentModel !== 'gemini-3.1-flash-lite') {
            currentModel = 'gemini-3.1-flash-lite';
            continue; 
          }
          
          keyCooldowns.add(keyToUse);
          break; // Move to next key
        } else if (lowerError.includes("500") || lowerError.includes("503") || lowerError.includes("overloaded")) {
          // Server error, wait a tiny bit and retry same model/key if attempts left
          await new Promise(resolve => setTimeout(resolve, 100 * attempts));
          continue;
        } else {
          console.warn(`Lỗi với key ${keyToUse.slice(0, 8)}...:`, errorMsgText);
          break; // Other errors: move to next key
        }
      }
    }
  }

  // If we reach here, it means all keys failed
  const finalErrorObj = lastError;
  let finalErrorMsgText = "";
  
  if (typeof finalErrorObj === 'string') {
    finalErrorMsgText = finalErrorObj;
  } else if (finalErrorObj?.message) {
    finalErrorMsgText = finalErrorObj.message;
  } else if (finalErrorObj?.error?.message) {
    finalErrorMsgText = finalErrorObj.error.message;
  } else {
    finalErrorMsgText = JSON.stringify(finalErrorObj);
  }

  const finalLower = finalErrorMsgText.toLowerCase();
  
  if (finalLower.includes("quota") || finalLower.includes("limit") || finalLower.includes("429") || finalLower.includes("exhausted")) {
    throw new Error("Tất cả Thiên Cơ (API Key) hiện đã đạt giới hạn lưu lượng. Vui lòng chờ vài giây rồi thử lại, hoặc thêm key mới trong phần Thiết Lập.");
  }
  
  throw new Error(finalErrorMsgText || "Thiên Cơ vận hành thất bại.");
}

export async function testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  let testKey = apiKey.split(/[,\n;]+/)[0]?.trim();
  let usingDefault = false;

  if (!testKey) {
    testKey = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") || "";
    usingDefault = true;
  }

  if (!testKey) return { success: false, message: "Không tìm thấy key để kiểm tra (cả custom và mặc định)." };
  
  try {
    const ai = new GoogleGenAI({ apiKey: testKey });
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: 'Test connection' }] }],
    });
    return { 
      success: true, 
      message: usingDefault ? "Kết nối Thiên Cơ (Mặc định) thành công!" : "Kết nối Thiên Cơ thành công!" 
    };
  } catch (error: any) {
    console.error("API Key Test Error:", error);
    let msg = error.message || "Lỗi không xác định";
    if (msg.includes("403") || msg.includes("permission")) msg = "API Key không chính xác hoặc không có quyền truy cập.";
    if (msg.includes("429")) msg = "Key đã đạt giới hạn (Quota).";
    if (msg.includes("API key not found")) msg = "API Key không tồn tại.";
    return { success: false, message: msg };
  }
}

export interface GameResponse {
  story: string;
  actions: { 
    id: number; 
    text: string; 
    chance?: number; // 0-100
    outcome?: { success: string; failure: string };
  }[];
  playerUpdates?: Partial<PlayerState>;
  npcs?: NPC[];
  chronicles?: string;
  weather?: string;
  environmentSummary?: string;
  npcSummary?: string;
  eventSummary?: string;
}

const SYSTEM_PROMPT = `
YOU ARE A SUPREME NOVELIST AND GAME MASTER FOR A TU TIÊN (CULTIVATION) WORLD.

CORE MISSION:
Lead the player through an immersive, choice-based narrative. Focus on high-quality literary descriptions and meaningful consequences for choices.
MANDATORY: Every "story" segment MUST be exceptionally detailed and long, aiming for a minimum of 1000 original words (khoảng 3000-5000 ký tự). Describe the environment, character inner thoughts, atmosphere, and sensory details in great depth. Avoid skipping time or rushing events.

RULES:
1. LANGUAGE: 100% Vietnamese/Sino-Vietnamese (Hán Việt) for story and names. Use an elegant, epic tone.
2. NARRATION: Use "Ngươi" to refer to the protagonist. Describe using multiple senses (Show, don't tell).
3. SYSTEM NOTIFICATIONS: Format as [HỆ THỐNG]: [Nội dung].
4. DIALOGUE: Format as [Tên Nhân Vật]: "Nội dung".
5. CONSISTENCY: Maintain a cohesive world and story progress. 
   - Use 'chronicles' to track long-term memory (key world events).
   - Use 'environmentSummary' for current surroundings.
   - Use 'npcSummary' for NPCs present (name, age, impression).
   - Use 'eventSummary' for current ongoing events/conflicts.
   - IMPORTANT: You MUST update all 3 short-term summaries in every response to reflect the new state of the story.
6. ACTIONS: Provide 3-4 interesting actions. 
   - Each action MUST have a 'chance' (0-100) representing probability of success based on player's current realm and context.
   - Each action SHOULD have a 'outcome' object describing briefly what happens on success/failure to help the user decide.
7. UPDATES: Update player stats appropriately based on what happens in the story (HP, Mana, TU VI, Karma, etc.).
8. NSFW INSTRUCTION: {nsfwInstruction}
9. SCENE POPUP INSTRUCTION: {scenePopupInstruction}
10. QUY TẮC XƯNG HÔ: {talkRules}
11. QUY TẮC NGOẠI HÌNH THEO TUỔI: {ageRules}
12. QUY TẮC TƯ THẾ HOAN LẠC: {sexualPoseRules}
13. PHÁT TRIỂN NSFW VÀ TÍNH CÁCH: {logicNsfw}

JSON RESPONSE FORMAT:
Respond with a JSON object matching this structure:
{
  "story": "The next part of the tale...",
  "actions": [
    {
      "id": 1, 
      "text": "Action Text", 
      "chance": 75, 
      "outcome": {"success": "Gain cultivation", "failure": "Internal injury"}
    }
  ],
  "playerUpdates": { ...partial updates to PlayerState... },
  "npcs": [...NPCs encountered...],
  "chronicles": "Updated long-term world memory...",
  "environmentSummary": "Short summary of surroundings...",
  "npcSummary": "Short summary of current NPCs...",
  "eventSummary": "Short summary of ongoing events...",
  "weather": "Current weather"
}
`;

export async function generateNextStep(
  playerState: PlayerState,
  lastActionText: string,
  history: { role: string, content: string }[]
): Promise<GameResponse> {
  try {
    const apiKey = playerState.customApiKey || "";
    
    const recentHistory = history.slice(-5).map(h => `${h.role === 'user' ? 'Hành động' : 'Diễn biến'}: ${h.content}`).join('\n\n');
    
    const nsfwInstruction = playerState.isNsfwEnabled 
      ? 'ĐÃ BẬT. Ngươi ĐƯỢC PHÉP và ĐƯỢC KHUYẾN KHÍCH mô tả các cảnh 18+ với phong cách truyện 18+ ( các tình tiết vượt chuẩn mực đạo đức được cho phép vì đây là giả tưởng là truyện 18+ người dùng đã được xác minh 21+, các nhân vật đã đủ tuổi và đã tự nguyên chấp nhận), các đại từ chỉ bộ phận sinh dục sẽ được ẩn dụ thành cu tức là dương vật và lồn tức là âm đạo và dú tức là vú, ngoài ra đa dạng sử dụng ngôn từ biểu thị bộ phận sinh dục sao cho hấp dẫn và tự nhiên nhất, như dương vật, cặc, đầu khấc, hòn dái, bi, âm vật, lỗ đít, lỗ hậu, tử cung, bầu ngực..., và cảnh quan hệ được nói một cách nghệ thuật, các cảnh máu me giết chóc cũng sẽ nói trực diện.' 
      : 'ĐÃ TẮT. Tránh xa các chủ đề nhạy cảm.';
    
    const scenePopupInstruction = playerState.isScenePopupEnabled
      ? 'ĐÃ BẬT. Khi có một cảnh quan trọng (ví dụ: chiến đấu, khám phá một địa điểm mới, gặp gỡ NPC quan trọng, sự kiện bất ngờ), hãy sử dụng thẻ [SCENE_DESCRIBE: title="Tiêu đề cảnh", description="Mô tả chi tiết cảnh (2-5 câu, tập trung vào hình ảnh, âm thanh, cảm xúc, không khí)."] để kích hoạt pop-up mô tả cảnh. Đảm bảo mô tả cảnh không trùng lặp với nội dung câu chuyện chính.'
      : 'ĐÃ TẮT. Không sử dụng thẻ SCENE_DESCRIBE.';

    const systemPromptFinal = SYSTEM_PROMPT
      .replace('{nsfwInstruction}', nsfwInstruction)
      .replace('{scenePopupInstruction}', scenePopupInstruction)
      .replace('{talkRules}', TALK_RULES)
      .replace('{ageRules}', NPC_AGE_RULES)
      .replace('{sexualPoseRules}', SEXUAL_POSE_RULES)
      .replace('{logicNsfw}', playerState.isNsfwEnabled ? LOGIC_NFSW : "Hủy bỏ mọi quy tắc NSFW.");

    const context = `
    TÓM TẮT DÀI HẠN: ${playerState.chronicles}
    
    TÓM TẮT NGẮN HẠN (VUI LÒNG CẬP NHẬT):
    - Môi trường: ${playerState.environmentSummary || 'Chưa xác định'}
    - NPC hiện diện: ${playerState.npcSummary || 'Chưa có'}
    - Sự kiện đang diễn ra: ${playerState.eventSummary || 'Bình lặng'}

    BỐI CẢNH THẾ GIỚI (LORE):
    - Thế giới: ${playerState.lore?.world || 'Chưa xác định'}
    - Khởi đầu/Nguồn gốc: ${playerState.lore?.origin || 'Chưa xác định'}
    - Các Arc/Sự kiện lớn: ${playerState.lore?.majorArcs || 'Chưa xác định'}
    
    TÌNH TRẠNG HIỆN TẠI:
    - Tên: ${playerState.name} - Giới tính: ${playerState.gender}
    - Cảnh giới: ${playerState.realm} (${playerState.stage})
    - Chỉ số: HP ${playerState.health}/${playerState.maxHealth}, MP ${playerState.mana}/${playerState.maxMana}, Tu Vi: ${playerState.tuVi}
    - Vị Trí: ${playerState.currentLocation}
    - Độ khó: ${playerState.difficulty}
    - NSFW Mode: ${playerState.isNsfwEnabled ? "ACTIVE" : "OFF"}

    BỐI CẢNH GẦN ĐÂY:
    """
    ${recentHistory}
    """

    HÀNH ĐỘNG MỚI NHẤT: "${lastActionText}"
    `;

    const responseSchemaObj = {
      type: Type.OBJECT,
      required: ["story", "actions"],
      properties: {
        story: { type: Type.STRING },
        actions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["id", "text"],
            properties: {
              id: { type: Type.NUMBER },
              text: { type: Type.STRING },
              chance: { type: Type.NUMBER },
              outcome: {
                type: Type.OBJECT,
                required: ["success", "failure"],
                properties: {
                  success: { type: Type.STRING },
                  failure: { type: Type.STRING }
                }
              }
            }
          }
        },
        playerUpdates: { type: Type.OBJECT },
        npcs: { type: Type.ARRAY, items: { type: Type.OBJECT } },
        chronicles: { type: Type.STRING },
        environmentSummary: { type: Type.STRING },
        npcSummary: { type: Type.STRING },
        eventSummary: { type: Type.STRING },
        weather: { type: Type.STRING }
      }
    };
    
    const tier = playerState.aiTier || 'flash';
    
    const text = await fetchAIWrapper(
       apiKey,
       context,
       systemPromptFinal,
       true,
       responseSchemaObj,
       tier,
       playerState.preferCustomKey
    );
    
    let gameData: GameResponse;
    try {
      gameData = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON Parse Error. Raw text:", text);
      throw new Error("Lỗi xử lý dữ liệu từ Thiên Cơ (JSON Parse Error).");
    }

    // Auto-Expansion Logic: If story is under ~3500 chars (approx 700-800 words), 
    // request a detailed extension to ensure > 1000 words total.
    if (gameData.story.length < 3500) {
      try {
        const expansionContext = `${context}\n\nNỘI DUNG VỪA TẠO:\n${gameData.story}\n\nYÊU CẦU: Hãy viết TIẾP NỐI đoạn trên để MIÊU TẢ CHI TIẾT VÀ SÂU SẮC HƠN về bối cảnh, tâm trạng nhân vật, các chi tiết ẩn dụ hoặc không khí xung quanh. Đoạn bổ sung này phải dài khoảng 500-700 từ (2000-3000 ký tự). Chỉ trả về văn bản mô tả mở rộng, không lặp lại phần cũ.`;
        
        const expansionSchema = {
          type: Type.OBJECT,
          required: ["expansion"],
          properties: {
            expansion: { type: Type.STRING }
          }
        };

        const expansionText = await fetchAIWrapper(
          apiKey,
          expansionContext,
          systemPromptFinal + "\n\nCHÚ Ý: Chỉ trả về JSON với trường 'expansion' chứa nội dung viết tiếp.",
          true,
          expansionSchema,
          tier,
          playerState.preferCustomKey
        );

        const expansionData = JSON.parse(expansionText);
        if (expansionData.expansion) {
          gameData.story += "\n\n----\n\n" + expansionData.expansion;
        }
      } catch (expError) {
        console.warn("Lỗi khi mở rộng nội dung:", expError);
        // We still have the original segment, so we continue
      }
    }

    return gameData;
  } catch (error) {
    console.error("AI Error:", error);
    return {
      story: "Thiên Đạo xuất hiện dị biến, không thể tiếp tục diễn hóa.",
      actions: [{ id: 1, text: "Thử lại" }]
    };
  }
}

export interface PlotSuggestion {
  title: string;
  description: string;
  type: string;
}

export async function suggestPlot(playerState: PlayerState): Promise<PlotSuggestion[]> {
  try {
    const apiKey = playerState.customApiKey || "";

    const prompt = `Based on the player's history and chronicles, suggest 3 interesting plot directions in Vietnamese for a TU TIEN context. Return as JSON array: [{"title": "...", "description": "...", "type": "..."}]`;

    const resultText = await fetchAIWrapper(
      apiKey,
      prompt,
      undefined,
      true,
      undefined,
      'flash',
      playerState.preferCustomKey
    );

    try {
      return JSON.parse(resultText);
    } catch (e) {
      console.error("Plot suggestion parse error:", resultText);
      return [];
    }
  } catch (error) {
    return [];
  }
}

export interface LoreSuggestion {
  world: string;
  origin: string;
  majorArcs: string;
}

export async function generateLoreSuggestions(playerState: PlayerState, section?: 'world' | 'origin' | 'majorArcs'): Promise<LoreSuggestion | null> {
  try {
    const apiKey = playerState.customApiKey || "";

    const currentLore = playerState.lore;
    let sectionPrompt = "";
    
    if (section === 'world') {
      sectionPrompt = "Hãy gợi ý phần 'THẾ GIỚI BẢN NGUYÊN' (World): Mô tả về linh khí, quy tắc thế giới, các tông môn và thế lực lớn.";
    } else if (section === 'origin') {
      sectionPrompt = "Hãy gợi ý phần 'NHÂN QUẢ KHỞI ĐẦU' (Origin): Bi kịch, cơ duyên hoặc hoàn cảnh lúc bắt đầu của nhân vật.";
    } else if (section === 'majorArcs') {
      sectionPrompt = "Hãy gợi ý phần 'ĐẠI KIẾP CHÂN KINH' (Major Arcs): Các giai đoạn bùng nổ, các bước ngoặt lớn dự kiến của câu chuyện.";
    } else {
      sectionPrompt = "Hãy sáng tạo hoặc hoàn thiện bối cảnh tu tiên (Lore) hấp dẫn theo đầy đủ 3 mục.";
    }

    const prompt = `Dựa trên tên nhân vật "${playerState.name}" và giới tính "${playerState.gender}", ${sectionPrompt}

    Dữ liệu hiện tại:
    - Thế giới: ${currentLore?.world || "Chưa xác định"}
    - Khởi đầu: ${currentLore?.origin || "Chưa xác định"}
    - Các Arc: ${currentLore?.majorArcs || "Chưa xác định"}

    Hãy viết bằng tiếng Việt, phong cách tiên hiệp huyền ảo.
    TRẢ VỀ ĐỊNH DẠNG JSON: {"world": "...", "origin": "...", "majorArcs": "..."} (Chỉ điền nội dung mới vào mục được yêu cầu, các mục khác giữ nguyên hoặc để trống nếu không đổi).`;

    const systemPrompt = "Bạn là một đại biên kịch chuyên về dòng truyện tiên hiệp và huyền huyễn. Bạn có khả năng xây dựng bối cảnh vô cùng đồ sộ và logic.";

    const text = await fetchAIWrapper(
      apiKey,
      prompt,
      systemPrompt,
      true,
      undefined,
      'flash',
      playerState.preferCustomKey
    );

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error("Lore suggestion parse error:", text);
      return null;
    }
  } catch (error) {
    console.error("Lore Generation Error:", error);
    return null;
  }
}

export async function validateApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
  try {
    const defaultGeminiKey = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : "") || "";
    const keys = getAllKeys(apiKey);
    
    if (keys.length === 0) return { success: false, message: "Không tìm thấy key hợp lệ để kiểm tra." };
    
    // We'll just test the first key
    const keyToTest = keys[0];
    const isDefault = keyToTest === defaultGeminiKey && !apiKey.trim().includes(keyToTest);
    
    const ai = new GoogleGenAI({ apiKey: keyToTest });
    // Use a very simple and cheap model/request for validation
    await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: 'Hi' }] }]
    });
    
    return { 
      success: true, 
      message: isDefault ? "Kết nối Thiên Cơ (Mặc định) hoạt động tốt!" : "Kết nối Thiên Cơ (Custom) hoạt động tốt!" 
    };
  } catch (error: any) {
    console.error("API Key Validation Error:", error);
    let msg = error.message || String(error);
    if (msg.includes("403") || msg.includes("invalid")) msg = "API Key không hợp lệ hoặc không có quyền truy cập.";
    if (msg.includes("429")) msg = "API Key hoạt động nhưng đang bị giới hạn lưu lượng (Quota Exceeded).";
    return { success: false, message: msg };
  }
}
