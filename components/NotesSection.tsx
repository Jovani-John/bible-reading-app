'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiEdit3, FiSave, FiX } from 'react-icons/fi';
import Button from './ui/Button';

interface NotesSectionProps {
  note: string;
  tags: string;
  onSave: (note: string, tags: string) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
}

export default function NotesSection({
  note,
  tags,
  onSave,
  isEditing,
  setIsEditing
}: NotesSectionProps) {
  
  const [tempNote, setTempNote] = useState(note);
  const [tempTags, setTempTags] = useState(tags);
  
  const handleSave = () => {
    onSave(tempNote, tempTags);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setTempNote(note);
    setTempTags(tags);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <FiEdit3 className="text-primary-600" />
          ملاحظاتي
        </h2>
        {!isEditing && note && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-primary-600 hover:text-primary-700 font-semibold transition-colors"
          >
            تعديل
          </button>
        )}
      </div>
      
      {isEditing || !note ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Note Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              الملاحظة
            </label>
            <textarea
              value={tempNote}
              onChange={(e) => setTempNote(e.target.value)}
              rows={6}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors resize-none"
              placeholder="اكتب تأملاتك وملاحظاتك هنا..."
            />
          </div>
          
          {/* Tags Input */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              الوسوم (اختياري)
            </label>
            <input
              type="text"
              value={tempTags}
              onChange={(e) => setTempTags(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none transition-colors"
              placeholder="مثال: صلاة، تأمل، درس"
            />
            <p className="text-sm text-gray-500 mt-1">افصل الوسوم بفاصلة</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={handleSave}
              variant="primary"
              fullWidth
            >
              <FiSave />
              حفظ الملاحظة
            </Button>
            
            {note && (
              <Button
                onClick={handleCancel}
                variant="secondary"
              >
                <FiX />
                إلغاء
              </Button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* Display Note */}
          <div className="bg-gray-50 p-6 rounded-xl mb-4">
            <p className="text-gray-800 whitespace-pre-wrap">{note}</p>
          </div>
          
          {/* Display Tags */}
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
        </motion.div>
      )}
    </div>
  );
}