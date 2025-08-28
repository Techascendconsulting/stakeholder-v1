import React, { useState } from 'react';
import { Send, X, Tag, Hash } from 'lucide-react';

interface Category {
  id: string;
  label: string;
  icon: any;
}

interface PostComposerProps {
  onSubmit: (content: string, category: string, tags: string[]) => void;
  onCancel: () => void;
  categories: Category[];
}

const PostComposer: React.FC<PostComposerProps> = ({
  onSubmit,
  onCancel,
  categories
}) => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (content.trim().length < 10) {
      alert('Please write at least 10 characters for your post.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), category, tags);
    } catch (error) {
      console.error('Error submitting post:', error);
      alert('Failed to create post. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Share something with the Lounge</h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content Textarea */}
        <div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="What's on your mind? Share your thoughts, questions, or insights about business analysis..."
            className="w-full h-32 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none text-[15px] leading-6 text-gray-700 placeholder-gray-400"
            disabled={isSubmitting}
          />
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500">
              {content.length}/1000 characters
            </span>
            <span className="text-xs text-gray-500">
              {content.length < 10 ? `${10 - content.length} more characters needed` : 'Ready to post'}
            </span>
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-[15px]"
            disabled={isSubmitting}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags (optional)
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex-1 relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleTagKeyPress}
                placeholder="Add tags to help others find your post..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent text-[15px]"
                disabled={isSubmitting || tags.length >= 5}
              />
            </div>
            <button
              type="button"
              onClick={handleAddTag}
              disabled={!tagInput.trim() || tags.length >= 5 || isSubmitting}
              className="px-3 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              Add
            </button>
          </div>
          
          {/* Tags Display */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center space-x-1 px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium"
                >
                  <Tag className="w-3 h-3" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-violet-900"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
          
          {tags.length >= 5 && (
            <p className="text-xs text-gray-500 mt-1">
              Maximum 5 tags allowed
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={content.trim().length < 10 || isSubmitting}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-sm font-medium"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Posting...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Post to Lounge</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostComposer;
