import React, { useState, useEffect, useRef } from 'react';
import CoreDataService from '@/services/coreDataService';
import { AppwriteService } from '@/services/appwriteService';
import { Skill } from '@/types/core';
import { XIcon } from '@heroicons/react/solid';

interface SkillSelectorProps {
  selectedSkills: string[];
  onChange: (skillIds: string[]) => void;
  maxSkills?: number;
}

const SkillSelector: React.FC<SkillSelectorProps> = ({
  selectedSkills,
  onChange,
  maxSkills = 10
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSkillsData, setSelectedSkillsData] = useState<Skill[]>([]);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const appwriteService = new AppwriteService();
  const coreDataService = new CoreDataService(appwriteService);
  
  useEffect(() => {
    // Fetch details for selected skills
    const fetchSelectedSkills = async () => {
      if (selectedSkills.length === 0) {
        setSelectedSkillsData([]);
        return;
      }
      
      try {
        const skillsData: Skill[] = [];
        
        for (const skillId of selectedSkills) {
          const skill = await coreDataService.getSkill(skillId);
          if (skill) {
            skillsData.push(skill);
          }
        }
        
        setSelectedSkillsData(skillsData);
      } catch (error) {
        console.error('Error fetching selected skills:', error);
      }
    };
    
    fetchSelectedSkills();
  }, [selectedSkills]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (!value.trim()) {
      setSuggestions([]);
      return;
    }
    
    setLoading(true);
    setShowSuggestions(true);
    
    try {
      const results = await coreDataService.searchSkills(value);
      // Filter out already selected skills
      const filteredResults = results.filter(skill => 
        !selectedSkills.includes(skill.$id)
      );
      setSuggestions(filteredResults);
    } catch (error) {
      console.error('Error searching skills:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSelectSkill = (skill: Skill) => {
    if (selectedSkills.length >= maxSkills) {
      alert(`You can select a maximum of ${maxSkills} skills.`);
      return;
    }
    
    if (!selectedSkills.includes(skill.$id)) {
      const newSelectedSkills = [...selectedSkills, skill.$id];
      onChange(newSelectedSkills);
      
      // Increment usage count
      coreDataService.incrementSkillUsage(skill.$id).catch(error => {
        console.error('Error incrementing skill usage:', error);
      });
    }
    
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };
  
  const handleRemoveSkill = (skillId: string) => {
    const newSelectedSkills = selectedSkills.filter(id => id !== skillId);
    onChange(newSelectedSkills);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && suggestions.length > 0) {
      e.preventDefault();
      handleSelectSkill(suggestions[0]);
    }
  };
  
  return (
    <div className="skill-selector">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedSkillsData.map(skill => (
          <div
            key={skill.$id}
            className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
          >
            {skill.name}
            <button
              type="button"
              onClick={() => handleRemoveSkill(skill.$id)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <XIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded"
          placeholder="Search for skills..."
          value={searchTerm}
          onChange={handleSearchChange}
          onFocus={() => {
            if (searchTerm.trim()) {
              setShowSuggestions(true);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={selectedSkills.length >= maxSkills}
        />
        
        {selectedSkills.length >= maxSkills && (
          <p className="text-xs text-red-500 mt-1">
            Maximum of {maxSkills} skills reached
          </p>
        )}
        
        {showSuggestions && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto"
          >
            {loading && (
              <div className="p-3 text-center text-gray-500">Loading...</div>
            )}
            
            {!loading && suggestions.length === 0 && searchTerm && (
              <div className="p-3 text-center text-gray-500">
                No skills found. Try a different search term.
              </div>
            )}
            
            {!loading && suggestions.map(skill => (
              <div
                key={skill.$id}
                className="p-3 hover:bg-gray-100 cursor-pointer"
                onClick={() => handleSelectSkill(skill)}
              >
                <div className="font-medium">{skill.name}</div>
                {skill.description && (
                  <div className="text-sm text-gray-600">{skill.description}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillSelector;