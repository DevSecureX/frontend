import { useState, useEffect, useMemo } from 'react'
import { useRepositoryStore } from '@/store'
import type { Repository } from '@/types/global'

interface SearchSuggestion {
  id: string
  text: string
  type: 'repository' | 'owner' | 'language' | 'description' | 'recent'
  repository?: Repository
  category?: string
}

export function useSearchAutocomplete(query: string) {
  const { repositories } = useRepositoryStore()
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [isOpen, setIsOpen] = useState(false)

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('devsecurex-recent-searches')
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5))
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error)
    }
  }, [])

  // Save search to recent searches
  const addRecentSearch = (searchTerm: string) => {
    if (!searchTerm.trim()) return
    
    const updated = [
      searchTerm.trim(),
      ...recentSearches.filter(s => s !== searchTerm.trim())
    ].slice(0, 5)
    
    setRecentSearches(updated)
    
    try {
      localStorage.setItem('devsecurex-recent-searches', JSON.stringify(updated))
    } catch (error) {
      console.error('Failed to save recent searches:', error)
    }
  }

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([])
    try {
      localStorage.removeItem('devsecurex-recent-searches')
    } catch (error) {
      console.error('Failed to clear recent searches:', error)
    }
  }

  // Generate suggestions based on current query
  const suggestions = useMemo(() => {
    const results: SearchSuggestion[] = []
    const queryLower = query.toLowerCase().trim()
    
    if (!queryLower) {
      // Show recent searches when no query
      recentSearches.forEach((search, index) => {
        results.push({
          id: `recent-${index}`,
          text: search,
          type: 'recent',
          category: 'Recent Searches'
        })
      })
      return results
    }

    const addedTexts = new Set<string>()
    
    // Repository name suggestions
    repositories.forEach(repo => {
      const repoName = repo.full_name.toLowerCase()
      const shortName = repo.full_name.split('/')[1].toLowerCase()
      
      if ((repoName.includes(queryLower) || shortName.includes(queryLower)) && !addedTexts.has(repo.full_name)) {
        results.push({
          id: `repo-${repo.id}`,
          text: repo.full_name,
          type: 'repository',
          repository: repo,
          category: 'Repositories'
        })
        addedTexts.add(repo.full_name)
      }
    })

    // Owner suggestions
    const owners = new Set<string>()
    repositories.forEach(repo => {
      const owner = repo.full_name.split('/')[0]
      const ownerLower = owner.toLowerCase()
      
      if (ownerLower.includes(queryLower) && !owners.has(owner) && !addedTexts.has(owner)) {
        owners.add(owner)
        results.push({
          id: `owner-${owner}`,
          text: owner,
          type: 'owner',
          category: 'Repository Owners'
        })
        addedTexts.add(owner)
      }
    })

    // Language suggestions
    const languages = new Set<string>()
    repositories.forEach(repo => {
      if (repo.language) {
        const langLower = repo.language.toLowerCase()
        if (langLower.includes(queryLower) && !languages.has(repo.language) && !addedTexts.has(repo.language)) {
          languages.add(repo.language)
          results.push({
            id: `lang-${repo.language}`,
            text: repo.language,
            type: 'language',
            category: 'Languages'
          })
          addedTexts.add(repo.language)
        }
      }
    })

    // Description keyword suggestions (limit to top matches)
    const descriptionMatches: { text: string, repository: Repository }[] = []
    repositories.forEach(repo => {
      if (repo.description) {
        const descLower = repo.description.toLowerCase()
        if (descLower.includes(queryLower)) {
          // Extract words around the match
          const words = repo.description.split(/\s+/)
          const matchingWords = words.filter(word => 
            word.toLowerCase().includes(queryLower) && 
            word.length > 2 && 
            !addedTexts.has(word)
          )
          
          matchingWords.slice(0, 2).forEach(word => {
            descriptionMatches.push({ text: word, repository: repo })
            addedTexts.add(word)
          })
        }
      }
    })

    descriptionMatches.slice(0, 3).forEach((match, index) => {
      results.push({
        id: `desc-${index}`,
        text: match.text,
        type: 'description',
        repository: match.repository,
        category: 'Keywords'
      })
    })

    // Limit total results
    return results.slice(0, 8)
  }, [query, repositories, recentSearches])

  return {
    suggestions,
    isOpen,
    setIsOpen,
    addRecentSearch,
    clearRecentSearches,
    recentSearches
  }
}