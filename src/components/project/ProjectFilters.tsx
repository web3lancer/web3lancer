import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface ProjectFilterProps {
  onFilterChange: (filters: ProjectFilters) => void;
  categories?: string[];
  skills?: string[];
  initialFilters?: Partial<ProjectFilters>;
}

export interface ProjectFilters {
  query: string;
  skills: string[];
  minBudget?: number;
  maxBudget?: number;
  category?: string;
}

const ProjectFilters: React.FC<ProjectFilterProps> = ({ 
  onFilterChange,
  categories = [],
  skills = [],
  initialFilters = {}
}) => {
  const router = useRouter();
  
  const [filters, setFilters] = useState<ProjectFilters>({
    query: '',
    skills: [],
    ...initialFilters
  });

  // Extract filters from URL on initial load
  useEffect(() => {
    const { query, skills: skillsParam, minBudget, maxBudget, category } = router.query;
    
    const initialUrlFilters: Partial<ProjectFilters> = {};
    
    if (query && typeof query === 'string') {
      initialUrlFilters.query = query;
    }
    
    if (skillsParam) {
      const skillsArray = Array.isArray(skillsParam) 
        ? skillsParam 
        : [skillsParam];
      initialUrlFilters.skills = skillsArray;
    }
    
    if (minBudget && typeof minBudget === 'string') {
      initialUrlFilters.minBudget = parseInt(minBudget);
    }
    
    if (maxBudget && typeof maxBudget === 'string') {
      initialUrlFilters.maxBudget = parseInt(maxBudget);
    }
    
    if (category && typeof category === 'string') {
      initialUrlFilters.category = category;
    }
    
    if (Object.keys(initialUrlFilters).length > 0) {
      const updatedFilters = { ...filters, ...initialUrlFilters };
      setFilters(updatedFilters);
      onFilterChange(updatedFilters);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    const updatedFilters = { 
      ...filters, 
      [name]: value 
    };
    
    setFilters(updatedFilters);
    
    // Update URL with filters
    const urlParams = new URLSearchParams();
    if (updatedFilters.query) urlParams.set('query', updatedFilters.query);
    if (updatedFilters.category) urlParams.set('category', updatedFilters.category);
    if (updatedFilters.minBudget) urlParams.set('minBudget', updatedFilters.minBudget.toString());
    if (updatedFilters.maxBudget) urlParams.set('maxBudget', updatedFilters.maxBudget.toString());
    if (updatedFilters.skills.length) {
      updatedFilters.skills.forEach(skill => urlParams.append('skills', skill));
    }
    
    router.push(`${router.pathname}?${urlParams.toString()}`, undefined, { shallow: true });
    
    onFilterChange(updatedFilters);
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    const budgetValue = value ? parseInt(value) : undefined;
    
    const updatedFilters = { 
      ...filters, 
      [name]: budgetValue 
    };
    
    setFilters(updatedFilters);
    
    // Update URL
    const urlParams = new URLSearchParams(window.location.search);
    if (budgetValue) {
      urlParams.set(name, budgetValue.toString());
    } else {
      urlParams.delete(name);
    }
    
    router.push(`${router.pathname}?${urlParams.toString()}`, undefined, { shallow: true });
    
    onFilterChange(updatedFilters);
  };

  const handleSkillToggle = (skill: string) => {
    let updatedSkills: string[];
    
    if (filters.skills.includes(skill)) {
      updatedSkills = filters.skills.filter(s => s !== skill);
    } else {
      updatedSkills = [...filters.skills, skill];
    }
    
    const updatedFilters = {
      ...filters,
      skills: updatedSkills
    };
    
    setFilters(updatedFilters);
    
    // Update URL
    const urlParams = new URLSearchParams();
    if (updatedFilters.query) urlParams.set('query', updatedFilters.query);
    if (updatedFilters.category) urlParams.set('category', updatedFilters.category);
    if (updatedFilters.minBudget) urlParams.set('minBudget', updatedFilters.minBudget.toString());
    if (updatedFilters.maxBudget) urlParams.set('maxBudget', updatedFilters.maxBudget.toString());
    if (updatedFilters.skills.length) {
      updatedFilters.skills.forEach(skill => urlParams.append('skills', skill));
    }
    
    router.push(`${router.pathname}?${urlParams.toString()}`, undefined, { shallow: true });
    
    onFilterChange(updatedFilters);
  };

  const clearFilters = () => {
    const resetFilters = {
      query: '',
      skills: [],
      minBudget: undefined,
      maxBudget: undefined,
      category: undefined
    };
    
    setFilters(resetFilters);
    router.push(router.pathname, undefined, { shallow: true });
    onFilterChange(resetFilters);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Search & Filters</h3>
      
      <div className="space-y-4">
        {/* Search input */}
        <div>
          <label htmlFor="query" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search
          </label>
          <input
            type="text"
            id="query"
            name="query"
            value={filters.query}
            onChange={handleInputChange}
            placeholder="Search projects..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        
        {/* Category filter */}
        {categories.length > 0 && (
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={filters.category || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        )}
        
        {/* Budget range */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Budget Range</h4>
          <div className="flex space-x-4">
            <div>
              <label htmlFor="minBudget" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Min ($)
              </label>
              <input
                type="number"
                id="minBudget"
                name="minBudget"
                value={filters.minBudget || ''}
                onChange={handleBudgetChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="maxBudget" className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Max ($)
              </label>
              <input
                type="number"
                id="maxBudget"
                name="maxBudget"
                value={filters.maxBudget || ''}
                onChange={handleBudgetChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>
        
        {/* Skills filter */}
        {skills.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Skills</h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {skills.map(skill => (
                <div key={skill} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`skill-${skill}`}
                    checked={filters.skills.includes(skill)}
                    onChange={() => handleSkillToggle(skill)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`skill-${skill}`} className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Actions */}
        <div className="pt-2">
          <button
            onClick={clearFilters}
            className="w-full py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium rounded-md"
          >
            Clear All Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;