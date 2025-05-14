import React from 'react';
import Link from 'next/link';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  className?: string;
  onClick?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  className = '',
  onClick
}) => {
  // Calculate time since posted
  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  return (
    <div 
      className={`bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 ${className}`}
      onClick={onClick}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <Link href={`/projects/${project.$id}`} className="hover:underline">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h3>
          </Link>
          <div className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm px-3 py-1 rounded-full">
            {project.budget.min}-{project.budget.max} {project.budget.currency}
          </div>
        </div>
        
        <p className="mt-2 text-gray-600 dark:text-gray-300 line-clamp-3">
          {project.description}
        </p>
        
        {project.skills && project.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {project.skills.slice(0, 4).map((skill, idx) => (
              <span 
                key={idx} 
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full"
              >
                {skill}
              </span>
            ))}
            {project.skills.length > 4 && (
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 rounded-full">
                +{project.skills.length - 4} more
              </span>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center">
            {project.duration && (
              <span className="flex items-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {project.duration.value} {project.duration.unit}
              </span>
            )}
            
            {project.location && (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {project.location}
              </span>
            )}
          </div>
          
          <span>
            {getTimeAgo(project.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;