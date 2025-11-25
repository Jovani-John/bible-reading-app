'use client';

import { useRouter, usePathname } from 'next/navigation';
import { FiHome, FiBook, FiEdit3, FiSettings, FiLogOut } from 'react-icons/fi';
import { BiCross } from 'react-icons/bi';
import toast from 'react-hot-toast';

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();
  
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    toast.success('تم تسجيل الخروج بنجاح');
    router.push('/');
  };
  
  const navItems = [
    { icon: FiHome, label: 'الرئيسية', path: '/dashboard' },
    { icon: FiEdit3, label: 'ملاحظاتي', path: '/notes' },
    { icon: FiSettings, label: 'الإعدادات', path: '/profile' },
  ];
  
  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <BiCross className="text-3xl text-primary-600" />
            <span className="text-xl font-bold text-gray-800">قراءة يوم</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              
              return (
                <button
                  key={item.path}
                  onClick={() => router.push(item.path)}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all
                    ${isActive 
                      ? 'bg-primary-600 text-white' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }
                  `}
                >
                  <Icon className="text-xl" />
                  <span>{item.label}</span>
                </button>
              );
            })}
            
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-all"
            >
              <FiLogOut className="text-xl" />
              <span>خروج</span>
            </button>
          </div>
          
          {/* Mobile Navigation */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => router.push('/profile')}
              className="text-gray-600 hover:text-primary-600 transition-colors"
            >
              <FiSettings className="text-2xl" />
            </button>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <FiLogOut className="text-2xl" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
        <div className="flex justify-around items-center py-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all
                  ${isActive ? 'text-primary-600' : 'text-gray-600'}
                `}
              >
                <Icon className="text-2xl" />
                <span className="text-xs font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}