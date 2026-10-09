import type { QuickTopic } from '../data/quickTopics'
import { ALL_QUICK_TOPICS, CATEGORY_WEIGHTS, TOPIC_CATEGORIES } from '../data/quickTopics'

/**
 * Randomly selects 6 Quick Topics with weighted category distribution
 * Ensures variety by limiting topics from same category
 */
export function getRandomQuickTopics(count: number = 6): QuickTopic[] {
  // Group topics by category
  const topicsByCategory = ALL_QUICK_TOPICS.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = []
    }
    acc[topic.category].push(topic)
    return acc
  }, {} as Record<string, QuickTopic[]>)

  // Create weighted category pool based on weights
  const weightedCategories: string[] = []
  Object.entries(CATEGORY_WEIGHTS).forEach(([category, weight]) => {
    // Add category multiple times based on weight
    for (let i = 0; i < weight; i++) {
      weightedCategories.push(category)
    }
  })

  const selectedTopics: QuickTopic[] = []
  const usedTopicIds = new Set<string>()
  const categoryCount = new Map<string, number>()

  // Maximum topics per category to ensure variety
  const maxPerCategory = Math.ceil(count / 3) // Allow max 2-3 topics from same category

  let attempts = 0
  const maxAttempts = count * 10 // Prevent infinite loop

  while (selectedTopics.length < count && attempts < maxAttempts) {
    attempts++

    // Select random weighted category
    const randomCategory = weightedCategories[Math.floor(Math.random() * weightedCategories.length)]
    
    // Check if we've exceeded max topics for this category
    const currentCategoryCount = categoryCount.get(randomCategory) ?? 0
    if (currentCategoryCount >= maxPerCategory) {
      continue
    }

    // Get available topics from this category
    const categoryTopics = topicsByCategory[randomCategory] || []
    if (categoryTopics.length === 0) {
      continue
    }

    // Select random topic from category
    const randomTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)]
    
    // Skip if already used
    if (usedTopicIds.has(randomTopic.id)) {
      continue
    }

    // Add topic to selection
    selectedTopics.push(randomTopic)
    usedTopicIds.add(randomTopic.id)
    categoryCount.set(randomCategory, currentCategoryCount + 1)
  }

  // If we couldn't get enough topics with variety constraints, fill remaining slots
  if (selectedTopics.length < count) {
    const remainingTopics = ALL_QUICK_TOPICS.filter(topic => !usedTopicIds.has(topic.id))
    while (selectedTopics.length < count && remainingTopics.length > 0) {
      const randomIndex = Math.floor(Math.random() * remainingTopics.length)
      const topic = remainingTopics.splice(randomIndex, 1)[0]
      selectedTopics.push(topic)
    }
  }

  return selectedTopics
}

/**
 * Get topics from a specific category
 */
export function getTopicsByCategory(category: string): QuickTopic[] {
  return ALL_QUICK_TOPICS.filter(topic => topic.category === category)
}

/**
 * Get category distribution for debugging
 */
export function getCategoryDistribution(topics: QuickTopic[]): Record<string, number> {
  return topics.reduce((acc, topic) => {
    acc[topic.category] = (acc[topic.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Get readable category name
 */
export function getCategoryName(category: string): string {
  const categoryNames = {
    [TOPIC_CATEGORIES.CODE_SECURITY]: 'Code Security',
    [TOPIC_CATEGORIES.WEB_SECURITY]: 'Web Security',
    [TOPIC_CATEGORIES.API_SECURITY]: 'API Security',
    [TOPIC_CATEGORIES.INFRASTRUCTURE]: 'Infrastructure',
    [TOPIC_CATEGORIES.AUTH_SECURITY]: 'Authentication',
    [TOPIC_CATEGORIES.COMPLIANCE]: 'Compliance',
    [TOPIC_CATEGORIES.SECURITY_TOOLS]: 'Security Tools',
    [TOPIC_CATEGORIES.INCIDENT_RESPONSE]: 'Incident Response',
    [TOPIC_CATEGORIES.CRYPTOGRAPHY]: 'Cryptography',
    [TOPIC_CATEGORIES.MOBILE_SECURITY]: 'Mobile Security',
    [TOPIC_CATEGORIES.CLOUD_SECURITY]: 'Cloud Security',
    [TOPIC_CATEGORIES.DATABASE_SECURITY]: 'Database Security'
  }
  return categoryNames[category as keyof typeof categoryNames] || category
}

/**
 * Get welcome-specific topics that are different from sidebar Quick Topics
 * Returns 4 diverse topics for the welcome message
 */
export function getWelcomeTopics(excludeTopics: QuickTopic[] = []): QuickTopic[] {
  const excludeIds = new Set(excludeTopics.map(topic => topic.id))
  
  // Get one topic from each major category for variety
  const welcomeCategories = [
    TOPIC_CATEGORIES.WEB_SECURITY,
    TOPIC_CATEGORIES.COMPLIANCE, 
    TOPIC_CATEGORIES.CODE_SECURITY,
    TOPIC_CATEGORIES.AUTH_SECURITY
  ]
  
  const welcomeTopics: QuickTopic[] = []
  
  for (const category of welcomeCategories) {
    const categoryTopics = ALL_QUICK_TOPICS.filter(
      topic => topic.category === category && !excludeIds.has(topic.id)
    )
    
    if (categoryTopics.length > 0) {
      const randomTopic = categoryTopics[Math.floor(Math.random() * categoryTopics.length)]
      welcomeTopics.push(randomTopic)
      excludeIds.add(randomTopic.id)
    }
  }
  
  // If we need more topics, fill from other categories
  while (welcomeTopics.length < 4) {
    const availableTopics = ALL_QUICK_TOPICS.filter(
      topic => !excludeIds.has(topic.id)
    )
    
    if (availableTopics.length === 0) break
    
    const randomTopic = availableTopics[Math.floor(Math.random() * availableTopics.length)]
    welcomeTopics.push(randomTopic)
    excludeIds.add(randomTopic.id)
  }
  
  return welcomeTopics.slice(0, 4)
}