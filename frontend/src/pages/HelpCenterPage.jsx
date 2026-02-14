import React from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { HelpCenter } from '../components/HelpCenterTemplate';

/**
 * Help Center Page
 * Provides documentation, guides, and support resources
 */
export function HelpCenterPage() {
  const navigate = useNavigate();

  const handleArticleClick = (categoryId, articleId) => {
    console.log('Article viewed:', categoryId, articleId);
    // Could track analytics here
  };

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <DashboardLayout>
      <div className="-m-6 lg:-m-8">
        <HelpCenter 
          onArticleClick={handleArticleClick}
          onNavigate={handleNavigate}
        />
      </div>
    </DashboardLayout>
  );
}

export default HelpCenterPage;
