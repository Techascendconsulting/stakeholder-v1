import { useProgress } from '../../hooks/useProgress';

interface TopicViewProps {
  stableKey: string;
  contentVersion: number;
  title: string;
  html: string;
}

export default function TopicView(props: TopicViewProps) {
  const unit = { 
    unitType: 'topic' as const, 
    stableKey: props.stableKey, 
    contentVersion: props.contentVersion 
  };
  const { loading, progress, setPercent, complete } = useProgress(unit);

  // Example: when user scrolls to bottom, set 100%
  const onReachedEnd = () => setPercent(100, { scrolledTo: 'end' });

  if (loading) {
    return <div className="container py-8">Loading progress...</div>;
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6">{props.title}</h1>
      
      {progress?.status === 'stale' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 dark:text-yellow-200">
            Content updated since you last visited. Please review this topic.
          </p>
        </div>
      )}

      <article 
        className="prose dark:prose-invert max-w-none mb-8"
        dangerouslySetInnerHTML={{ __html: props.html }} 
      />

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Progress</p>
            <p className="text-2xl font-bold">{progress?.percent ?? 0}%</p>
            <p className="text-sm text-gray-500 capitalize">{progress?.status ?? 'not_started'}</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setPercent(Math.min(100, (progress?.percent ?? 0) + 20))}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Save progress +20%
            </button>
            <button 
              onClick={onReachedEnd}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Mark complete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

















