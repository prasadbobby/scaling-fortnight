'use client';

export default function Sidebar({ navigationItems, activeTab, onTabChange, isOpen, onClose }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed left-0 top-16 h-[calc(100vh-4rem)] w-72 bg-white shadow-xl transform transition-transform duration-300 z-50 border-r border-gray-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:relative lg:top-0 lg:h-screen lg:shadow-none
      `}>
        <div className="p-6 border-b border-gray-200 lg:hidden">
          <h2 className="text-lg font-semibold text-gray-800">Navigation</h2>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-full">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  onClose();
                }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group
                  ${activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }
                `}
              >
                <Icon size={20} className={`transition-transform duration-200 ${activeTab === item.id ? 'scale-110' : 'group-hover:scale-105'}`} />
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full"></div>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </>
  );
}