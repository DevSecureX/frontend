/**
 * Test script to verify Custom Rules API integration
 * This file can be used to test the integration between frontend and backend
 */

import { rulesAPI } from './rules'
import type { CustomRule, RuleRequest, RuleStats } from '@/types/rules'

// Test configuration
const TEST_CONFIG = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: 'info' as const
}

interface TestResult {
  test: string
  success: boolean
  data?: any
  error?: string
  duration: number
}

class RulesAPITester {
  private results: TestResult[] = []

  private log(message: string, level: 'info' | 'warn' | 'error' = 'info') {
    if (!TEST_CONFIG.enabled) return
    
    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}] Rules API Test:`
    
    switch (level) {
      case 'error':
        console.error(`${prefix} ${message}`)
        break
      case 'warn':
        console.warn(`${prefix} ${message}`)
        break
      default:
        console.log(`${prefix} ${message}`)
    }
  }

  private async runTest(testName: string, testFn: () => Promise<any>): Promise<TestResult> {
    const startTime = Date.now()
    
    try {
      this.log(`Starting test: ${testName}`)
      const data = await testFn()
      const duration = Date.now() - startTime
      
      this.log(`✅ Test passed: ${testName} (${duration}ms)`)
      
      const result: TestResult = {
        test: testName,
        success: true,
        data,
        duration
      }
      
      this.results.push(result)
      return result
    } catch (error) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      this.log(`❌ Test failed: ${testName} - ${errorMessage} (${duration}ms)`, 'error')
      
      const result: TestResult = {
        test: testName,
        success: false,
        error: errorMessage,
        duration
      }
      
      this.results.push(result)
      return result
    }
  }

  async testSupportedTools(): Promise<TestResult> {
    return this.runTest('Get Supported Tools', async () => {
      const tools = await rulesAPI.getSupportedTools()
      
      if (!Array.isArray(tools)) {
        throw new Error('Supported tools should return an array')
      }
      
      if (tools.length === 0) {
        this.log('Warning: No supported tools returned', 'warn')
      }
      
      this.log(`Found ${tools.length} supported tools`)
      return tools
    })
  }

  async testGetCommunityRules(): Promise<TestResult> {
    return this.runTest('Get Community Rules', async () => {
      const result = await rulesAPI.getCommunityRules(1, 10)
      
      if (!result || typeof result !== 'object') {
        throw new Error('Community rules should return an object')
      }
      
      if (!Array.isArray(result.rules)) {
        throw new Error('Community rules should have a rules array')
      }
      
      this.log(`Found ${result.rules.length}/${result.total} community rules`)
      return result
    })
  }

  async testGetTrendingRules(): Promise<TestResult> {
    return this.runTest('Get Trending Rules', async () => {
      const rules = await rulesAPI.getTrendingRules(5)
      
      if (!Array.isArray(rules)) {
        throw new Error('Trending rules should return an array')
      }
      
      this.log(`Found ${rules.length} trending rules`)
      
      // Verify rule structure
      if (rules.length > 0) {
        const firstRule = rules[0]
        const requiredFields = ['id', 'rule_name', 'tool', 'pattern', 'severity']
        
        for (const field of requiredFields) {
          if (!(field in firstRule)) {
            throw new Error(`Missing required field: ${field}`)
          }
        }
        
        // Check vote counts
        if (typeof firstRule.net_votes !== 'number') {
          throw new Error('net_votes should be a number')
        }
        
        this.log(`Validated rule structure for trending rules`)
      }
      
      return rules
    })
  }

  async testGetPopularRules(): Promise<TestResult> {
    return this.runTest('Get Popular Rules', async () => {
      const rules = await rulesAPI.getPopularRules(5)
      
      if (!Array.isArray(rules)) {
        throw new Error('Popular rules should return an array')
      }
      
      this.log(`Found ${rules.length} popular rules`)
      return rules
    })
  }

  async testGetNewestRules(): Promise<TestResult> {
    return this.runTest('Get Newest Rules', async () => {
      const rules = await rulesAPI.getNewestRules(5)
      
      if (!Array.isArray(rules)) {
        throw new Error('Newest rules should return an array')
      }
      
      this.log(`Found ${rules.length} newest rules`)
      return rules
    })
  }

  async testGetRuleStats(): Promise<TestResult> {
    return this.runTest('Get Rule Stats', async () => {
      const stats = await rulesAPI.getRuleStats()
      
      if (!stats || typeof stats !== 'object') {
        throw new Error('Rule stats should return an object')
      }
      
      const expectedFields: (keyof RuleStats)[] = ['total_rules', 'my_rules', 'public_rules', 'private_rules']
      for (const field of expectedFields) {
        if (typeof stats[field] !== 'number') {
          this.log(`Warning: Expected numeric field ${field} in stats`, 'warn')
        }
      }
      
      this.log('Rule stats retrieved successfully')
      return stats
    })
  }

  async testGetCommunityMetrics(): Promise<TestResult> {
    return this.runTest('Get Community Metrics', async () => {
      const metrics = await rulesAPI.getCommunityMetrics()
      
      if (!metrics || typeof metrics !== 'object') {
        throw new Error('Community metrics should return an object')
      }
      
      this.log('Community metrics retrieved successfully')
      return metrics
    })
  }

  async testValidateRule(): Promise<TestResult> {
    return this.runTest('Validate Rule Pattern', async () => {
      const result = await rulesAPI.validateRule({
        pattern: 'pattern: $X.execute($SQL)',
        tool: 'semgrep',
        language: 'python'
      })
      
      if (!result || typeof result !== 'object') {
        throw new Error('Validation should return an object')
      }
      
      if (typeof result.is_valid !== 'boolean') {
        throw new Error('Validation result should have is_valid boolean')
      }
      
      this.log(`Rule validation result: ${result.is_valid ? 'valid' : 'invalid'}`)
      return result
    })
  }

  async runAllTests(): Promise<TestResult[]> {
    if (!TEST_CONFIG.enabled) {
      this.log('Tests disabled in production mode', 'warn')
      return []
    }
    
    this.log('🚀 Starting Custom Rules API Integration Tests')
    this.results = []
    
    const tests = [
      () => this.testSupportedTools(),
      () => this.testGetCommunityRules(),
      () => this.testGetTrendingRules(),
      () => this.testGetPopularRules(),
      () => this.testGetNewestRules(),
      () => this.testGetRuleStats(),
      () => this.testGetCommunityMetrics(),
      () => this.testValidateRule(),
    ]
    
    // Run tests sequentially to avoid overwhelming the backend
    for (const test of tests) {
      await test()
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    const totalTests = this.results.length
    const passedTests = this.results.filter(r => r.success).length
    const failedTests = totalTests - passedTests
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0)
    
    this.log(`📊 Test Summary: ${passedTests}/${totalTests} passed, ${failedTests} failed (${totalTime}ms total)`)
    
    if (failedTests > 0) {
      this.log('❌ Some tests failed. Check the logs above for details.', 'error')
      this.results.filter(r => !r.success).forEach(result => {
        this.log(`  - ${result.test}: ${result.error}`, 'error')
      })
    } else {
      this.log('✅ All tests passed! Frontend-Backend integration is working correctly.')
    }
    
    return this.results
  }

  getResults(): TestResult[] {
    return this.results
  }
}

// Export tester instance
export const rulesAPITester = new RulesAPITester()

// Export test function for easy use
export const testCustomRulesIntegration = () => rulesAPITester.runAllTests()

// Export individual test methods
export const testMethods = {
  supportedTools: () => rulesAPITester.testSupportedTools(),
  communityRules: () => rulesAPITester.testGetCommunityRules(),
  trendingRules: () => rulesAPITester.testGetTrendingRules(),
  popularRules: () => rulesAPITester.testGetPopularRules(),
  newestRules: () => rulesAPITester.testGetNewestRules(),
  ruleStats: () => rulesAPITester.testGetRuleStats(),
  communityMetrics: () => rulesAPITester.testGetCommunityMetrics(),
  validateRule: () => rulesAPITester.testValidateRule(),
}

// Auto-run tests in development console
if (TEST_CONFIG.enabled && typeof window !== 'undefined') {
  // Add to window object for manual testing
  (window as any).testCustomRules = {
    runAll: testCustomRulesIntegration,
    ...testMethods,
    tester: rulesAPITester
  }
  
  console.log('🧪 Custom Rules API tests available on window.testCustomRules')
  console.log('Run window.testCustomRules.runAll() to test all endpoints')
}