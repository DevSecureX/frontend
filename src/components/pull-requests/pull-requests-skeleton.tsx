import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  GitPullRequest, 
  Shield, 
  Eye, 
  Clock,
  Users
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function PRStatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">Total PRs</CardTitle>
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <GitPullRequest className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-3 w-24 mt-1" />
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">Open PRs</CardTitle>
          <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
            <Eye className="h-5 w-5 text-green-600 dark:text-green-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-3 w-20 mt-1" />
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Draft PRs</CardTitle>
          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-3 w-24 mt-1" />
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-700 dark:text-purple-300">Active Scans</CardTitle>
          <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <Shield className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-9 w-12" />
          <Skeleton className="h-3 w-20 mt-1" />
        </CardContent>
      </Card>
    </div>
  )
}

export function PRTableSkeleton() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Skeleton className="h-4 w-4" />
          </TableHead>
          <TableHead>Pull Request</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Security</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {[...Array(6)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Skeleton className="h-4 w-4" />
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-16" />
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded-full" />
                <Skeleton className="h-4 w-20" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-5 w-16 rounded-full" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-3 w-12" />
              </div>
            </TableCell>
            <TableCell>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center gap-2 justify-end">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function PRSecurityTrendsSkeleton() {
  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          Repository Security
        </CardTitle>
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Alert Skeleton */}
          <div className="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-3 w-48 mt-1" />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="text-center p-3 bg-muted/30 rounded-lg">
              <Skeleton className="h-6 w-8 mx-auto mb-1" />
              <Skeleton className="h-3 w-12 mx-auto" />
            </div>
          </div>
          
          {/* Issues List */}
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-12 rounded-full" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function PRPageSkeleton() {
  return (
    <div className="container mx-auto p-4 lg:p-6 space-y-4 lg:space-y-6">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 rounded-lg">
              <GitPullRequest className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold tracking-tight">Pull Request Security</h1>
              <p className="text-sm lg:text-base text-muted-foreground">
                Secure your code changes with automated PR security scanning
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2 lg:gap-3">
          <Skeleton className="h-9 w-20" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>

      {/* Repository Selection */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
              <GitPullRequest className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Repository Selection
          </CardTitle>
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-28" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <PRStatsCardsSkeleton />

      {/* Security Trends */}
      <PRSecurityTrendsSkeleton />

      {/* Search */}
      <div className="space-y-3 lg:space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
          <Skeleton className="h-10 flex-1" />
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-4 lg:space-y-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        
        {/* PR Table */}
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardContent className="p-0">
            <PRTableSkeleton />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function PRListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
      <PRTableSkeleton />
    </div>
  )
}