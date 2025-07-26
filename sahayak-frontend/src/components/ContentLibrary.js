'use client';
import { useState, useEffect } from 'react';
import { FolderOpen, Search, Filter, Download, Eye, Heart, Share2, Trash2 } from 'lucide-react';
import api from '@/lib/api';

export default function ContentLibrary({ teacherId }) {
  const [content, setContent] = useState([]);
  const [filteredContent, setFilteredContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [favorites, setFavorites] = useState(new Set());

  const contentTypes = ['all', 'story', 'worksheet', 'lesson_plan', 'assessment', 'game'];
  const languages = ['all', 'hi', 'en', 'mr', 'bn', 'te', 'ta', 'gu'];

  useEffect(() => {
    fetchContent();
  }, [teacherId]);

  useEffect(() => {
    filterContent();
  }, [content, searchTerm, selectedType, selectedLanguage]);

const fetchContent = async () => {
  try {
    setLoading(true);
    const response = await api.getContentLibrary(teacherId, {
      limit: 100
    });
    
    if (response.success) {
      setContent(response.data);
    }
  } catch (error) {
    console.error('Failed to fetch content:', error);
  } finally {
    setLoading(false);
  }
};

  const filterContent = () => {
    let filtered = [...content];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item => 
        item.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.metadata?.topic?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(item => item.content_type === selectedType);
    }

    // Language filter
    if (selectedLanguage !== 'all') {
      filtered = filtered.filter(item => item.metadata?.language === selectedLanguage);
    }

    setFilteredContent(filtered);
  };

  const toggleFavorite = async (contentId) => {
    try {
      if (favorites.has(contentId)) {
        // Remove from favorites (API call would be needed)
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(contentId);
          return newSet;
        });
      } else {
        // Add to favorites
        await apiService.post('/content-management/favorites', {
          teacher_id: teacherId,
          content_id: contentId,
          content_type: content.find(c => c.id === contentId)?.content_type
        });
        
        setFavorites(prev => new Set([...prev, contentId]));
      }
    } catch (error) {
      console.error('Failed to update favorites:', error);
    }
  };

  const exportContent = async (contentIds) => {
    try {
      const response = await apiService.post('/export/export-content', {
        content_ids: contentIds,
        format: 'pdf'
      });
      
      // Handle file download
      const blob = new Blob([response], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'sahayak_content.pdf';
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const shareContent = async (contentId) => {
    try {
      const response = await apiService.post('/export/share-content', {
        content_id: contentId,
        share_type: 'view_only',
        expiry_days: 7
      });
      
      if (response.success) {
        navigator.clipboard.writeText(response.share_url);
        alert('Share link copied to clipboard!');
      }
    } catch (error) {
      console.error('Share failed:', error);
      alert('Share failed. Please try again.');
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      story: 'bg-blue-100 text-blue-800',
      worksheet: 'bg-green-100 text-green-800',
      lesson_plan: 'bg-purple-100 text-purple-800',
      assessment: 'bg-orange-100 text-orange-800',
      game: 'bg-pink-100 text-pink-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FolderOpen className="text-orange-600" size={28} />
        <h1 className="text-3xl font-bold text-gray-900">Content Library</h1>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            {contentTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type.replace('_', ' ').toUpperCase()}
              </option>
            ))}
          </select>
          
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
          >
            {languages.map(lang => (
              <option key={lang} value={lang}>
                {lang === 'all' ? 'All Languages' : lang.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Showing {filteredContent.length} of {content.length} items
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => exportContent(filteredContent.map(c => c.id))}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-orange-100 text-orange-800 rounded-lg hover:bg-orange-200 transition-colors"
            >
              <Download size={16} />
              Export All
            </button>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {filteredContent.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredContent.map((item) => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.content_type)}`}>
                  {item.content_type?.replace('_', ' ').toUpperCase()}
                </span>
                <button
                  onClick={() => toggleFavorite(item.id)}
                  className={`p-1 rounded ${favorites.has(item.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
                >
                  <Heart size={16} fill={favorites.has(item.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">
                {item.metadata?.topic || 'Untitled Content'}
              </h3>
              
              <div className="text-sm text-gray-600 mb-3">
                <p>Grade: {item.metadata?.grade_level || 'N/A'}</p>
                <p>Language: {item.metadata?.language?.toUpperCase() || 'N/A'}</p>
                <p>Created: {formatDate(item.created_at)}</p>
              </div>

              <div className="bg-gray-50 rounded p-3 mb-4 max-h-20 overflow-hidden">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {item.content?.substring(0, 100)}...
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                    <Eye size={16} />
                  </button>
                  <button 
                    onClick={() => shareContent(item.id)}
                    className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={() => exportContent([item.id])}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                  >
                    <Download size={16} />
                  </button>
                </div>
                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">
          <FolderOpen size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No content found</p>
          <p className="text-sm">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Pagination could be added here */}
    </div>
  );
}