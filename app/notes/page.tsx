'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiSearch, FiCalendar, FiTag, FiEdit, FiTrash2 } from 'react-icons/fi';
import { BiCross } from 'react-icons/bi';
import { getFromLocalStorage, saveToLocalStorage, formatDate } from '@/lib/utils';
import { getReadingByDay } from '@/lib/readingPlan';
import toast from 'react-hot-toast';

export default function NotesPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [filteredNotes, setFilteredNotes] = useState<any[]>([]);

  useEffect(() => {
    const user = getFromLocalStorage('currentUser', null);
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
    });
    setProgress(userProgress);
    setFilteredNotes(userProgress.notes || []);
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

  const getAllTags = () => {
    if (!progress || !progress.notes) return [];
    
    const tags = new Set<string>();
    progress.notes.forEach((note: any) => {
      note.tags.forEach((tag: string) => tags.add(tag));
    });
    
    return Array.from(tags);
  };

  const deleteNote = (noteId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الملاحظة؟')) return;

    const updatedNotes = progress.notes.filter((n: any) => n.id !== noteId);
    const updatedProgress = {
      ...progress,
      notes: updatedNotes,
      lastUpdated: new Date().toISOString()
    };

    setProgress(updatedProgress);
    saveToLocalStorage(`progress_${currentUser.id}`, updatedProgress);
    toast.success('تم حذف الملاحظة');
  };

  if (!currentUser || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">جاري التحميل...</div>
      </div>
    );
  }

  const allTags = getAllTags();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-primary-600 transition-colors"
          >
            <FiArrowRight className="text-2xl" />
          </button>
          <div className="flex items-center gap-3">
            <BiCross className="text-3xl text-primary-600" />
            <span className="text-xl font-bold text-gray-800">ملاحظاتي</span>
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
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {progress.notes.length}
            </div>
            <div className="text-gray-600">إجمالي الملاحظات</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {allTags.length}
            </div>
            <div className="text-gray-600">الوسوم المستخدمة</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {filteredNotes.length}
            </div>
            <div className="text-gray-600">نتائج البحث</div>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في ملاحظاتك..."
              className="w-full pr-12 pl-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
              className="bg-white rounded-2xl p-12 shadow-lg text-center"
            >
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {searchQuery || selectedTag ? 'لا توجد نتائج' : 'لا توجد ملاحظات بعد'}
              </h3>
              <p className="text-gray-600 mb-6">
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
                  className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          اليوم {note.day}
                        </h3>
                        {reading?.book && (
                          <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-sm font-semibold">
                            {reading.book}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
                        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <FiEdit className="text-xl" />
                      </button>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <FiTrash2 className="text-xl" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-xl mb-4">
                    <p className="text-gray-800 whitespace-pre-wrap">{note.content}</p>
                  </div>

                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {note.tags.map((tag: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedTag(tag)}
                          className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold hover:bg-primary-200 transition-colors"
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