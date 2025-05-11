import React, { useState, useEffect, useRef } from 'react';
import { 
  Bold, Italic, Underline, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, Quote, 
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Link as LinkIcon, Image as ImageIcon,
  Code, HighlighterIcon, Undo, Redo
} from 'lucide-react';

const BookToolbar = ({ editor }) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [showLinkMenu, setShowLinkMenu] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const toolbarRef = useRef(null);
  const [toolbarHeight, setToolbarHeight] = useState(0);

  // Get toolbar height on mount and when window resizes
  useEffect(() => {
    const updateToolbarHeight = () => {
      if (toolbarRef.current) {
        setToolbarHeight(toolbarRef.current.offsetHeight);
      }
    };

    // Initial measurement
    updateToolbarHeight();
    
    // Re-measure on window resize
    window.addEventListener('resize', updateToolbarHeight);
    return () => {
      window.removeEventListener('resize', updateToolbarHeight);
    };
  }, []);

  // Handle scroll events to determine when toolbar should become sticky
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      // Change this value based on when you want the toolbar to become sticky
      // Using a smaller value (10px) to make it sticky sooner
      setIsSticky(scrollPosition > 10);
    };

    window.addEventListener('scroll', handleScroll);
    // Check initially as well
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    if (linkUrl) {
      // Check if the URL has a protocol
      const url = linkUrl.startsWith('http://') || linkUrl.startsWith('https://') 
        ? linkUrl 
        : `https://${linkUrl}`;
        
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    } else {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    }
    setShowLinkMenu(false);
    setLinkUrl('');
  };

  // Handle image upload (placeholder function)
  const addImage = () => {
    const url = window.prompt('Enter image URL');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  return (
    <>
      {/* Add a placeholder div with the same height as the toolbar when sticky */}
      {isSticky && <div style={{ height: `${toolbarHeight}px` }} />}
      
      <div 
        ref={toolbarRef}
        className={`border border-gray-200 rounded-md shadow-sm bg-white mb-2 w-full ${
          isSticky ? 'fixed top-0 left-0 right-0 z-50 shadow-md px-4 py-1' : ''
        }`}
      >
        <div className="flex flex-wrap items-center p-1 max-w-screen-xl mx-auto">
          {/* Text formatting */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive('bold')}
            icon={<Bold className="w-4 h-4" />}
            tooltip="Bold"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive('italic')}
            icon={<Italic className="w-4 h-4" />}
            tooltip="Italic"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive('underline')}
            icon={<Underline className="w-4 h-4" />}
            tooltip="Underline"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            isActive={editor.isActive('highlight')}
            icon={<HighlighterIcon className="w-4 h-4" />}
            tooltip="Highlight"
          />
          
          <ToolbarDivider />
          
          {/* Headings */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            isActive={editor.isActive('heading', { level: 1 })}
            icon={<Heading1 className="w-4 h-4" />}
            tooltip="Heading 1"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            isActive={editor.isActive('heading', { level: 2 })}
            icon={<Heading2 className="w-4 h-4" />}
            tooltip="Heading 2"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            isActive={editor.isActive('heading', { level: 3 })}
            icon={<Heading3 className="w-4 h-4" />}
            tooltip="Heading 3"
          />
          
          <ToolbarDivider />
          
          {/* Lists */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            icon={<List className="w-4 h-4" />}
            tooltip="Bullet List"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            icon={<ListOrdered className="w-4 h-4" />}
            tooltip="Numbered List"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            isActive={editor.isActive('blockquote')}
            icon={<Quote className="w-4 h-4" />}
            tooltip="Quote"
          />
          
          <ToolbarDivider />
          
          {/* Alignment */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            isActive={editor.isActive({ textAlign: 'left' })}
            icon={<AlignLeft className="w-4 h-4" />}
            tooltip="Align Left"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            isActive={editor.isActive({ textAlign: 'center' })}
            icon={<AlignCenter className="w-4 h-4" />}
            tooltip="Align Center"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            isActive={editor.isActive({ textAlign: 'right' })}
            icon={<AlignRight className="w-4 h-4" />}
            tooltip="Align Right"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            isActive={editor.isActive({ textAlign: 'justify' })}
            icon={<AlignJustify className="w-4 h-4" />}
            tooltip="Justify"
          />
          
          <ToolbarDivider />
          
          {/* Special features */}
          <div className="relative">
            <ToolbarButton 
              onClick={() => setShowLinkMenu(!showLinkMenu)}
              isActive={editor.isActive('link')}
              icon={<LinkIcon className="w-4 h-4" />}
              tooltip="Add Link"
            />
            
            {showLinkMenu && (
              <div className="absolute left-0 top-full mt-1 p-2 bg-white shadow-lg rounded-md border border-gray-200 w-64 z-10">
                <input
                  type="text"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="Enter URL"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
                <div className="flex mt-2 space-x-2">
                  <button 
                    onClick={setLink}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    Set Link
                  </button>
                  <button
                    onClick={() => {
                      editor.chain().focus().extendMarkRange('link').unsetLink().run();
                      setShowLinkMenu(false);
                    }}
                    className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    Remove Link
                  </button>
                  <button
                    onClick={() => setShowLinkMenu(false)}
                    className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <ToolbarButton 
            onClick={addImage}
            icon={<ImageIcon className="w-4 h-4" />}
            tooltip="Add Image"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            isActive={editor.isActive('codeBlock')}
            icon={<Code className="w-4 h-4" />}
            tooltip="Code Block"
          />
          
          <ToolbarDivider />
          
          {/* History */}
          <ToolbarButton 
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            icon={<Undo className="w-4 h-4" />}
            tooltip="Undo"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            icon={<Redo className="w-4 h-4" />}
            tooltip="Redo"
          />
        </div>
      </div>
    </>
  );
};

// Helper components
const ToolbarButton = ({ onClick, isActive, disabled, icon, tooltip }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`p-2 rounded-md transition-colors ${
      isActive ? 'bg-gray-200 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={tooltip}
  >
    {icon}
  </button>
);

const ToolbarDivider = () => (
  <div className="mx-1 w-px h-6 bg-gray-200"></div>
);

export default BookToolbar;