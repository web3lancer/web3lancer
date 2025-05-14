import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import ProjectFilters, { ProjectFilters as FilterTypes } from './ProjectFilters';
import projectService from '@/services/projectService';
import { Project } from '@/types';

// Skills list for filtering (this could come from an API endpoint)
const SKILLS = [
  'React', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 
  'Solidity', 'Web3', 'Smart Contracts', 'Blockchain',
  'UI/UX', 'Design', 'Backend', 'Frontend', 'Full Stack',
  'AWS', 'Cloud', 'Database', 'Rust', 'Go', 'DevOps'
];

// Categories list
const CATEGORIES = [
  'Development', 'Design', 'Marketing', 'Writing', 'Admin Support',
  'Blockchain', 'Smart Contracts', 'NFT', 'DeFi', 'DAO', 'Metaverse'
];

interface ProjectListingProps {
  initialProjects?: Project[];
  initialTotal?: number;
}

const ProjectListing: React.FC<ProjectListingProps> = ({ 
  initialProjects = [], 
  initialTotal = 0 
}) => {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [total, setTotal] = useState<number>(initialTotal);
  const [filters, setFilters] = useState<FilterTypes>({
    query: '',
    skills: [],
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    // Skip if we already have initial projects and are on the first page
    if (initialProjects.length > 0 && page === 1 && !filters.query && filters.skills.length === 0) {
      return;
    }
    
    fetchProjects();
  }, [filters, page]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const result = await projectService.searchProjects({
        query: filters.query,
        skills: filters.skills,
        minBudget: filters.minBudget,
        maxBudget: filters.maxBudget,
        category: filters.category,
        page,
        limit: itemsPerPage
      });
      
      setProjects(result.projects);
      setTotal(result.total);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: FilterTypes) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate total pages
  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-1">
        <ProjectFilters
          onFilterChange={handleFilterChange}
          skills={SKILLS}
          categories={CATEGORIES}
          initialFilters={filters}
        />
      </div>
      
      <div className="md:col-span-3">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 mb-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Projects {total > 0 && `(${total})`}
            </h2>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {projects.length} of {total} projects
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-4">
            {projects.map(project => (
              <ProjectCard key={project.$id} project={project} />
            ))}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="inline-flex rounded-md shadow">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-l-md ${
                      page === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 ${
                        pageNum === page
                          ? 'z-10 bg-blue-600 text-white dark:bg-blue-700 border-blue-600 dark:border-blue-700'
                          : 'text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-r-md ${
                      page === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-8 text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-gray-500 dark:text-gray-400">
              Try adjusting your filters or search terms to find more projects.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectListing;