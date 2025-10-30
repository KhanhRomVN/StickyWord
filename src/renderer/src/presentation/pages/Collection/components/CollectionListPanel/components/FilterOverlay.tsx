import React from 'react'
import CustomOverlay from '../../../../../../components/common/CustomOverlay'
import CustomButton from '../../../../../../components/common/CustomButton'
import CustomCombobox from '../../../../../../components/common/CustomCombobox'
import { Filter, X, RotateCcw } from 'lucide-react'
import { cn } from '../../../../../../shared/lib/utils'

interface FilterOverlayProps {
  isOpen: boolean
  onClose: () => void
  filters: {
    item_type: string[]
    difficulty_level: string[]
    frequency_rank: string[]
    category: string[]
    tags: string[]
  }
  onFiltersChange: (filters: {
    item_type: string[]
    difficulty_level: string[]
    frequency_rank: string[]
    category: string[]
    tags: string[]
  }) => void
  availableItemTypes: string[]
  availableDifficultyLevels: string[]
  availableFrequencyRanks: string[]
  availableCategories: string[]
  availableTags: string[]
  className?: string
}

const FilterOverlay: React.FC<FilterOverlayProps> = ({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  availableItemTypes,
  availableDifficultyLevels,
  availableFrequencyRanks,
  availableCategories,
  availableTags,
  className
}) => {
  const hasActiveFilters =
    filters.item_type.length > 0 ||
    filters.difficulty_level.length > 0 ||
    filters.frequency_rank.length > 0 ||
    filters.category.length > 0 ||
    filters.tags.length > 0

  const handleItemTypeChange = (values: string | string[]) => {
    const item_type = Array.isArray(values) ? values : [values]
    onFiltersChange({ ...filters, item_type })
  }

  const handleDifficultyChange = (values: string | string[]) => {
    const difficulty_level = Array.isArray(values) ? values : [values]
    onFiltersChange({ ...filters, difficulty_level })
  }

  const handleFrequencyChange = (values: string | string[]) => {
    const frequency_rank = Array.isArray(values) ? values : [values]
    onFiltersChange({ ...filters, frequency_rank })
  }

  const handleCategoryChange = (values: string | string[]) => {
    const category = Array.isArray(values) ? values : [values]
    onFiltersChange({ ...filters, category })
  }

  const handleTagsChange = (values: string | string[]) => {
    const tags = Array.isArray(values) ? values : [values]
    onFiltersChange({ ...filters, tags })
  }

  const handleReset = () => {
    const resetFilters = {
      item_type: [],
      difficulty_level: [],
      frequency_rank: [],
      category: [],
      tags: []
    }
    onFiltersChange(resetFilters)
  }

  const itemTypeOptions = availableItemTypes.map((type) => ({
    value: type,
    label: type.charAt(0).toUpperCase() + type.slice(1)
  }))

  const difficultyOptions = availableDifficultyLevels.map((level) => ({
    value: level,
    label: `Level ${level}`
  }))

  const frequencyOptions = availableFrequencyRanks.map((rank) => ({
    value: rank,
    label: `Rank ${rank}`
  }))

  const categoryOptions = availableCategories.map((cat) => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }))

  const tagOptions = availableTags.map((tag) => ({
    value: tag,
    label: tag
  }))

  return (
    <CustomOverlay
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Collections"
      subtitle={
        hasActiveFilters
          ? `${
              filters.item_type.length +
              filters.difficulty_level.length +
              filters.frequency_rank.length +
              filters.category.length +
              filters.tags.length
            } filter(s) active`
          : 'No filters applied'
      }
      position="right"
      width="380px"
      height="auto"
      gap={4}
      animationType="slide"
      showCloseButton={true}
      className={className}
      footerActions={
        hasActiveFilters ? (
          <CustomButton variant="ghost" size="sm" onClick={handleReset} icon={RotateCcw}>
            Reset All Filters
          </CustomButton>
        ) : undefined
      }
    >
      <div className="p-4 space-y-6">
        {/* Filter Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-2">
            <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                Filter your collections by type, difficulty, frequency, category, or tags.
              </p>
            </div>
          </div>
        </div>

        {/* Item Type Filter */}
        <div className="space-y-2">
          <CustomCombobox
            label="Item Type"
            value={filters.item_type}
            options={itemTypeOptions}
            onChange={handleItemTypeChange}
            placeholder="Select types..."
            multiple={true}
            searchable={true}
            size="sm"
          />
        </div>

        {/* Difficulty Level Filter */}
        <div className="space-y-2">
          <CustomCombobox
            label="Difficulty Level"
            value={filters.difficulty_level}
            options={difficultyOptions}
            onChange={handleDifficultyChange}
            placeholder="Select difficulty..."
            multiple={true}
            searchable={true}
            size="sm"
          />
        </div>

        {/* Frequency Rank Filter */}
        <div className="space-y-2">
          <CustomCombobox
            label="Frequency Rank"
            value={filters.frequency_rank}
            options={frequencyOptions}
            onChange={handleFrequencyChange}
            placeholder="Select frequency..."
            multiple={true}
            searchable={true}
            size="sm"
          />
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <CustomCombobox
            label="Category"
            value={filters.category}
            options={categoryOptions}
            onChange={handleCategoryChange}
            placeholder="Select categories..."
            multiple={true}
            searchable={true}
            size="sm"
          />
        </div>

        {/* Tags Filter */}
        <div className="space-y-2">
          <CustomCombobox
            label="Tags"
            value={filters.tags}
            options={tagOptions}
            onChange={handleTagsChange}
            placeholder="Select tags..."
            multiple={true}
            searchable={true}
            size="sm"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Filter by custom tags you've assigned
          </p>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Active Filters
              </span>
              <button
                onClick={handleReset}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
              >
                <X className="h-3 w-3" />
                Clear all
              </button>
            </div>

            <div className="space-y-2">
              {/* Item Type Tags */}
              {filters.item_type.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Item Type
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {filters.item_type.map((type) => (
                      <span
                        key={type}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1',
                          'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                          'text-xs rounded-md font-medium'
                        )}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                        <button
                          onClick={() => {
                            onFiltersChange({
                              ...filters,
                              item_type: filters.item_type.filter((t) => t !== type)
                            })
                          }}
                          className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Difficulty Tags */}
              {filters.difficulty_level.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Difficulty
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {filters.difficulty_level.map((level) => (
                      <span
                        key={level}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1',
                          'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                          'text-xs rounded-md font-medium'
                        )}
                      >
                        Level {level}
                        <button
                          onClick={() => {
                            onFiltersChange({
                              ...filters,
                              difficulty_level: filters.difficulty_level.filter((l) => l !== level)
                            })
                          }}
                          className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Frequency Tags */}
              {filters.frequency_rank.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Frequency
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {filters.frequency_rank.map((rank) => (
                      <span
                        key={rank}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1',
                          'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
                          'text-xs rounded-md font-medium'
                        )}
                      >
                        Rank {rank}
                        <button
                          onClick={() => {
                            onFiltersChange({
                              ...filters,
                              frequency_rank: filters.frequency_rank.filter((r) => r !== rank)
                            })
                          }}
                          className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Tags */}
              {filters.category.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Category
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {filters.category.map((cat) => (
                      <span
                        key={cat}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1',
                          'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
                          'text-xs rounded-md font-medium'
                        )}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        <button
                          onClick={() => {
                            onFiltersChange({
                              ...filters,
                              category: filters.category.filter((c) => c !== cat)
                            })
                          }}
                          className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tag Filters */}
              {filters.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Tags
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'inline-flex items-center gap-1 px-2 py-1',
                          'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
                          'text-xs rounded-md font-medium'
                        )}
                      >
                        {tag}
                        <button
                          onClick={() => {
                            onFiltersChange({
                              ...filters,
                              tags: filters.tags.filter((t) => t !== tag)
                            })
                          }}
                          className="hover:bg-teal-200 dark:hover:bg-teal-800 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* No Filters State */}
        {!hasActiveFilters && (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Filter className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No filters active. Use the options above to filter your collections.
            </p>
          </div>
        )}
      </div>
    </CustomOverlay>
  )
}

export default FilterOverlay
