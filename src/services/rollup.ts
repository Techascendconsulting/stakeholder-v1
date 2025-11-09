import { supabase } from '../lib/supabase';

export async function getLessonCompletion(userId: string, lessonStableKey: string) {
  // First, get the lesson to find its ID
  const { data: lessonData, error: lessonError } = await supabase
    .from('lessons')
    .select('id')
    .eq('stable_key', lessonStableKey)
    .single();

  if (lessonError) throw lessonError;
  if (!lessonData) return { percent: 0, completed: false };

  // Fetch all topics for the lesson
  const { data: topics, error: topicsError } = await supabase
    .from('topics')
    .select('stable_key, content_version')
    .eq('is_published', true)
    .eq('lesson_id', lessonData.id);

  if (topicsError) throw topicsError;

  // fetch progress for those topics
  const topicKeys = (topics ?? []).map(t => t.stable_key);
  if (topicKeys.length === 0) return { percent: 0, completed: false };

  const { data: progress } = await supabase
    .from('user_progress')
    .select('stable_key, status, percent')
    .eq('user_id', userId)
    .eq('unit_type', 'topic')
    .in('stable_key', topicKeys);

  const map = new Map(progress?.map(p => [p.stable_key, p.percent]) ?? []);
  const total = topicKeys.length;
  const sum = topicKeys.reduce((acc, key) => acc + (map.get(key) ?? 0), 0);
  const avg = sum / total;
  const completed = (avg === 100);
  return { percent: Math.round(avg), completed };
}

export async function getModuleCompletion(userId: string, moduleStableKey: string) {
  // First, get the module to find its ID
  const { data: moduleData, error: moduleError } = await supabase
    .from('modules')
    .select('id')
    .eq('stable_key', moduleStableKey)
    .single();

  if (moduleError) throw moduleError;
  if (!moduleData) return { percent: 0, completed: false };

  // Fetch all lessons for the module
  const { data: lessons, error: lessonsError } = await supabase
    .from('lessons')
    .select('stable_key')
    .eq('is_published', true)
    .eq('module_id', moduleData.id);

  if (lessonsError) throw lessonsError;

  const lessonKeys = (lessons ?? []).map(l => l.stable_key);
  if (lessonKeys.length === 0) return { percent: 0, completed: false };

  // Calculate completion for each lesson
  const completions = await Promise.all(
    lessonKeys.map(key => getLessonCompletion(userId, key))
  );

  const total = completions.length;
  const sum = completions.reduce((acc, c) => acc + c.percent, 0);
  const avg = sum / total;
  const completed = completions.every(c => c.completed);

  return { percent: Math.round(avg), completed };
}













