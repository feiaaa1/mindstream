import { supabase } from '@/lib/supabaseClient';

// 用户设置接口
export interface UserSettings {
  id?: string;
  user_id: string;
  // AI服务配置
  speech_provider: string;
  speech_model: string;
  text_provider: string;
  text_model: string;
  // API密钥（加密存储）
  api_keys: Record<string, string>;
  // 其他设置
  auto_save: boolean;
  default_category: string;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  created_at?: string;
  updated_at?: string;
}

// 默认设置
export const DEFAULT_SETTINGS: Partial<UserSettings> = {
  speech_provider: 'browser-speech',
  speech_model: 'browser-speech-api',
  text_provider: 'google',
  text_model: 'gemini-pro',
  api_keys: {},
  auto_save: true,
  default_category: '工作',
  theme: 'auto',
  language: 'zh-CN'
};

/**
 * 获取用户设置
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    if (!data) {
      // 如果没有设置，创建默认设置
      return await createUserSettings(userId);
    }

    return {
      ...data,
      api_keys: data.api_keys || {}
    };
  } catch (error) {
    console.error('获取用户设置失败:', error);
    // 返回默认设置
    return {
      user_id: userId,
      ...DEFAULT_SETTINGS
    } as UserSettings;
  }
}

/**
 * 创建用户设置
 */
export async function createUserSettings(userId: string): Promise<UserSettings> {
  try {
    const settings: Partial<UserSettings> = {
      user_id: userId,
      ...DEFAULT_SETTINGS
    };

    const { data, error } = await supabase
      .from('user_settings')
      .insert(settings)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('创建用户设置失败:', error);
    // 返回默认设置
    return {
      user_id: userId,
      ...DEFAULT_SETTINGS
    } as UserSettings;
  }
}

/**
 * 更新用户设置
 */
export async function updateUserSettings(
  userId: string, 
  updates: Partial<UserSettings>
): Promise<UserSettings> {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('更新用户设置失败:', error);
    throw error;
  }
}

/**
 * 更新API密钥
 */
export async function updateApiKey(
  userId: string,
  provider: string,
  apiKey: string
): Promise<void> {
  try {
    // 获取当前设置
    const settings = await getUserSettings(userId);
    
    // 更新API密钥
    const updatedApiKeys = {
      ...settings.api_keys,
      [provider]: apiKey
    };

    await updateUserSettings(userId, {
      api_keys: updatedApiKeys
    });
  } catch (error) {
    console.error('更新API密钥失败:', error);
    throw error;
  }
}

/**
 * 删除API密钥
 */
export async function removeApiKey(
  userId: string,
  provider: string
): Promise<void> {
  try {
    // 获取当前设置
    const settings = await getUserSettings(userId);
    
    // 删除API密钥
    const updatedApiKeys = { ...settings.api_keys };
    delete updatedApiKeys[provider];

    await updateUserSettings(userId, {
      api_keys: updatedApiKeys
    });
  } catch (error) {
    console.error('删除API密钥失败:', error);
    throw error;
  }
}

/**
 * 获取指定提供商的API密钥
 */
export async function getApiKey(userId: string, provider: string): Promise<string | null> {
  try {
    const settings = await getUserSettings(userId);
    return settings.api_keys[provider] || null;
  } catch (error) {
    console.error('获取API密钥失败:', error);
    return null;
  }
}