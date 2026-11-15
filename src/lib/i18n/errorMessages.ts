// Translate display messages without changing internal error contracts.
export const ERROR_MESSAGES: readonly (readonly [string, string])[] = [
  [
    "NPC not found: __INTERPOLATION_0__",
    "未找到非玩家角色：__INTERPOLATION_0__"
  ],
  [
    "Portrait generation failed: __INTERPOLATION_0__ __INTERPOLATION_1__",
    "头像生成失败：__INTERPOLATION_0__ __INTERPOLATION_1__"
  ],
  [
    "Portrait URL not found in response",
    "响应中未找到头像 URL"
  ],
  [
    "Item not found: __INTERPOLATION_0__",
    "未找到物品：__INTERPOLATION_0__"
  ],
  [
    "Character not found: __INTERPOLATION_0__",
    "未找到角色：__INTERPOLATION_0__"
  ],
  [
    "Unknown error",
    "未知错误"
  ],
  [
    "Image generation failed: __INTERPOLATION_0__ __INTERPOLATION_1__",
    "图片生成失败：__INTERPOLATION_0__ __INTERPOLATION_1__"
  ],
  [
    "Image not found in response",
    "响应中未找到图片"
  ],
  [
    "The operation was aborted",
    "操作已中止"
  ],
  [
    "World Not Found",
    "未找到世界"
  ],
  [
    "The world for this item-use turn could not be found.",
    "无法找到此物品使用回合所属的世界。"
  ],
  [
    "Character Not Found",
    "未找到角色"
  ],
  [
    "The character for this item-use turn could not be found in this world.",
    "无法在当前世界找到本次物品使用回合对应的角色。"
  ],
  [
    "Item Not Found",
    "未找到物品"
  ],
  [
    "The specified item could not be found.",
    "无法找到指定的物品。"
  ],
  [
    "Failed to generate journal image",
    "生成日志图片失败"
  ],
  [
    "Failed to load ending image (__INTERPOLATION_0__)",
    "加载结局图片失败（__INTERPOLATION_0__）"
  ],
  [
    "Failed to generate world (__INTERPOLATION_0__)",
    "生成世界失败（__INTERPOLATION_0__）"
  ],
  [
    "Failed to generate world image (__INTERPOLATION_0__)",
    "生成世界图片失败（__INTERPOLATION_0__）"
  ],
  [
    "Character name is required",
    "角色名称不能为空"
  ],
  [
    "Character name must be at least 2 characters",
    "角色名称至少需要 2 个字符"
  ],
  [
    "A character with this name already exists in this world",
    "该世界中已存在同名角色"
  ],
  [
    "Storage unavailable",
    "存储不可用"
  ],
  [
    "Portrait request failed: __INTERPOLATION_0__",
    "头像请求失败：__INTERPOLATION_0__"
  ],
  [
    "Failed to generate character",
    "生成角色失败"
  ],
  [
    "AI categorization unavailable",
    "AI 分类不可用"
  ],
  [
    "Validation API error: __INTERPOLATION_0__",
    "验证 API 错误：__INTERPOLATION_0__"
  ],
  [
    "The story can't continue",
    "故事无法继续"
  ],
  [
    "Your story can't continue until your account settings are sorted out.",
    "在账户设置处理妥当之前，你的故事无法继续。"
  ],
  [
    "That image couldn't be read. Try picking it again.",
    "无法读取该图片。请重新选择。"
  ],
  [
    "Browser save storage is unavailable",
    "浏览器存档存储不可用"
  ],
  [
    "Cloud save unavailable",
    "云存档不可用"
  ],
  [
    "Save too large",
    "存档过大"
  ],
  [
    "Save failed",
    "存档失败"
  ],
  [
    "IndexedDB initialization failed: __INTERPOLATION_0__",
    "IndexedDB 初始化失败：__INTERPOLATION_0__"
  ],
  [
    "IndexedDB read failed: __INTERPOLATION_0__",
    "IndexedDB 读取失败：__INTERPOLATION_0__"
  ],
  [
    "IndexedDB write failed: __INTERPOLATION_0__",
    "IndexedDB 写入失败：__INTERPOLATION_0__"
  ],
  [
    "Web Crypto API is unavailable in this environment",
    "此环境中无法使用 Web Crypto API"
  ],
  [
    "World or character not found",
    "未找到世界或角色"
  ],
  [
    "__INTERPOLATION_0__ can't be equipped — __INTERPOLATION_1__ items are carried, not worn or wielded.",
    "__INTERPOLATION_0__无法装备——__INTERPOLATION_1__类物品只能携带，不能穿戴或挥舞。"
  ],
  [
    "A boom-town tech hub hides a spiral of missing-person cases tied to a viral app. Journalists, street crew fixers, and exhausted detectives race to uncover who is rewriting memories from the cloud.",
    "一座新兴科技重镇隐藏着一连串与爆款应用有关的失踪案。记者、街头团体的中间人和疲惫的警探争相查明，究竟是谁在云端改写记忆。"
  ],
  [
    "Explain the city layers, corporate plots, and what happens when tech fails or rebels.",
    "说明城市层级、企业阴谋，以及技术失效或反叛时会发生什么。"
  ],
  [
    "Failed to export game state",
    "导出游戏状态失败"
  ],
  [
    "Export failed",
    "导出失败"
  ],
  [
    "Failed to import game state",
    "导入游戏状态失败"
  ],
  [
    "Invalid JSON file",
    "无效的 JSON 文件"
  ],
  [
    "Invalid game state format",
    "游戏状态格式无效"
  ],
  [
    "Invalid world data for __INTERPOLATION_0__: __INTERPOLATION_1__",
    "世界数据无效（__INTERPOLATION_0__）：__INTERPOLATION_1__"
  ],
  [
    "Save transaction aborted",
    "保存事务已中止"
  ],
  [
    "Inventory categorization failed",
    "背包物品分类失败"
  ],
  [
    "Item similarity check failed",
    "物品相似度检查失败"
  ],
  [
    "Beginner understanding with limited skill",
    "初学者水平，技能有限"
  ],
  [
    "Dark, frightening scenarios with supernatural or psychological terror",
    "黑暗恐怖、带有超自然或心理恐惧的场景"
  ],
  [
    "Item Not Found",
    "未找到物品"
  ],
  [
    "The specified item could not be found.",
    "找不到指定的物品。"
  ],
  [
    "Invalid Max Stack",
    "最大堆叠数无效"
  ],
  [
    "Max stack size must be greater than zero.",
    "最大堆叠数必须大于零。"
  ],
  [
    "Invalid Quantity",
    "数量无效"
  ],
  [
    "Item quantity cannot be negative.",
    "物品数量不能为负数。"
  ],
  [
    "Stack Limit Exceeded",
    "超出堆叠上限"
  ],
  [
    "Quantity cannot exceed maximum stack size of __INTERPOLATION_0__.",
    "数量不能超过最大堆叠数 __INTERPOLATION_0__。"
  ],
  [
    "Invalid Category",
    "分类无效"
  ],
  [
    "Invalid item data",
    "物品数据无效"
  ],
  [
    "Validation Error",
    "验证错误"
  ],
  [
    "Acquisition Missing",
    "缺少获取信息"
  ],
  [
    "Unable to add item without acquisition metadata.",
    "缺少获取元数据，无法添加物品。"
  ],
  [
    "Item quantity must be greater than zero.",
    "物品数量必须大于零。"
  ],
  [
    "Cannot add more items. Maximum stack size is __INTERPOLATION_0__.",
    "无法添加更多物品。最大堆叠数量为 __INTERPOLATION_0__。"
  ],
  [
    "Categorization Missing",
    "缺少分类"
  ],
  [
    "Unable to add new item without categorization metadata.",
    "缺少分类元数据，无法添加新物品。"
  ],
  [
    "Cannot remove __INTERPOLATION_0__ items. Only __INTERPOLATION_1__ available.",
    "无法移除 __INTERPOLATION_0__ 个物品。仅有 __INTERPOLATION_1__ 个可用。"
  ],
  [
    "Cannot merge a fact with itself",
    "无法将设定条目与自身合并"
  ],
  [
    "Primary fact not found: __INTERPOLATION_0__",
    "未找到主设定条目：__INTERPOLATION_0__"
  ],
  [
    "Secondary fact not found: __INTERPOLATION_0__",
    "未找到次设定条目：__INTERPOLATION_0__"
  ],
  [
    "Cannot merge facts from different worlds",
    "无法合并来自不同世界的设定条目"
  ],
  [
    "Merge Failed",
    "合并失败"
  ],
  [
    "Failed to merge facts",
    "合并设定条目失败"
  ],
  [
    "Goal title is required",
    "目标标题为必填项"
  ],
  [
    "Session ID is required",
    "冒险记录 ID 为必填项"
  ],
  [
    "Goal description is required",
    "目标描述为必填项"
  ],
  [
    "Goal Not Found",
    "未找到目标"
  ],
  [
    "The specified goal could not be found.",
    "找不到指定的目标。"
  ],
  [
    "Segment Not Found",
    "未找到叙事片段"
  ],
  [
    "Narrative segment not found for goal processing.",
    "未找到用于目标处理的叙事片段。"
  ],
  [
    "Session Not Found",
    "未找到冒险记录"
  ],
  [
    "Goal Processing Failed",
    "目标处理失败"
  ],
  [
    "Failed to process goals for the segment.",
    "无法处理该片段的目标。"
  ],
  [
    "Segment content is required",
    "片段内容为必填项"
  ],
  [
    "Cannot add segments to an ended session",
    "无法向已结束的冒险记录添加片段"
  ],
  [
    "Segment not found",
    "未找到片段"
  ],
  [
    "Lore Fact Not Found",
    "未找到设定条目"
  ],
  [
    "The specified lore fact could not be found.",
    "找不到指定的设定条目。"
  ],
  [
    "Invalid Lore Fact",
    "无效的设定条目"
  ],
  [
    "Invalid Lore Key",
    "无效的设定键"
  ],
  [
    "A lore fact with this key and value already exists for this world.",
    "该世界已存在具有此键和值的设定条目。"
  ],
  [
    "Thread Not Found",
    "未找到线索"
  ],
  [
    "The specified thread could not be found.",
    "找不到指定的线索。"
  ],
  [
    "This field is required",
    "此字段为必填项"
  ],
  [
    "Must be at least __INTERPOLATION_0__ characters",
    "至少需要 __INTERPOLATION_0__ 个字符"
  ],
  [
    "Must be at most __INTERPOLATION_0__ characters",
    "不能超过 __INTERPOLATION_0__ 个字符"
  ],
  [
    "Rate limit exceeded. Please try again later.",
    "请求过于频繁，请稍后再试。"
  ],
  [
    "Invalid response: isSignificant must be boolean",
    "无效响应：isSignificant 必须为布尔值"
  ],
  [
    "Invalid response: reason must be string",
    "无效响应：reason 必须为字符串"
  ],
  [
    "Parse error: Could not parse validation response",
    "解析错误：无法解析验证响应"
  ],
  [
    "Scan the area",
    "扫描区域"
  ],
  [
    "Provider rate limit reached - configured maximum requests per hour exceeded",
    "已达到模型服务速率限制——超出配置的每小时最大请求数"
  ],
  [
    "HTTP error! status: __INTERPOLATION_0__",
    "HTTP 错误！状态码：__INTERPOLATION_0__"
  ],
  [
    "Failed to generate content",
    "生成内容失败"
  ],
  [
    "Segment missing from AI response",
    "AI 响应中缺少片段"
  ],
  [
    "Gemini returned an empty response.",
    "Gemini 返回了空响应。"
  ],
  [
    "Service error: malformed API response",
    "服务错误：API 响应格式错误"
  ],
  [
    "Missing required fields in response",
    "响应中缺少必填字段"
  ],
  [
    "Failed to create ending: ",
    "创建结局失败："
  ],
  [
    "Invalid choice type: __INTERPOLATION_0__",
    "无效的选项类型：__INTERPOLATION_0__"
  ],
  [
    "Decision prompt is required and must be a string",
    "决策提示为必填项，且必须是字符串"
  ],
  [
    "Choice text is required and must be a string",
    "选项文本为必填项，且必须是字符串"
  ],
  [
    "Session ID is required and must be a string",
    "冒险记录 ID 为必填项，且必须是字符串"
  ],
  [
    "World ID is required and must be a string",
    "世界 ID 为必填项，且必须是字符串"
  ],
  [
    "Failed to generate narrative segment",
    "生成叙事片段失败"
  ],
  [
    "Failed to generate initial scene",
    "生成初始场景失败"
  ],
  [
    "World object cannot be null or undefined",
    "世界对象不能为 null 或 undefined"
  ],
  [
    "Property \"id\" must be a string",
    "属性“id”必须是字符串"
  ],
  [
    "Property \"name\" must be a string",
    "属性“name”必须是字符串"
  ],
  [
    "Property \"description\" must be a string",
    "属性“description”必须是字符串"
  ],
  [
    "Property \"genre\" must be a string",
    "属性“genre”必须是字符串"
  ],
  [
    "Property \"id\" must be a string when present",
    "当存在时，属性“id”必须是字符串"
  ],
  [
    "Property \"name\" must be a string when present",
    "当存在时，属性“name”必须是字符串"
  ],
  [
    "Property \"description\" must be a string when present",
    "当存在时，属性“description”必须是字符串"
  ],
  [
    "Property \"genre\" must be a string when present",
    "字段 “genre” 存在时必须是字符串"
  ],
  [
    "Property \"attributes\" must be an array",
    "字段 “attributes” 必须是数组"
  ],
  [
    "Invalid WorldAttribute at index __INTERPOLATION_0__: __INTERPOLATION_1__",
    "索引 __INTERPOLATION_0__ 处的 WorldAttribute 无效：__INTERPOLATION_1__"
  ],
  [
    "Property \"skills\" must be an array",
    "字段 “skills” 必须是数组"
  ],
  [
    "Invalid WorldSkill at index __INTERPOLATION_0__: __INTERPOLATION_1__",
    "索引 __INTERPOLATION_0__ 处的 WorldSkill 无效：__INTERPOLATION_1__"
  ],
  [
    "Property \"createdAt\" must be a string",
    "字段 “createdAt” 必须是字符串"
  ],
  [
    "Property \"updatedAt\" must be a string",
    "字段 “updatedAt” 必须是字符串"
  ],
  [
    "Property \"attributes\" must be an array when present",
    "字段 “attributes” 存在时必须是数组"
  ],
  [
    "Property \"skills\" must be an array when present",
    "字段 “skills” 存在时必须是数组"
  ],
  [
    "Property \"reference\" must be a string when present",
    "字段 “reference” 存在时必须是字符串"
  ],
  [
    "Property \"relationship\" must be \"set_within\" or \"inspired_by\" when present",
    "字段 “relationship” 存在时必须是 “set_within” 或 “inspired_by”"
  ],
  [
    "WorldAttribute cannot be null or undefined",
    "WorldAttribute 不能为 null 或 undefined"
  ],
  [
    "Property \"worldId\" must be a string",
    "字段 “worldId” 必须是字符串"
  ],
  [
    "Property \"baseValue\" must be a number",
    "字段 “baseValue” 必须是数字"
  ],
  [
    "Property \"minValue\" must be a number",
    "字段 “minValue” 必须是数字"
  ],
  [
    "Property \"maxValue\" must be a number",
    "字段 “maxValue” 必须是数字"
  ],
  [
    "Property \"minValue\" must be less than or equal to \"maxValue\"",
    "字段 “minValue” 必须小于或等于 “maxValue”"
  ],
  [
    "Property \"baseValue\" must be greater than or equal to \"minValue\"",
    "字段 “baseValue” 必须大于或等于 “minValue”"
  ],
  [
    "Property \"baseValue\" must be less than or equal to \"maxValue\"",
    "字段 “baseValue” 必须小于或等于 “maxValue”"
  ],
  [
    "WorldSkill cannot be null or undefined",
    "WorldSkill 不能为 null 或 undefined"
  ],
  [
    "Property \"difficulty\" must be one of: __INTERPOLATION_0__",
    "字段 “difficulty” 必须是以下之一：__INTERPOLATION_0__"
  ],
  [
    "Property \"attributeIds\" must be an array when present",
    "字段 “attributeIds” 存在时必须是数组"
  ],
  [
    "WorldSettings cannot be null or undefined",
    "WorldSettings 不能为 null 或 undefined"
  ],
  [
    "Property \"maxAttributes\" must be a number",
    "字段 “maxAttributes” 必须是数字"
  ],
  [
    "Property \"maxAttributes\" must be greater than 0",
    "字段 “maxAttributes” 必须大于 0"
  ],
  [
    "Property \"maxSkills\" must be a number",
    "字段 “maxSkills” 必须是数字"
  ],
  [
    "Property \"maxSkills\" must be greater than 0",
    "字段 “maxSkills” 必须大于 0"
  ],
  [
    "Property \"attributePointPool\" must be a number",
    "字段 “attributePointPool” 必须是数字"
  ],
  [
    "Property \"attributePointPool\" must be greater than 0",
    "字段 “attributePointPool” 必须大于 0"
  ],
  [
    "Property \"skillPointPool\" must be a number",
    "字段 “skillPointPool” 必须是数字"
  ],
  [
    "Property \"skillPointPool\" must be greater than 0",
    "字段 “skillPointPool” 必须大于 0"
  ],
  [
    "Property \"maxAttributes\" must be a number when present",
    "字段 “maxAttributes” 存在时必须是数字"
  ],
  [
    "Property \"maxSkills\" must be a number when present",
    "字段 “maxSkills” 存在时必须是数字"
  ],
  [
    "Property \"attributePointPool\" must be a number when present",
    "字段 “attributePointPool” 存在时必须是数字"
  ],
  [
    "Property \"skillPointPool\" must be a number when present",
    "字段 “skillPointPool” 存在时必须是数字"
  ],
  [
    "GeneratedImage cannot be null or undefined",
    "GeneratedImage 不能为 null 或 undefined"
  ],
  [
    "Property \"type\" must be one of: __INTERPOLATION_0__",
    "字段 “type” 必须是以下之一：__INTERPOLATION_0__"
  ],
  [
    "Property \"url\" must be null or a string",
    "字段 “url” 必须为 null 或字符串"
  ],
  [
    "Property \"generatedAt\" must be a string when present",
    "字段 “generatedAt” 存在时必须是字符串"
  ],
  [
    "Property \"prompt\" must be a string when present",
    "字段 “prompt” 存在时必须是字符串"
  ],
  [
    "Unable to read the response",
    "无法读取响应"
  ],
  [
    "Unknown parsing error",
    "未知解析错误"
  ],
  [
    "__INTERPOLATION_0__. Original error: __INTERPOLATION_1__. Content: __INTERPOLATION_2__...",
    "__INTERPOLATION_0__。原始错误：__INTERPOLATION_1__。内容：__INTERPOLATION_2__……"
  ],
  [
    "Invalid __INTERPOLATION_0__: missing __INTERPOLATION_1__",
    "无效的 __INTERPOLATION_0__：缺少 __INTERPOLATION_1__"
  ],
  [
    "Invalid __INTERPOLATION_0__: __INTERPOLATION_1__ must be an array",
    "无效的 __INTERPOLATION_0__：__INTERPOLATION_1__ 必须是数组"
  ],
  [
    "Invalid date",
    "无效日期"
  ],
  [
    "Invalid time",
    "无效时间"
  ],
  [
    "Failed to set current character after creation",
    "创建后未能设置当前角色"
  ],
  [
    "Failed to generate world image",
    "生成世界图像失败"
  ],
  [
    "API key not configured: add a provider key in Settings > Provider Setup",
    "未配置 API 密钥：请在“设置 > 模型服务设置”中添加模型服务密钥"
  ],
  [
    "API key is not configured",
    "未配置 API 密钥"
  ],
  [
    "Unable to reach the model provider: __INTERPOLATION_0__",
    "无法连接模型服务：__INTERPOLATION_0__"
  ],
  [
    "The model provider's rate limit was exceeded: __INTERPOLATION_0__",
    "模型服务的请求频率超出限制：__INTERPOLATION_0__"
  ],
  [
    "__INTERPOLATION_0__ is required",
    "__INTERPOLATION_0__为必填项"
  ],
  [
    "__INTERPOLATION_0__ must be at least __INTERPOLATION_1__ characters",
    "__INTERPOLATION_0__至少需要 __INTERPOLATION_1__ 个字符"
  ],
  [
    "__INTERPOLATION_0__ must be less than __INTERPOLATION_1__ characters",
    "__INTERPOLATION_0__必须少于 __INTERPOLATION_1__ 个字符"
  ],
  [
    "Content Rating is required",
    "内容分级为必填项"
  ],
  [
    "Content Rating must be a valid rating",
    "内容分级必须是有效的分级"
  ],
  [
    "Narrative Style is required",
    "叙事风格为必填项"
  ],
  [
    "Narrative Style must be a valid style",
    "叙事风格必须是有效的风格"
  ],
  [
    "Language Complexity is required",
    "语言复杂度为必填项"
  ],
  [
    "Language Complexity must be a valid level",
    "语言复杂度必须是有效的等级"
  ],
  [
    "Custom Instructions must be no more than __INTERPOLATION_0__ characters",
    "自定义指令不得超过 __INTERPOLATION_0__ 个字符"
  ],
  [
    "useTheme must be used within a ThemeProvider",
    "useTheme 必须在 ThemeProvider 内使用"
  ],
  [
    "The request is taking too long. Try again.",
    "请求耗时过长，请重试。"
  ],
  [
    "Unable to connect. Please check your internet connection.",
    "无法连接，请检查你的网络连接。"
  ],
  [
    "Authentication Error",
    "身份验证错误"
  ],
  [
    "Authentication failed. Please check your credentials.",
    "身份验证失败。请检查你的凭据。"
  ],
  [
    "API Key Required",
    "需要 API 密钥"
  ],
  [
    "Provider Blocked This",
    "模型服务已拦截此内容"
  ],
  [
    "Your provider refused to generate this. That's their moderation, not a problem with your story.",
    "你的模型服务拒绝生成此内容。这是其内容审核所致，不是你的故事有问题。"
  ],
  [
    "Payload Too Large",
    "请求内容过大"
  ],
  [
    "Couldn't generate this content because the input is too large.",
    "输入内容过大，无法生成此内容。"
  ],
  [
    "Generation failed",
    "生成失败"
  ],
  [
    "Response must be an object",
    "响应必须是对象"
  ],
  [
    "Invalid content rating: __INTERPOLATION_0__",
    "无效的内容分级：__INTERPOLATION_0__"
  ],
  [
    "Invalid narrative style: __INTERPOLATION_0__",
    "无效的叙事风格：__INTERPOLATION_0__"
  ],
  [
    "Invalid language complexity: __INTERPOLATION_0__",
    "无效的语言复杂度：__INTERPOLATION_0__"
  ],
  [
    "Missing or invalid reasoning in response",
    "响应中缺少推理或推理无效"
  ],
  [
    "The model provider returned an empty response",
    "模型服务返回了空响应"
  ],
  [
    "Couldn't reach the model provider. Check your connection, then try again.",
    "无法连接模型服务。请检查网络连接后重试。"
  ],
  [
    "Couldn't generate tone settings. Try again, or set them manually.",
    "无法生成叙事风格设置。请重试，或手动设置。"
  ],
  [
    "Couldn't generate tone settings. Try again in a moment.",
    "无法生成叙事风格设置。请稍后重试。"
  ],
  [
    "Provider not found",
    "未找到模型服务"
  ],
  [
    "The specified character could not be found",
    "未找到指定的角色"
  ],
  [
    "Cannot Equip Item",
    "无法装备物品"
  ],
  [
    "This item cannot be equipped.",
    "该物品无法装备。"
  ],
  [
    "The provider blocked this content",
    "模型服务已拦截此内容"
  ],
  [
    "Service error: output token limit reached before generation completed",
    "服务错误：生成完成前已达到输出 token 上限"
  ],
  [
    "Request aborted",
    "请求已中止"
  ],
  [
    "Service error: response exceeded maximum size",
    "服务错误：响应大小超过上限"
  ],
  [
    "Request timeout - please try again",
    "请求超时，请重试"
  ],
  [
    "Network error - please check your connection",
    "网络错误，请检查连接"
  ],
  [
    "429 rate limit exceeded",
    "429 请求频率超限"
  ],
  [
    "Service error: __INTERPOLATION_0__ __INTERPOLATION_1__",
    "服务错误：__INTERPOLATION_0__ __INTERPOLATION_1__"
  ],
  [
    "Service error: malformed API response",
    "服务错误：API 响应格式错误"
  ],
  [
    "Provider response was missing the generated content",
    "模型服务响应缺少生成内容"
  ],
  [
    "Service error: the provider blocked this content",
    "服务错误：模型服务已拦截此内容"
  ],
  [
    "The provider returned an empty response and reported a content block",
    "模型服务返回了空响应，并报告了内容拦截"
  ],
  [
    "Service error: output token limit reached before generation completed",
    "服务错误：生成完成前已达到输出 token 上限"
  ],
  [
    "Service error: the provider endpoint must be an https URL on a public host",
    "服务错误：模型服务端点必须是公网主机上的 https URL"
  ],
  [
    "Network error - the provider endpoint could not be resolved",
    "网络错误，无法解析模型服务端点"
  ],
  [
    "Service error: the provider endpoint resolves to a private address",
    "服务错误：模型服务端点解析到私有地址"
  ],
  [
    "World name is required",
    "世界名称为必填项"
  ],
  [
    "The specified world could not be found",
    "未找到指定的世界"
  ],
  [
    "Failed to Load Worlds",
    "加载世界失败"
  ],
  [
    "Failed to fetch worlds",
    "无法获取世界"
  ],
  [
    "Invalid import data structure",
    "导入数据结构无效"
  ],
  [
    "Lore Import Failed",
    "设定导入失败"
  ],
  [
    "Unknown import error occurred.",
    "发生未知导入错误。"
  ],
  [
    "Failed to import facts for worldId \"__INTERPOLATION_0__\": __INTERPOLATION_1__",
    "无法为 worldId“__INTERPOLATION_0__”导入设定条目：__INTERPOLATION_1__"
  ],
  [
    "Failed to initialize session",
    "初始化冒险记录失败"
  ],
  [
    "Entity name is required",
    "实体名称不能为空"
  ],
  [
    "Failed to create lore entity",
    "创建设定实体失败"
  ],
  [
    "API error __INTERPOLATION_0__: __INTERPOLATION_1__",
    "API 错误 __INTERPOLATION_0__：__INTERPOLATION_1__"
  ],
  [
    "Failed to load ending",
    "加载结局失败"
  ],
  [
    "Invalid ending payload from API",
    "API 返回的结局数据无效"
  ],
  [
    "Item name is required",
    "物品名称不能为空"
  ],
  [
    "Item quantity must be greater than zero",
    "物品数量必须大于零"
  ],
  [
    "Non-stackable items cannot have quantity greater than one",
    "不可堆叠物品的数量不能大于 1"
  ],
  [
    "Categorization metadata is required",
    "缺少分类元数据"
  ],
  [
    "Acquisition metadata is required",
    "缺少获取元数据"
  ],
  [
    "Acquisition quantity must be greater than zero",
    "获取数量必须大于零"
  ],
  [
    "Max stack size must be greater than zero",
    "最大堆叠数量必须大于零"
  ],
  [
    "Image must be a GeneratedImage object",
    "图像必须是 GeneratedImage 对象"
  ],
  [
    "Image type must be \"ai-generated\" or \"placeholder\"",
    "图像类型必须为 \"ai-generated\" 或 \"placeholder\""
  ],
  [
    "Image URL must be a string or null",
    "图像 URL 必须为字符串或 null"
  ],
  [
    "Entry content is required",
    "条目内容不能为空"
  ],
  [
    "Entry Not Found",
    "未找到条目"
  ],
  [
    "The specified journal entry could not be found",
    "找不到指定的日志条目"
  ],
  [
    "Decision not found",
    "未找到决策"
  ],
  [
    "Selected option not found",
    "未找到所选选项"
  ],
  [
    "NPC name is required",
    "非玩家角色名称不能为空"
  ],
  [
    "NPC description is required",
    "非玩家角色描述不能为空"
  ],
  [
    "NPC Not Found",
    "未找到非玩家角色"
  ],
  [
    "The specified NPC could not be found.",
    "找不到指定的非玩家角色。"
  ],
  [
    "Invalid Name",
    "名称无效"
  ],
  [
    "NPC name cannot be empty.",
    "非玩家角色名称不能为空。"
  ],
  [
    "Invalid Description",
    "描述无效"
  ],
  [
    "NPC description cannot be empty.",
    "非玩家角色描述不能为空。"
  ],
  [
    "Invalid World ID",
    "世界 ID 无效"
  ],
  [
    "World ID is required.",
    "世界 ID 为必填项。"
  ],
  [
    "Payload too large",
    "请求内容过大"
  ],
  [
    "Prompt is required",
    "需要提供提示词"
  ],
  [
    "API key not configured",
    "API 密钥未配置"
  ],
  [
    "400 bad request: the provider endpoint must be an https URL on a public host",
    "400 错误请求：模型服务端点必须是公共主机上的 https URL"
  ],
  [
    "400 bad request: prompt is required",
    "400 错误请求：需要提供提示词"
  ],
  [
    "Unknown error occurred",
    "发生未知错误"
  ],
  [
    "Service error: empty stream body",
    "服务错误：流内容为空"
  ],
  [
    "Rate limit reached. Try again in a minute.",
    "请求次数已达上限，请在一分钟后重试。"
  ],
  [
    "Rate limit reached. Try again in __INTERPOLATION_0__ minutes.",
    "请求次数已达上限，请在__INTERPOLATION_0__分钟后重试。"
  ],
  [
    "Rate limit reached. Try again in __INTERPOLATION_0__ hour__INTERPOLATION_1__.",
    "请求次数已达上限，请在__INTERPOLATION_0__小时__INTERPOLATION_1__后重试。"
  ],
  [
    "Page Not Found",
    "页面未找到"
  ],
  [
    "Error loading image",
    "图片加载失败"
  ],
  [
    "Confirmation Required",
    "需要确认"
  ],
  [
    "Failed to start game session",
    "启动游戏会话失败"
  ],
  [
    "Game Session Error",
    "游戏会话错误"
  ],
  [
    "Failed to Start Game",
    "启动游戏失败"
  ],
  [
    "Unable to create or resume a game session.",
    "无法创建或继续冒险记录。"
  ],
  [
    "Removes all characters and saved sessions for this world. This action cannot be undone.",
    "将删除此世界中的所有角色和已保存的冒险记录。此操作无法撤销。"
  ],
  [
    "Error Loading Worlds",
    "加载世界出错"
  ],
  [
    "What Narraitor is, what it needs from you, and what happens to your stories. If something here is wrong or missing, say so on GitHub.",
    "Narraitor 是什么、它需要你提供什么，以及你的故事会经历什么。如果这里有错误或遗漏，请在 GitHub 上告诉我们。"
  ],
  [
    "Genre is required",
    "题材为必填项"
  ],
  [
    "Pick a suggested choice or type your own action. Decisions are weighted Minor, Major, or Critical so you can see what&apos;s at stake, and they get tested against your character&apos;s relevant skill. A failed check bends the story rather than handing you a retry. Alignment tracking (Lawful, Neutral, Chaotic) keeps a read on how your character has been playing.",
    "选择一个建议选项，或输入你自己的行动。决策会分为次要、重要或关键等级，让你看清风险所在，并会依据你角色的相关技能进行判定。判定失败会让故事转向，而不是给你一次重试机会。阵营追踪（守序、中立、混乱）会持续记录你的角色一贯的行事方式。"
  ],
  [
    "Check that you copied the whole key with no stray whitespace, and that it&apos;s an API key from AI Studio rather than something else from your Google account. Re-run the connection check under Settings, Providers &mdash; the wizard won&apos;t save a key that fails it.",
    "请确认你复制了完整密钥且没有多余空白，并确认它是来自 AI Studio 的 API 密钥，而不是你 Google 账户中的其他东西。在“设置 > 模型服务”下重新运行连接检查——未通过检查的密钥，向导不会保存。"
  ],
  [
    "I hit a rate limit",
    "我遇到了速率限制"
  ],
  [
    "Two separate limits can stop a turn. Narraitor caps generation at 50 requests an hour from one connection, and that&apos;s usually the one you hit first; the message tells you how long the wait is, and nothing you change at Google will shorten it. Google enforces its own limit on your key on top of that, and moving your account onto a paid tier raises only that second one.",
    "有两种独立的限制可能阻止一回合生成。Narraitor 将单个连接每小时生成请求限制为 50 次，这通常是你先遇到的限制；提示信息会告诉你需要等待多久，而在 Google 那边做任何更改都不会缩短它。Google 还会对你的密钥施加自己的限制，将账户升级到付费层级只会提高第二种限制的额度。"
  ],
  [
    "World Required",
    "必须选择世界"
  ],
  [
    "This action cannot be undone.",
    "此操作无法撤销。"
  ],
  [
    "Skill checks carry real stakes. Some choices ask more of your character than others, and a failed roll bends the story instead of handing you a win. There’s no fixed script, and the world remembers the path you took.",
    "技能检定事关重大。有些选择对角色要求更高，而检定失败会令故事转折，而不是直接让你获胜。故事没有固定剧本，世界会记住你走过的道路。"
  ],
  [
    "If the app crashes or a request fails, it sends a short report so the break is visible instead of silent. A report holds five things: which part failed, the error&apos;s class name, a category like &ldquo;network&rdquo; or &ldquo;timeout&rdquo;, the page you were on with any ids swapped out, and the stack trace.",
    "如果应用崩溃或请求失败，它会发送一份简短报告，让故障变得可见，而不是悄无声息。报告包含五项内容：哪个部分失败、错误的类名、像“网络”或“超时”这样的类别、你当时所在的页面（其中的任何 ID 都已替换），以及堆栈跟踪。"
  ],
  [
    "What it deliberately leaves out: the error message itself, anything from your worlds, characters, or story, whatever you typed, and your provider key. The message is read on your device to pick the category, and then it&apos;s dropped — only the category travels.",
    "它有意省略的内容：错误消息本身、来自你的世界、角色或故事的任何内容、你输入的任何内容，以及你的模型服务密钥。该消息会在你的设备上读取，以选择类别，然后被丢弃——只有类别会被发送。"
  ],
  [
    "Couldn't load this world. Try refreshing the page.",
    "无法加载此世界。请尝试刷新页面。"
  ],
  [
    "World not found",
    "未找到世界"
  ],
  [
    "Couldn't save your changes. Try again.",
    "无法保存你的更改。请重试。"
  ],
  [
    "Character Not Found",
    "未找到角色"
  ],
  [
    "Are you sure you want to delete \"__INTERPOLATION_0__\"? This action cannot be undone.",
    "确定要删除“__INTERPOLATION_0__”吗？此操作无法撤销。"
  ],
  [
    "Are you sure you want to delete this attribute? This action cannot be undone.",
    "确定要删除此属性吗？此操作无法撤销。"
  ],
  [
    "WARNING: This attribute is linked to __INTERPOLATION_0__ skill__INTERPOLATION_1__: __INTERPOLATION_2__. Deleting this attribute will affect these skills. This action cannot be undone.",
    "警告：此属性已关联 __INTERPOLATION_0__ 个技能__INTERPOLATION_1__：__INTERPOLATION_2__。删除此属性将影响这些技能。此操作无法撤销。"
  ],
  [
    "Cannot add more attributes. Maximum of __INTERPOLATION_0__ reached.",
    "无法添加更多属性。已达到 __INTERPOLATION_0__ 个的上限。"
  ],
  [
    "Failure",
    "失败"
  ],
  [
    "Critical failure",
    "大失败"
  ],
  [
    "Error occurred during choice generation.",
    "生成选项时发生错误。"
  ],
  [
    "Couldn't generate suggestions. Try again, or fill this in yourself.",
    "无法生成建议。请重试，或自行填写。"
  ],
  [
    "The option you take is checked against one of those skills. Miss the number, and the story bends to the failure instead of ignoring it.",
    "你所选的选项会对照其中一项技能进行检定。若未达到数值要求，故事会顺应这次失败，而不是将其忽略。"
  ],
  [
    "Failed",
    "失败"
  ],
  [
    "Unable to generate narrative. Please check your connection and try again.",
    "无法生成叙事。请检查网络连接并重试。"
  ],
  [
    "Error:",
    "错误："
  ],
  [
    "Session Limit",
    "冒险记录上限"
  ],
  [
    "Error",
    "错误"
  ],
  [
    "Narraitor can't save to this browser right now. Keep this tab open, and export your data from Settings so you don't lose your progress.",
    "Narraitor 目前无法保存到此浏览器。请保持此标签页打开，并从设置中导出数据，以免丢失进度。"
  ],
  [
    "Limited by available points",
    "受可用点数限制"
  ],
  [
    "Failed to extract structured lore: __INTERPOLATION_0__",
    "提取结构化设定失败：__INTERPOLATION_0__"
  ],
  [
    "Testing AI extraction with error handling...",
    "正在测试带错误处理的 AI 提取..."
  ],
  [
    "AI extraction failed: __INTERPOLATION_0__",
    "AI 提取失败：__INTERPOLATION_0__"
  ],
  [
    "AI alias extraction failed: __INTERPOLATION_0__",
    "AI 别名提取失败：__INTERPOLATION_0__"
  ],
  [
    "Test Error Handling",
    "测试错误处理"
  ],
  [
    "Test Error Handling:",
    "测试错误处理："
  ],
  [
    "Forces the AI call to fail and shows what the viewer does with it",
    "强制 AI 调用失败，并展示查看器如何处理该失败"
  ],
  [
    "Error Handling:",
    "错误处理："
  ],
  [
    "Graceful failure - no lore extraction rather than bad data",
    "优雅失败——宁可不出设定，也不产生错误数据"
  ],
  [
    "At least one attribute is required.",
    "至少需要分配一项属性。"
  ],
  [
    "Skill __INTERPOLATION_0__ cannot be leveled because its configuration has no available range.",
    "技能 __INTERPOLATION_0__ 无法升级，因为其配置中没有可用范围。"
  ],
  [
    "World not found",
    "未找到世界"
  ],
  [
    "Error occurred: __INTERPOLATION_0__",
    "发生错误：__INTERPOLATION_0__"
  ],
  [
    "World Not Found",
    "未找到世界"
  ],
  [
    "Failed to create test world",
    "创建测试世界失败"
  ],
  [
    "Failed to create world",
    "创建世界失败"
  ],
  [
    "World type is required",
    "必须选择世界类型"
  ],
  [
    "Existing setting is required",
    "需要填写现有设定"
  ],
  [
    "Additional details are required",
    "需要填写补充细节"
  ],
  [
    "Skill check required",
    "需要技能检定"
  ],
  [
    "- missing",
    "- 未满足"
  ],
  [
    "Missing world or session context.",
    "缺少世界或冒险记录上下文。"
  ],
  [
    "Failed to generate checkpoint summary.",
    "生成故事节点摘要失败。"
  ],
  [
    "Unknown error creating checkpoint.",
    "创建故事节点时发生未知错误。"
  ],
  [
    "Missing important story details",
    "遗漏重要的故事细节"
  ],
  [
    "I questioned a caller about the nature of their problem, learning it concerns a missing package.",
    "我向一位来电者询问了对方遇到的问题，得知是一个包裹丢失了。"
  ],
  [
    "Customer called about missing Citizen Kane rental. Complained for twenty minutes about Orson Welles. Found it in their car after checking. Marco dealt with another difficult customer around the same time.",
    "顾客打电话说租的《Citizen Kane》不见了。就 Orson Welles 抱怨了二十分钟。检查后发现它就在他们车里。大约同一时间，Marco 应付了另一位难缠的顾客。"
  ],
  [
    "Couldn't load the ending image.",
    "无法加载结局图片。"
  ],
  [
    "Unable to load story ending",
    "无法加载故事结局"
  ],
  [
    "Are you sure you want to end your story? This will write a final ending based on your current progress and cannot be undone.",
    "确定要结束你的故事吗？这将根据你当前的进度撰写最终结局，且无法撤销。"
  ],
  [
    "Couldn't put together a story summary yet.",
    "暂时无法生成故事摘要。"
  ],
  [
    "Error generating prompt: __INTERPOLATION_0__",
    "生成提示词时出错：__INTERPOLATION_0__"
  ],
  [
    "Generation failed: __INTERPOLATION_0__",
    "生成失败：__INTERPOLATION_0__"
  ],
  [
    "Auto-Save Error",
    "自动保存错误"
  ],
  [
    "Couldn't save your progress. Your recent moves aren't stored yet.",
    "无法保存你的进度。你最近的操作尚未存储。"
  ],
  [
    "Scan the area with your tech equipment",
    "用你的科技设备扫描该区域"
  ],
  [
    "Existing setting is required when world type is selected",
    "选择世界类型时，必须提供现有设定"
  ],
  [
    "Failed to generate world",
    "生成世界失败"
  ],
  [
    "Item object is required",
    "物品对象为必填项"
  ],
  [
    "Failed to generate item image",
    "生成物品图像失败"
  ],
  [
    "World data not found for this character",
    "未找到此角色的世界数据"
  ],
  [
    "Couldn't load this character. Try refreshing the page.",
    "无法加载此角色。请尝试刷新页面。"
  ],
  [
    "Character not found",
    "未找到角色"
  ],
  [
    "The requested character could not be found or loaded.",
    "找不到或无法加载所请求的角色。"
  ],
  [
    "Automatic retry is unavailable. Choose an alternative.",
    "自动重试不可用。请选择其他方式。"
  ],
  [
    "Runtime Errors",
    "运行时错误"
  ],
  [
    "Filter by __INTERPOLATION_0__ severity errors",
    "按 __INTERPOLATION_0__ 严重程度筛选错误"
  ],
  [
    "Filter by __INTERPOLATION_0__ category errors",
    "按 __INTERPOLATION_0__ 类别筛选错误"
  ],
  [
    "Show dismissed errors in addition to active errors",
    "除活动错误外，还显示已忽略的错误"
  ],
  [
    "Show dismissed errors",
    "显示已忽略的错误"
  ],
  [
    "No runtime errors captured",
    "未捕获到运行时错误"
  ],
  [
    "View error details",
    "查看错误详情"
  ],
  [
    "Dismiss error",
    "忽略错误"
  ],
  [
    "Couldn't export your data. Try again in a moment.",
    "无法导出你的数据。请稍后再试。"
  ],
  [
    "Import failed. Please choose a .json file.",
    "导入失败。请选择 .json 文件。"
  ],
  [
    "Import failed. File exceeds __INTERPOLATION_0__ MB limit.",
    "导入失败。文件超过 __INTERPOLATION_0__ MB 限制。"
  ],
  [
    "Import failed",
    "导入失败"
  ],
  [
    "Import failed. Please check the file format.",
    "导入失败。请检查文件格式。"
  ],
  [
    "Both name1 and name2 are required",
    "name1 和 name2 均为必填项"
  ],
  [
    "Could not parse AI response",
    "无法解析 AI 响应"
  ],
  [
    "Failed to generate image",
    "图片生成失败"
  ],
  [
    "Image unavailable for __INTERPOLATION_0__",
    "__INTERPOLATION_0__的图片不可用"
  ],
  [
    "Couldn't use that item. Try again.",
    "无法使用该物品，请重试。"
  ],
  [
    "Failed to check item similarity",
    "检查物品相似度失败"
  ],
  [
    "Quantity must be at least 1",
    "数量至少为 1"
  ],
  [
    "Cannot drop more than __INTERPOLATION_0__ items",
    "不能丢弃超过 __INTERPOLATION_0__ 个物品"
  ],
  [
    "At least one item name is required for categorization",
    "至少需要一个物品名称才能进行分类"
  ],
  [
    "Item name missing or invalid",
    "物品名称缺失或无效"
  ],
  [
    "Failed to categorize inventory items",
    "背包物品分类失败"
  ],
  [
    "Themed placeholder images if AI fails",
    "AI 失败时使用主题占位图"
  ],
  [
    "Failed to import facts: __INTERPOLATION_0__",
    "导入设定失败：__INTERPOLATION_0__"
  ],
  [
    "Are you sure you want to clear all lore usage data for this world? This cannot be undone.",
    "确定要清除此世界的所有设定使用数据吗？此操作无法撤销。"
  ],
  [
    "Skill name is required",
    "技能名称不能为空"
  ],
  [
    "Description is required",
    "描述不能为空"
  ],
  [
    "Skill name must be __INTERPOLATION_0__ characters or less",
    "技能名称不能超过 __INTERPOLATION_0__ 个字符"
  ],
  [
    "Description must be __INTERPOLATION_0__ characters or less",
    "描述不能超过 __INTERPOLATION_0__ 个字符"
  ],
  [
    "Skill name \"__INTERPOLATION_0__\" already exists",
    "技能名称“__INTERPOLATION_0__”已存在"
  ],
  [
    "At least one attribute must be selected",
    "至少需要选择一个属性"
  ],
  [
    ") reached. You cannot create more skills for this world.",
    "）。你无法再为此世界创建更多技能。"
  ],
  [
    "World description is required",
    "世界描述不能为空"
  ],
  [
    "Failed to analyze world description",
    "分析世界描述失败"
  ],
  [
    "Limit requests per hour",
    "每小时请求数上限"
  ],
  [
    "A safety net against accidentally burning through your own quota. Enforced in this browser only — it has no effect on the provider&apos;s own limits.",
    "防止意外耗尽自身配额的安全网。仅在此浏览器中强制执行——它不会影响模型服务自身的限制。"
  ],
  [
    "Rate limited by the provider. Please try again in a moment.",
    "模型服务触发了速率限制。请稍后再试。"
  ],
  [
    "Invalid endpoint address.",
    "端点地址无效。"
  ],
  [
    "Could not reach provider to load models. Enter model ID manually below.",
    "无法连接模型服务以加载模型。请在下方手动输入模型 ID。"
  ],
  [
    "Could not load models list. Enter model ID manually below.",
    "无法加载模型列表。请在下方手动输入模型 ID。"
  ],
  [
    "That model name was not found for this provider.",
    "此模型服务未找到该模型名称。"
  ],
  [
    "The provider is rate limiting right now — wait a moment and retry.",
    "模型服务当前正在限流——请稍等片刻再重试。"
  ],
  [
    "This provider's API isn't one we can talk to yet. If it accepts OpenAI-style chat completions, add it as a custom endpoint instead.",
    "此模型服务的 API 尚不受支持。如果它接受 OpenAI 风格的聊天补全，请改为将其添加为自定义端点。"
  ],
  [
    "That endpoint must be an https URL on a public host. Local addresses are not reachable from the server that makes the request.",
    "该端点必须是公共主机上的 https URL。发起请求的服务器无法访问本地地址。"
  ],
  [
    "Could not reach the provider. Check your connection and the endpoint.",
    "无法连接模型服务。请检查你的网络连接和端点。"
  ],
  [
    "Your server refused the request. Most local model servers only accept requests addressed to their own machine, so a server reached through a tunnel has to be told to allow that address.",
    "你的服务器拒绝了请求。大多数本地模型服务器只接受发往其自身机器的请求，因此通过隧道访问的服务器必须被设置为允许该地址。"
  ],
  [
    "Any service that accepts OpenAI-style chat completions works here. The endpoint must be an https URL on a public host — the request is made by the server, so a local address is not reachable.",
    "任何接受 OpenAI 风格聊天补全的服务都可以在这里使用。端点必须是公共主机上的 https URL——请求由服务器发出，因此本地地址无法访问。"
  ],
  [
    "Fact key is required",
    "事实键为必填项"
  ],
  [
    "Key must be alphanumeric with underscores, starting with a letter",
    "键名只能包含字母、数字和下划线，且必须以字母开头"
  ],
  [
    "Fact value is required",
    "事实值为必填项"
  ],
  [
    "Category is required",
    "分类为必填项"
  ],
  [
    "Duplicate fact detected. This fact already exists for this world.",
    "检测到重复事实。该事实已存在于这个世界。"
  ],
  [
    "Error formatting JSON: __INTERPOLATION_0__",
    "格式化 JSON 时出错：__INTERPOLATION_0__"
  ],
  [
    "World genre is required",
    "世界类型为必填项"
  ],
  [
    "Description must be at least 50 characters",
    "描述至少需要 50 个字符"
  ],
  [
    "We couldn't create this world. Your progress is saved here, so try Create World again.",
    "无法创建此世界。你的进度已保存在此处，请再次尝试创建世界。"
  ],
  [
    "Attribute name is required",
    "属性名称为必填项"
  ],
  [
    "An attribute with this name already exists",
    "已存在同名属性"
  ],
  [
    "Maximum value must be greater than minimum value",
    "最大值必须大于最小值"
  ],
  [
    "Cannot create more attributes. Maximum of __INTERPOLATION_0__ attributes allowed.",
    "无法创建更多属性。最多允许 __INTERPOLATION_0__ 个属性。"
  ],
  [
    ". This action cannot be undone.",
    "。此操作无法撤销。"
  ],
  [
    "It comes with no warranty of any kind. It might have bugs, it might be unavailable, and the story and images it generates are produced by a model — they can be wrong, strange, repetitive, or just not what you asked for. Use it at your own risk.",
    "它不附带任何形式的保证。它可能存在缺陷，也可能无法使用，它生成的故事和图像由模型产出——可能出错、怪异、重复，或者根本不是你想要的。使用风险由你自行承担。"
  ],
  [
    "Ending data is required",
    "需要结局数据"
  ],
  [
    "Couldn't generate the ending image. Try again in a moment.",
    "无法生成结局图像，请稍后再试。"
  ],
  [
    "Journal entry data is required",
    "需要日志条目数据"
  ],
  [
    "Couldn't generate the journal image. Try again in a moment.",
    "无法生成日志图像，请稍后再试。"
  ],
  [
    "Error Tracking",
    "错误追踪"
  ],
  [
    "Removes the story progress and journal entries for this session. This action cannot be undone.",
    "删除此冒险记录的故事进度和日志条目。此操作无法撤销。"
  ],
  [
    "Either prompt string or character object is required",
    "必须提供提示词字符串或角色对象"
  ],
  [
    "Prompt could not be determined from input",
    "无法根据输入确定提示词"
  ],
  [
    "Model configuration unavailable",
    "模型配置不可用"
  ],
  [
    "Cloud save could not be loaded",
    "无法加载云存档"
  ],
  [
    "Invalid origin",
    "来源无效"
  ],
  [
    "Missing save",
    "缺少存档"
  ],
  [
    "Invalid save",
    "存档无效"
  ],
  [
    "Cloud save temporarily unavailable",
    "云存档暂时不可用"
  ],
  [
    "Error Tracking",
    "错误跟踪"
  ],
  [
    "Error generating test world: __INTERPOLATION_0__",
    "生成测试世界时出错：__INTERPOLATION_0__"
  ],
  [
    "Error generating test worlds: __INTERPOLATION_0__\\n\\nGenerated __INTERPOLATION_1__ worlds before error.",
    "生成测试世界时出错：__INTERPOLATION_0__\\n\\n出错前已生成 __INTERPOLATION_1__ 个世界。"
  ],
  [
    "Error generating characters: __INTERPOLATION_0__\\n\\nGenerated __INTERPOLATION_1__ characters before error.",
    "生成角色时出错：__INTERPOLATION_0__\\n\\n出错前已生成 __INTERPOLATION_1__ 个角色。"
  ],
  [
    "DELETE ALL WORLDS?\\n\\nThis will permanently delete all __INTERPOLATION_0__ worlds and their characters.\\n\\nThis action cannot be undone!",
    "删除所有世界？\\n\\n这将永久删除所有 __INTERPOLATION_0__ 个世界及其角色。\\n\\n此操作无法撤销！"
  ],
  [
    "Error during deletion: __INTERPOLATION_0__",
    "删除时出错：__INTERPOLATION_0__"
  ],
  [
    "DELETE ALL CHARACTERS IN \"__INTERPOLATION_0__\"?\\n\\nThis will permanently delete __INTERPOLATION_1__ characters.\\n\\nThis action cannot be undone!",
    "删除“__INTERPOLATION_0__”中的所有角色？\\n\\n这将永久删除 __INTERPOLATION_1__ 个角色。\\n\\n此操作无法撤销！"
  ],
  [
    "NUCLEAR OPTION - DELETE EVERYTHING?\\n\\nThis will permanently delete:\\n• __INTERPOLATION_0__ worlds\\n• __INTERPOLATION_1__ characters\\n• All associated data\\n\\nTHIS CANNOT BE UNDONE!\\n\\nAre you absolutely sure?",
    "核选项——删除所有内容？\\n\\n这将永久删除：\\n• __INTERPOLATION_0__ 个世界\\n• __INTERPOLATION_1__ 个角色\\n• 所有关联数据\\n\\n此操作无法撤销！\\n\\n你确定吗？"
  ],
  [
    "Error during deletion: __INTERPOLATION_0__\\n\\nSome data may not have been deleted. Check console for details.",
    "删除过程中出错：__INTERPOLATION_0__\\n\\n部分数据可能未被删除。请查看控制台了解详情。"
  ],
  [
    "WARNING: These operations are permanent and cannot be undone!",
    "警告：这些操作是永久性的，无法撤销！"
  ],
  [
    "400 bad request: world data is required",
    "400 错误请求：必须提供世界数据"
  ],
  [
    "400 bad request: invalid world data - __INTERPOLATION_0__",
    "400 错误请求：世界数据无效——__INTERPOLATION_0__"
  ],
  [
    "Character generation failed",
    "角色生成失败"
  ],
  [
    "majorEvent is required and must be a string",
    "majorEvent 为必填项，且必须是字符串"
  ],
  [
    "Failed to validate event significance",
    "验证事件重要性失败"
  ],
  [
    "Invalid JSON in request body",
    "请求体中的 JSON 无效"
  ],
  [
    "Content is required",
    "内容为必填项"
  ],
  [
    "Failed to generate summary",
    "生成摘要失败"
  ],
  [
    "Invalid response structure",
    "响应结构无效"
  ],
  [
    "Internal server error",
    "服务器内部错误"
  ],
  [
    "World data is required",
    "世界数据为必填项"
  ],
  [
    "Couldn't generate the world image. Try again in a moment.",
    "无法生成世界图像。请稍后重试。"
  ],
  [
    "worldId and sessionId are required.",
    "worldId 和 sessionId 为必填项。"
  ],
  [
    "At least one major event is required to create a checkpoint.",
    "创建故事节点至少需要一个重大事件。"
  ],
  [
    "Missing required fields: sessionId, characterId, worldId, endingType",
    "缺少必填字段：sessionId、characterId、worldId、endingType"
  ],
  [
    "Invalid ending type. Must be one of: __INTERPOLATION_0__",
    "结局类型无效。必须为以下之一：__INTERPOLATION_0__"
  ],
  [
    "Invalid tone. Must be one of: __INTERPOLATION_0__",
    "叙事风格无效。必须为以下之一：__INTERPOLATION_0__"
  ],
  [
    "Resource not found",
    "未找到资源"
  ],
  [
    "Model provider unavailable",
    "模型服务不可用"
  ],
  ["World name must be at least __INTERPOLATION_0__ characters", "世界名称至少需要 __INTERPOLATION_0__ 个字符"],
  ["Narrative Style must be valid", "叙事风格必须有效"],
  ["Too many attribute points", "分配的属性点已超过可用数量。"],
  ["Character history must be at least __INTERPOLATION_0__ characters", "角色经历至少需要 __INTERPOLATION_0__ 个字符"],
];
