'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiSearch, FiCalendar, FiTag, FiEdit, FiTrash2 } from 'react-icons/fi';
import { BiCross } from 'react-icons/bi';
import { getFromLocalStorage, saveToLocalStorage, formatDate } from '@/lib/utils';
import { getReadingByDay } from '@/lib/readingPlan';
import toast from 'react-hot-toast';

// Type definitions
interface User {
  id: string;
  name: string;
  email: string;
  notificationsEnabled?: boolean;
  notificationTime?: string;
}

interface Note {
  id: string;
  day: number;
  content: string;
  tags: string[];
  createdAt: string;
}

interface Progress {
  userId: string;
  completedDays: number[];
  notes: Note[];
  lastUpdated: string;
}

export default function NotesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getFromLocalStorage('currentUser', null) as User | null;
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentUser(user);
    const userProgress = getFromLocalStorage(`progress_${user.id}`, {
      userId: user.id,
      completedDays: [],
      notes: [],
      lastUpdated: new Date().toISOString()
    }) as Progress;
    
    setProgress(userProgress);
    setFilteredNotes(userProgress.notes || []);
    setIsLoading(false);
  }, [router]);

  useEffect(() => {
    if (!progress) return;

    let notes = [...(progress.notes || [])];

    // Filter by search query
    if (searchQuery.trim()) {
      notes = notes.filter(note => 
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by selected tag
    if (selectedTag) {
      notes = notes.filter(note => note.tags.includes(selectedTag));
    }

    // Sort by day (newest first)
    notes.sort((a, b) => b.day - a.day);

    setFilteredNotes(notes);
  }, [searchQuery, selectedTag, progress]);

  const getAllTags = (): string[] => {
    if (!progress || !progress.notes) return [];
    
    const tags = new Set<string>();
    progress.notes.forEach((note: Note) => {
      note.tags.forEach((tag: string) => tags.add(tag));
    });
    
    return Array.from(tags);
  };

  const deleteNote = (noteId: string) => {
    if (!currentUser || !progress) return;
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;

    const updatedNotes = progress.notes.filter((n: Note) => n.id !== noteId);
    const updatedProgress: Progress = {
      ...progress,
      notes: updatedNotes,
      lastUpdated: new Date().toISOString()
    };

    setProgress(updatedProgress);
    saveToLocalStorage(`progress_${currentUser.id}`, updatedProgress);
    toast.success('تم حذف الملاحظة');
  };

  if (isLoading || !currentUser || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="text-xl text-gray-800 dark:text-gray-200">جاري التحميل...</div>
      </div>
    );
  }

  const allTags = getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-md transition-colors duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
          >
            <FiArrowRight className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <BiCross className="text-3xl text-primary-600 dark:text-primary-400" />
            <span className="text-xl font-bold text-gray-800 dark:text-gray-100">ملاحظاتي</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors duration-300">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {progress.notes.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">إجمالي الملاحظات</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors duration-300">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {allTags.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">الوسوم المستخدمة</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg transition-colors duration-300">
            <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
              {filteredNotes.length}
            </div>
            <div className="text-gray-600 dark:text-gray-400">نتائج البحث</div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg mb-8 transition-colors duration-300"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في ملاحظاتك..."
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-primary-500 focus:outline-none transition-colors bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <FiTag />
                تصفية حسب الوسم
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag(null)}
                  className={`
                    px-4 py-2 rounded-lg font-semibold transition-colors
                    ${!selectedTag 
                      ? 'bg-primary-600 text-white' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  الكل
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`
                      px-4 py-2 rounded-lg font-semibold transition-colors
                      ${selectedTag === tag 
                        ? 'bg-primary-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }
                    `}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Notes List */}
        <div className="space-y-6">
          {filteredNotes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-12 shadow-lg text-center transition-colors duration-300"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                {searchQuery || selectedTag ? 'لا توجد نتائج' : 'لا توجد ملاحظات بعد'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchQuery || selectedTag 
                  ? 'جرب البحث بكلمات مختلفة أو امسح الفلاتر'
                  : 'ابدأ بقراءة الكتاب المقدس وكتابة تأملاتك'
                }
              </p>
              {!searchQuery && !selectedTag && (
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-primary-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors"
                >
                  ابدأ القراءة
                </button>
              )}
            </motion.div>
          ) : (
            filteredNotes.map((note, index) => {
              const reading = getReadingByDay(note.day);
              
              return (
                <motion.div
                  key={note.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                          اليوم {note.day}
                        </h3>
                        {reading?.book && (
                          <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-lg text-sm font-semibold">
                            {reading.book}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiCalendar />
                          {formatDate(new Date(note.createdAt))}
                        </span>
                        {reading && (
                          <span>
                            {reading.readings.join(' • ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => router.push(`/reading/${note.day}`)}
                        className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                      >
                        <FiEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl mb-4">
                    <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.content}</p>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTag(tag)}
                          className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-semibold hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}