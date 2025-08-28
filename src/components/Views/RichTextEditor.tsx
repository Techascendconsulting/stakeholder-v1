import React, { useState, useRef, useEffect } from 'react';
import EmojiPicker from 'emoji-picker-react';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Type, 
  Smile, 
  AtSign,
  Send,
  Paperclip,
  Image as ImageIcon,
  X,
  Search,
  ChevronDown
} from 'lucide-react';

interface RichTextEditorProps {
  onSend: (content: string, html: string) => void;
  onFileSelect: () => void;
  placeholder?: string;
  disabled?: boolean;
  isSending?: boolean;
}

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  onSend,
  onFileSelect,
  placeholder = "Message...",
  disabled = false,
  isSending = false
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMentionPicker, setShowMentionPicker] = useState(false);
  const [content, setContent] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isBulletList, setIsBulletList] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const mentions = ['admin@batraining.com', 'user1@example.com', 'user2@example.com', 'moderator@example.com'];

  const handleSend = () => {
    if (content.trim()) {
      // Preserve line breaks and formatting when sending
      const formattedContent = content.replace(/\n/g, '\n'); // Ensure line breaks are preserved
      onSend(formattedContent.trim(), formattedContent.trim());
      setContent('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Check for @ symbol to show mention picker
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s/).pop() || '';
    
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setShowMentionPicker(true);
    } else {
      setShowMentionPicker(false);
    }
  };

  const onEmojiClick = (emojiObject: any) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert emoji at cursor position
      const newContent = content.substring(0, start) + emojiObject.emoji + content.substring(end);
      setContent(newContent);
      
      // Set cursor position after emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emojiObject.emoji.length, start + emojiObject.emoji.length);
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  const addMention = (mention: string) => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const cursorPosition = textarea.selectionStart;
      
      // Find the start of the @ mention
      const textBeforeCursor = content.substring(0, cursorPosition);
      const words = textBeforeCursor.split(/\s/);
      const lastWord = words[words.length - 1];
      
      if (lastWord.startsWith('@')) {
        // Replace the partial @ mention with the full mention
        const startOfMention = cursorPosition - lastWord.length;
        const mentionText = `@${mention} `;
        const newContent = content.substring(0, startOfMention) + mentionText + content.substring(cursorPosition);
        setContent(newContent);
        
        // Set cursor position after mention
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(startOfMention + mentionText.length, startOfMention + mentionText.length);
        }, 0);
      }
    }
    setShowMentionPicker(false);
  };

  // Rich text formatting functions
  const applyBold = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      if (selectedText) {
        // Wrap selected text with ** for bold
        const newContent = content.substring(0, start) + `**${selectedText}**` + content.substring(end);
        setContent(newContent);
        
        // Set cursor position after the formatted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, start + 2 + selectedText.length);
        }, 0);
      } else {
        // Insert bold markers at cursor position
        const newContent = content.substring(0, start) + '**bold text**' + content.substring(end);
        setContent(newContent);
        
        // Set cursor position between the markers
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 2, start + 10);
        }, 0);
      }
    }
  };

  const applyItalic = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = content.substring(start, end);
      
      if (selectedText) {
        // Wrap selected text with * for italic
        const newContent = content.substring(0, start) + `*${selectedText}*` + content.substring(end);
        setContent(newContent);
        
        // Set cursor position after the formatted text
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
        }, 0);
      } else {
        // Insert italic markers at cursor position
        const newContent = content.substring(0, start) + '*italic text*' + content.substring(end);
        setContent(newContent);
        
        // Set cursor position between the markers
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start + 1, start + 12);
        }, 0);
      }
    }
  };

  const addBulletPoint = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      
      // Insert bullet point at cursor position
      const newContent = content.substring(0, start) + '• ' + content.substring(start);
      setContent(newContent);
      
      // Set cursor position after bullet point
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const addNumberedList = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      
      // Count existing numbered items to determine next number
      const lines = content.substring(0, start).split('\n');
      const numberedLines = lines.filter(line => /^\d+\./.test(line.trim()));
      const nextNumber = numberedLines.length + 1;
      
      // Insert numbered item at cursor position
      const newContent = content.substring(0, start) + `${nextNumber}. ` + content.substring(start);
      setContent(newContent);
      
      // Set cursor position after number
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + `${nextNumber}. `.length, start + `${nextNumber}. `.length);
      }, 0);
    }
  };

  // Auto-resize textarea based on content
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto'; // Reset height to auto
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px'; // Set new height with max limit
    }
  };

  // Auto-resize when content changes
  useEffect(() => {
    autoResizeTextarea();
  }, [content]);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    
    // Check for @ symbol to show mention picker
    const cursorPosition = e.target.selectionStart;
    const textBeforeCursor = newContent.substring(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s/).pop() || '';
    
    if (lastWord.startsWith('@') && lastWord.length > 1) {
      setShowMentionPicker(true);
    } else {
      setShowMentionPicker(false);
    }
    
    // Auto-resize will be handled by the useEffect
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasContent = content.trim().length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg">
      {/* Toolbar - Compact */}
      <div className="flex items-center space-x-1 p-1 border-b border-gray-200 dark:border-gray-600">
        {/* Text Formatting */}
        <button
          onClick={applyBold}
          className="p-1 text-gray-600 hover:text-gray-800 rounded font-bold"
          title="Bold"
        >
          <Bold className="w-3 h-3" />
        </button>
        
        <button
          onClick={applyItalic}
          className="p-1 text-gray-600 hover:text-gray-800 rounded italic"
          title="Italic"
        >
          <Italic className="w-3 h-3" />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

        {/* Lists */}
        <button
          onClick={addBulletPoint}
          className="p-1 text-gray-600 hover:text-gray-800 rounded"
          title="Bullet List"
        >
          <List className="w-3 h-3" />
        </button>
        
        <button
          onClick={addNumberedList}
          className="p-1 text-gray-600 hover:text-gray-800 rounded"
          title="Numbered List"
        >
          <ListOrdered className="w-3 h-3" />
        </button>

        <div className="w-px h-4 bg-gray-300 dark:bg-gray-600" />

        {/* Emoji */}
        <div className="relative" ref={emojiPickerRef}>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1 text-gray-600 hover:text-gray-800 rounded"
          >
            <Smile className="w-3 h-3" />
          </button>
          
          {showEmojiPicker && (
            <div className="absolute bottom-full left-0 mb-1 z-50">
              <EmojiPicker
                onEmojiClick={onEmojiClick}
                width={320}
                height={400}
                searchPlaceholder="Search emoji..."
                lazyLoadEmojis={true}
                skinTonesDisabled={true}
              />
            </div>
          )}
        </div>

        {/* Mentions */}
        <div className="relative">
          <button
            onClick={() => setShowMentionPicker(!showMentionPicker)}
            className="p-1 text-gray-600 hover:text-gray-800 rounded"
          >
            <AtSign className="w-3 h-3" />
          </button>
          
          {showMentionPicker && (
            <div className="absolute bottom-full left-0 mb-1 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50">
              <div className="space-y-1">
                {mentions.map((mention) => (
                  <button
                    key={mention}
                    onClick={() => addMention(mention)}
                    className="block w-full text-left px-2 py-1 text-xs hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                  >
                    @{mention}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Textarea Content */}
      <div className="p-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleContentChange}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="w-full min-h-[40px] resize-none border-none outline-none bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 overflow-y-auto"
          style={{ fontFamily: 'inherit', fontSize: 'inherit' }}
          rows={1}
        />
      </div>

      {/* Bottom Toolbar - Compact */}
      <div className="flex items-center justify-between p-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center space-x-1">
          <button
            onClick={onFileSelect}
            disabled={disabled || isSending}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <button
            onClick={onFileSelect}
            disabled={disabled || isSending}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
        </div>
        
        <button
          onClick={handleSend}
          disabled={!hasContent || disabled || isSending}
          className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default RichTextEditor;
