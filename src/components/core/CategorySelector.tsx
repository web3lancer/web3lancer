import React, { useState, useEffect } from 'react';
import CoreDataService from '@/services/coreDataService';
import { AppwriteService } from '@/services/appwriteService';
import { Category } from '@/types/core';

interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onChange: (categoryId: string) => void;
  showSubcategories?: boolean;
  label?: string;
  required?: boolean;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onChange,
  showSubcategories = true,
  label = 'Category',
  required = false
}) => {
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRootCategoryId, setSelectedRootCategoryId] = useState<string | null>(null);
  
  const appwriteService = new AppwriteService();
  const coreDataService = new CoreDataService(appwriteService);
  
  useEffect(() => {
    const fetchRootCategories = async () => {
      try {
        setLoading(true);
        const categories = await coreDataService.listCategories(); // No parent ID for root categories
        setRootCategories(categories);
      } catch (error) {
        console.error('Error fetching root categories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRootCategories();
  }, []);
  
  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!selectedRootCategoryId || !showSubcategories) {
        setSubcategories([]);
        return;
      }
      
      try {
        setLoading(true);
        const categories = await coreDataService.listCategories(selectedRootCategoryId);
        setSubcategories(categories);
      } catch (error) {
        console.error('Error fetching subcategories:', error);
        setSubcategories([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubcategories();
  }, [selectedRootCategoryId, showSubcategories]);
  
  useEffect(() => {
    const determineSelectedRoot = async () => {
      if (!selectedCategoryId) {
        setSelectedRootCategoryId(null);
        return;
      }
      
      try {
        const category = await coreDataService.getCategory(selectedCategoryId);
        
        if (!category) {
          setSelectedRootCategoryId(null);
          return;
        }
        
        if (category.parentCategoryId) {
          // It's a subcategory, so set the parent as the root
          setSelectedRootCategoryId(category.parentCategoryId);
        } else {
          // It's a root category
          setSelectedRootCategoryId(category.$id);
        }
      } catch (error) {
        console.error('Error determining selected root category:', error);
      }
    };
    
    determineSelectedRoot();
  }, [selectedCategoryId]);
  
  const handleRootCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedRootCategoryId(value || null);
    
    if (!showSubcategories || !value) {
      onChange(value);
    } else {
      // Don't update the selected category yet if we're showing subcategories
      // Wait for the user to select a subcategory or explicitly use this root one
    }
  };
  
  const handleSubcategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onChange(value || (selectedRootCategoryId || ''));
  };
  
  if (loading && rootCategories.length === 0) {
    return <div className="text-gray-500">Loading categories...</div>;
  }
  
  return (
    <div className="space-y-3">
      <div>
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="rootCategory">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <select
          id="rootCategory"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          value={selectedRootCategoryId || ''}
          onChange={handleRootCategoryChange}
          required={required}
        >
          <option value="">Select {label.toLowerCase()}</option>
          {rootCategories.map(category => (
            <option key={category.$id} value={category.$id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      {showSubcategories && selectedRootCategoryId && subcategories.length > 0 && (
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subcategory">
            Subcategory
          </label>
          <select
            id="subcategory"
            className="w-full px-3 py-2 border border-gray-300 rounded"
            value={selectedCategoryId || ''}
            onChange={handleSubcategoryChange}
          >
            <option value={selectedRootCategoryId}>-- Use main category --</option>
            {subcategories.map(category => (
              <option key={category.$id} value={category.$id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;