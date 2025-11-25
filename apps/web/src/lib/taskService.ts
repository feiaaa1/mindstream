import { supabase } from '@/lib/supabaseClient';
import type { Task, SubTask } from '@/types/index';

/**
 * 生成唯一ID
 */
function generateId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * 保存任务到数据库
 * @param tasks - 要保存的任务数组
 * @param userId - 用户ID
 * @returns Promise<Task[]> - 保存后的任务数组（包含数据库生成的ID）
 */
export async function saveTasks(tasks: any[], userId: string): Promise<Task[]> {
  try {
    const savedTasks: Task[] = [];

    for (const taskData of tasks) {
      // 为子任务生成ID
      const subtasksWithIds: SubTask[] = taskData.subtasks.map((subtask: any) => ({
        id: generateId(),
        title: subtask.title,
        completed: false
      }));

      // 创建完整的任务对象
      const task: Task = {
        id: generateId(),
        title: taskData.title,
        category: taskData.category,
        estimatedTime: taskData.estimatedTime,
        subtasks: subtasksWithIds,
        completed: false,
        createdAt: new Date().toISOString()
      };

      // 保存到数据库
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          id: task.id,
          user_id: userId,
          title: task.title,
          category: task.category,
          estimated_time: task.estimatedTime,
          subtasks: task.subtasks,
          completed: task.completed,
          created_at: task.createdAt
        })
        .select()
        .single();

      if (error) {
        console.error('保存任务失败:', error);
        throw new Error(`保存任务失败: ${error.message}`);
      }

      savedTasks.push(task);
    }

    return savedTasks;
  } catch (error) {
    console.error('保存任务到数据库失败:', error);
    throw error;
  }
}

/**
 * 获取用户的所有任务
 * @param userId - 用户ID
 * @returns Promise<Task[]> - 用户的任务列表
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('获取任务失败:', error);
      throw new Error(`获取任务失败: ${error.message}`);
    }

    // 转换数据库格式到应用格式
    const tasks: Task[] = (data || []).map(row => ({
      id: row.id,
      title: row.title,
      category: row.category,
      estimatedTime: row.estimated_time,
      subtasks: row.subtasks || [],
      completed: row.completed,
      createdAt: row.created_at
    }));

    return tasks;
  } catch (error) {
    console.error('获取用户任务失败:', error);
    throw error;
  }
}

/**
 * 更新任务状态
 * @param taskId - 任务ID
 * @param updates - 要更新的字段
 * @param userId - 用户ID
 * @returns Promise<void>
 */
export async function updateTask(
  taskId: string, 
  updates: Partial<{
    completed: boolean;
    subtasks: SubTask[];
    title: string;
    category: string;
    estimatedTime: number  }>,
  userId: string
): Promise<void> {
  try {
    // 转换字段名到数据库格式
    const dbUpdates: any = {};
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.estimatedTime !== undefined) dbUpdates.estimated_time = updates.estimatedTime;

    const { error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('更新任务失败:', error);
      throw new Error(`更新任务失败: ${error.message}`);
    }
  } catch (error) {
    console.error('更新任务失败:', error);
    throw error;
  }
}

/**
 * 删除任务
 * @param taskId - 任务ID
 * @param userId - 用户ID
 * @returns Promise<void>
 */
export async function deleteTask(taskId: string, userId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', userId);

    if (error) {
      console.error('删除任务失败:', error);
      throw new Error(`删除任务失败: ${error.message}`);
    }
  } catch (error) {
    console.error('删除任务失败:', error);
    throw error;
  }
}