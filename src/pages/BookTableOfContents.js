import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const BookTableOfContents = ({ bookContent, onChapterClick, darkMode, wordCounts = [], contentPages = [] }) => {
  const [chapters, setChapters] = useState([]);
  const [sections, setSections] = useState({});
  const [expandedSections, setExpandedSections] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!bookContent) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    const parser = new DOMParser();
    const contentArray = bookContent.split('\n\n');
    
    const extractedChapters = [];
    const extractedSections = {};
    let currentPosition = 0;
    let lastChapterIndex = -1;
    
    const pagesToUse = contentPages.length > 0 ? contentPages : contentArray;
    
    // First pass: find all h1 tags (chapters)
    pagesToUse.forEach((section, pageIndex) => {
      const doc = parser.parseFromString(section, 'text/html');
      const h1Tags = doc.querySelectorAll('h1');
      
      if (h1Tags.length > 0) {
        h1Tags.forEach(h1 => {
          extractedChapters.push({
            title: h1.textContent.trim(),
            pageIndex: pageIndex,
            position: currentPosition,
            wordCount: wordCounts[pageIndex] || 0
          });
          lastChapterIndex = extractedChapters.length - 1;
          extractedSections[lastChapterIndex] = [];
        });
      }
      
      currentPosition += section.length + 2;
    });
    
    if (extractedChapters.length === 0) {
      pagesToUse.forEach((section, pageIndex) => {
        if (section.match(/^Chapter\s+\d+/i) || 
            section.match(/<h[23]>Chapter\s+\d+/i) ||
            section.match(/^Part\s+\d+/i) ||
            section.match(/<h[23]>Part\s+\d+/i)) {
          
          const title = section.replace(/<[^>]*>/g, '')
                              .split('\n')[0]
                              .trim();
          
          extractedChapters.push({
            title: title,
            pageIndex: pageIndex,
            position: currentPosition,
            wordCount: wordCounts[pageIndex] || 0
          });
          
          lastChapterIndex = extractedChapters.length - 1;
          extractedSections[lastChapterIndex] = [];
        }
        currentPosition += section.length + 2;
      });
    }
    
    // Second pass: find all h2 tags (sections)
    currentPosition = 0;
    let currentChapterIndex = -1;
    
    pagesToUse.forEach((section, pageIndex) => {
      for (let i = 0; i < extractedChapters.length; i++) {
        if (extractedChapters[i].pageIndex === pageIndex) {
          currentChapterIndex = i;
          break;
        } else if (extractedChapters[i].pageIndex > pageIndex) {
          break;
        }
      }
      
      if (currentChapterIndex === -1 && extractedChapters.length > 0) {
        for (let i = 0; i < extractedChapters.length; i++) {
          if (extractedChapters[i].pageIndex <= pageIndex) {
            currentChapterIndex = i;
          } else {
            break;
          }
        }
      }
      
      if (currentChapterIndex >= 0) {
        const doc = parser.parseFromString(section, 'text/html');
        const h2Tags = doc.querySelectorAll('h2');
        
        if (h2Tags.length > 0) {
          h2Tags.forEach(h2 => {
            if (extractedSections[currentChapterIndex]) {
              extractedSections[currentChapterIndex].push({
                title: h2.textContent.trim(),
                pageIndex: pageIndex,
                position: currentPosition,
                wordCount: wordCounts[pageIndex] || 0
              });
            }
          });
        }
      }
      
      currentPosition += section.length + 2;
    });
    
    if (extractedChapters.length === 0 && pagesToUse.length > 0) {
      const pageCount = pagesToUse.length;
      
      extractedChapters.push({
        title: "Introduction",
        pageIndex: 0,
        position: 0,
        wordCount: wordCounts[0] || 0
      });
      
      if (pageCount > 10) {
        const middleIndex = Math.floor(pageCount / 2);
        extractedChapters.push({
          title: "Middle Section",
          pageIndex: middleIndex,
          position: 0,
          wordCount: wordCounts[middleIndex] || 0
        });
        
        if (pageCount > 20) {
          const finalIndex = Math.floor(pageCount * 0.8);
          extractedChapters.push({
            title: "Final Section",
            pageIndex: finalIndex,
            position: 0,
            wordCount: wordCounts[finalIndex] || 0
          });
        }
      }
    }
    
    const initialExpandedState = {};
    Object.keys(extractedSections).forEach(key => {
      initialExpandedState[key] = false;
    });
    
    setChapters(extractedChapters);
    setSections(extractedSections);
    setExpandedSections(initialExpandedState);
    setIsLoading(false);
  }, [bookContent, wordCounts, contentPages]);
  
  const toggleSection = (chapterIndex) => {
    setExpandedSections(prev => ({
      ...prev,
      [chapterIndex]: !prev[chapterIndex]
    }));
  };
  
  const totalWords = wordCounts.reduce((sum, count) => sum + (count || 0), 0);
  
  const getThemeClasses = () => {
    if (darkMode) {
      return {
        background: 'bg-amber-900',
        text: 'text-amber-50',
        headerText: 'text-amber-100',
        border: 'border-amber-700',
        hover: 'hover:bg-amber-800',
        muted: 'text-amber-300',
        mutedLight: 'text-amber-400',
        divider: 'border-amber-700',
        loader: 'border-amber-300',
        button: 'bg-amber-800 hover:bg-amber-700'
      };
    } else {
      return {
        background: 'bg-amber-50',
        text: 'text-amber-900',
        headerText: 'text-amber-800',
        border: 'border-amber-200',
        hover: 'hover:bg-amber-100',
        muted: 'text-amber-700',
        mutedLight: 'text-amber-600',
        divider: 'border-amber-200',
        loader: 'border-amber-600',
        button: 'bg-amber-100 hover:bg-amber-200'
      };
    }
  };
  
  const theme = getThemeClasses();
  
  if (isLoading) {
    return (
      <div className={`p-6 rounded-sm shadow-md ${theme.background} ${theme.text}`}>
        <div className="flex justify-center items-center h-32">
          <div className={`animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 ${theme.loader}`}></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`p-6 rounded-sm shadow-md ${theme.background} ${theme.text}`}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BookOpenIcon className="h-6 w-6 mr-2 text-amber-600" />
          <h2 className={`text-xl font-serif font-bold ${theme.headerText}`}>Table of Contents</h2>
        </div>
        {totalWords > 0 && (
          <span className={`text-sm ${theme.mutedLight} font-medium`}>
            {totalWords.toLocaleString()} words total
          </span>
        )}
      </div>
      
      {chapters.length === 0 ? (
        <div className="text-center py-8">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <p className={`mt-4 italic ${theme.muted}`}>No chapters found in this document</p>
        </div>
      ) : (
        <ul className="space-y-2">
          <AnimatePresence>
            {chapters.map((chapter, index) => {
              const sectionsForChapter = expandedSections[index] ? (sections[index] || []) : [];
              const hasSubsections = Array.isArray(sections[index]) && sections[index].length > 0;
              
              return (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className={`border-b ${theme.divider} last:border-0 pb-2`}
                >
                  <div className="flex justify-between items-center">
                    <motion.button
                      whileHover={{ x: 2 }}
                      onClick={() => onChapterClick(chapter.pageIndex)}
                      className={`text-left py-2 px-3 rounded-sm transition-colors flex-grow font-serif ${theme.hover}`}
                    >
                      <span className="font-medium">{chapter.title}</span>
                      <span className={`text-xs ml-2 ${theme.mutedLight}`}>
                        (Page {chapter.pageIndex + 1})
                      </span>
                    </motion.button>
                    
                    {hasSubsections && (
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toggleSection(index)}
                        className={`ml-2 p-1 rounded-full ${theme.button} transition-all duration-200`}
                        aria-label={expandedSections[index] ? "Collapse sections" : "Expand sections"}
                      >
                        {expandedSections[index] ? 
                          <ChevronUpIcon className="h-4 w-4" /> : 
                          <ChevronDownIcon className="h-4 w-4" />
                        }
                      </motion.button>
                    )}
                  </div>
                  
                  <AnimatePresence>
                    {hasSubsections && expandedSections[index] && (
                      <motion.ul 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="pl-8 mt-1 space-y-1 overflow-hidden"
                      >
                        {sections[index].map((section, sectionIndex) => (
                          <motion.li 
                            key={`section-${index}-${sectionIndex}`}
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: sectionIndex * 0.05 }}
                          >
                            <motion.button
                              whileHover={{ x: 2 }}
                              onClick={() => onChapterClick(section.pageIndex)}
                              className={`text-left p-2 text-sm rounded-sm w-full transition-colors ${theme.hover} ${theme.muted}`}
                            >
                              {section.title}
                              <span className={`text-xs ${theme.mutedLight} ml-2`}>
                                (Page {section.pageIndex + 1})
                              </span>
                            </motion.button>
                          </motion.li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                  
                  {chapter.wordCount > 0 && (
                    <div className={`pl-3 mt-1 text-xs ${theme.mutedLight}`}>
                      {chapter.wordCount.toLocaleString()} words
                    </div>
                  )}
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
      
      {chapters.length > 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`mt-6 pt-4 border-t ${theme.divider}`}
        >
          <div className={`flex justify-between items-center text-sm ${theme.mutedLight}`}>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <span>{chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}</span>
            </div>
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <span>{wordCounts.length} {wordCounts.length === 1 ? 'Page' : 'Pages'}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default BookTableOfContents;