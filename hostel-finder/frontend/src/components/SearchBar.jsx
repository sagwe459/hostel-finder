// src/components/SearchBar.jsx
// Keyword search input with submit handler.

import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({ onSearch, defaultValue = '' }) => {
  const [value, setValue] = useState(defaultValue);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form onSubmit={handleSubmit} className="relative flex items-center w-full">
      <FiSearch
        size={18}
        className="absolute left-4 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name, location, or description..."
        className="input !pl-11 !pr-24 !rounded-2xl !py-3 text-base shadow-sm"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-24 text-gray-400 hover:text-gray-600 p-1"
          aria-label="Clear search"
        >
          <FiX size={16} />
        </button>
      )}
      <button
        type="submit"
        className="absolute right-2 btn-primary !py-2 !px-4 !rounded-xl text-sm"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
