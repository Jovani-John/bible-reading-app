'use client';

import { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { FiArrowRight, FiCheckCircle, FiClock, FiBook, FiEdit3, FiSave } from 'react-icons/fi';
import { BiCross } from 'react-icons/bi';
import { getReadingByDay } from '@/lib/readingPlan';
import { getFromLocalStorage, saveToLocalStorage, calculateReadingTime, formatDate, generateId } from '@/lib/utils';
import toast from 'react-hot-toast';

// Define TypeScript interfaces
interface User {
  id: string;
  name: string;
  email: string;
}

interface Note {
  id: string;
  userId: string;
  day: number;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Progress {
  userId: string;
  completedDays: number[];
  notes: Note[];
  lastUpdated: string;
}

interface Reading {
  day: number;
  date: string;
  book?: string;
  summary?: string;
  readings: string[];
}

export default function ReadingPage({ params }: { params: Promise<{ day: string }> }) {
  const { day } = use(params);
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [reading, setReading] = useState<Reading | null>(null);
  const [note, setNote] = useState('');
  const [tags, setTags] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getFromLocalStorage<User | null>('currentUser', null);
    if (!user) {
      router.push('/login');
      return;
    }
    
    setCurrentUser(user);
    const userProgress = getFromLocalStorage<Progress>(`progress_${user.id}`, {
      userId: user.id,
      completedDays: [],
      notes: [],
      lastUpdated: new Date().toISOString()
    });
    setProgress(userProgress);
    
    const dayNumber = parseInt(day);
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 40) {
      toast.error('اليوم المطلوب غير موجود');
      router.push('/dashboard');
      return;
    }
    
    const dayReading = getReadingByDay(dayNumber);
    if (!dayReading) {
      toast.error('لم يتم العثور على بيانات القراءة');
      router.push('/dashboard');
      return;
    }
    
    setReading(dayReading);

    // Load existing note
    const existingNote = userProgress.notes.find((n: Note) => n.day === dayNumber);
    if (existingNote) {
      setNote(existingNote.content);
      setTags(existingNote.tags.join(', '));
    }
    
    setIsLoading(false);
  }, [day, router]);

  const toggleCompletion = () => {
    if (!progress || !reading || !currentUser) return;
    
    const completedDays = [...progress.completedDays];
    const index = completedDays.indexOf(reading.day);
    
    if (index > -1) {
      completedDays.splice(index, 1);
      toast.success('تم إلغاء تحديد اليوم');
    } else {
      completedDays.push(reading.day);
      toast.success('رائع! تم إكمال القراءة');
    }
    
    const updatedProgress: Progress = {
      ...progress,
      completedDays,
      lastUpdated: new Date().toISOString()
    };
    
    setProgress(updatedProgress);
    saveToLocalStorage(`progress_${currentUser.id}`, updatedProgress);
  };

  const saveNote = () => {
    if (!progress || !reading || !currentUser) return;

    const notes = progress.notes.filter((n: Note) => n.day !== reading.day);
    
    if (note.trim()) {
      const newNote: Note = {
        id: generateId(),
        userId: currentUser.id,
        day: reading.day,
        content: note.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(t => t),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      notes.push(newNote);
    }

    const updatedProgress: Progress = {
      ...progress,
      notes,
      lastUpdated: new Date().toISOString()
    };

    setProgress(updatedProgress);
    saveToLocalStorage(`progress_${currentUser.id}`, updatedProgress);
    setIsEditingNote(false);
    toast.success('تم حفظ الملاحظة');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-xl text-gray-800">جاري التحميل...</div>
      </div>
    );
  }

  if (!currentUser || !progress || !reading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-xl text-gray-800">حدث خطأ في تحميل البيانات</div>
      </div>
    );
  }

  const isCompleted = progress.completedDays.includes(reading.day);
  const readingTime = calculateReadingTime(reading.readings);

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
            <span className="text-xl font-bold text-gray-800">اليوم {reading.day}</span>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-8 shadow-lg mb-6"
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                اليوم {reading.day}
              </h1>
              <p className="text-gray-600">{formatDate(reading.date)}</p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <FiClock />
              <span>{readingTime} دقيقة</span>
            </div>
          </div>

          {/* Book Badge */}
          {reading.book && (
            <div className="inline-block bg-primary-100 text-primary-700 px-4 py-2 rounded-lg font-semibold mb-4">
              <FiBook className="inline ml-2" />
              {reading.book}
            </div>
          )}

          {/* Summary */}
          {reading.summary && (
            <div className="bg-blue-50 border-r-4 border-blue-500 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-gray-800 mb-2">نظرة عامة:</h3>
              <p className="text-gray-700">{reading.summary}</p>
            </div>
          )}

          {/* Readings */}
          <div className="mb-6">
            <h3 className="font-bold text-gray-800 mb-3">القراءات المطلوبة:</h3>
            <div className="flex flex-wrap gap-3">
              {reading.readings.map((r: string, index: number) => (
                <span
                  key={index}
                  className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-md"
                >
                  {r}
                </span>
              ))}
            </div>
          </div>

          {/* Completion Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={toggleCompletion}
            className={`
              w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-300
              ${isCompleted 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }
            `}
          >
            <FiCheckCircle className="inline ml-2 text-2xl" />
            {isCompleted ? 'تم إكمال القراءة' : 'وضع علامة كمكتمل'}
          </motion.button>
        </motion.div>

        {/* Notes Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              <FiEdit3 className="inline ml-2" />
              ملاحظاتي
            </h2>
            {!isEditingNote && note && (
              <button
                onClick={() => setIsEditingNote(true)}
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                تعديل
              </button>
            )}
          </div>

          {isEditingNote || !note ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  الملاحظة
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none"
                  placeholder="اكتب تأملاتك وملاحظاتك هنا..."
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  الوسوم (اختياري)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
                  placeholder="مثال: صلاة، تأمل، درس"
                />
                <p className="text-sm text-gray-500 mt-1">افصل الوسوم بفاصلة</p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveNote}
                  className="flex-1 bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <FiSave className="inline ml-2" />
                  حفظ الملاحظة
                </motion.button>
                {note && (
                  <button
                    onClick={() => {
                      setIsEditingNote(false);
                      const existingNote = progress.notes.find((n: Note) => n.day === reading.day);
                      if (existingNote) {
                        setNote(existingNote.content);
                        setTags(existingNote.tags.join(', '));
                      }
                    }}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-colors"
                  >
                    إلغاء
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="bg-gray-50 p-6 rounded-xl mb-4">
                <p className="text-gray-800 whitespace-pre-wrap">{note}</p>
              </div>
              {tags && (
                <div className="flex flex-wrap gap-2">
                  {tags.split(',').map((tag, index) => (
                    <span
                      key={index}
                      className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-semibold"
                    >
                      #{tag.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-6">
          {reading.day > 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/reading/${reading.day - 1}`)}
              className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300"
            >
              اليوم السابق
            </motion.button>
          )}
          {reading.day < 40 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push(`/reading/${reading.day + 1}`)}
              className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300"
            >
              اليوم التالي
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
}