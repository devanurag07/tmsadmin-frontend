"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
    ChartContainer
} from '@/components/ui/chart'
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts'
import {
    TrendingUp,
    TrendingDown,
    Database,
    Clock,
    Loader2
} from 'lucide-react'
import { getAnalyticsData } from '@/lib/api/analytics/analytics_api'

// Type definitions
type DailyData = {
    date: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

type WeeklyData = {
    week: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

type MonthlyData = {
    month: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

type EndpointData = {
    endpoint: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

// Mock data for analytics
const mockData: {
    daily: DailyData[]
    weekly: WeeklyData[]
    monthly: MonthlyData[]
    endpoints: EndpointData[]
} = {
    daily: [
        { date: '2024-01-01', requests: 1250, success: 1180, failed: 70, avgResponse: 245 },
        { date: '2024-01-02', requests: 1380, success: 1310, failed: 70, avgResponse: 238 },
        { date: '2024-01-03', requests: 1420, success: 1350, failed: 70, avgResponse: 252 },
        { date: '2024-01-04', requests: 1560, success: 1480, failed: 80, avgResponse: 268 },
        { date: '2024-01-05', requests: 1680, success: 1590, failed: 90, avgResponse: 275 },
        { date: '2024-01-06', requests: 1450, success: 1380, failed: 70, avgResponse: 248 },
        { date: '2024-01-07', requests: 1320, success: 1250, failed: 70, avgResponse: 235 },
    ],
    weekly: [
        { week: 'Week 1', requests: 8750, success: 8300, failed: 450, avgResponse: 245 },
        { week: 'Week 2', requests: 9200, success: 8750, failed: 450, avgResponse: 238 },
        { week: 'Week 3', requests: 9800, success: 9300, failed: 500, avgResponse: 252 },
        { week: 'Week 4', requests: 10500, success: 9950, failed: 550, avgResponse: 268 },
    ],
    monthly: [
        { month: 'Jan 2024', requests: 38500, success: 36500, failed: 2000, avgResponse: 245 },
        { month: 'Feb 2024', requests: 42000, success: 39800, failed: 2200, avgResponse: 238 },
        { month: 'Mar 2024', requests: 45000, success: 42700, failed: 2300, avgResponse: 252 },
        { month: 'Apr 2024', requests: 48000, success: 45600, failed: 2400, avgResponse: 268 },
    ],
    endpoints: [
        { endpoint: '/api/products', requests: 12500, success: 11800, failed: 700, avgResponse: 245 },
        { endpoint: '/api/categories', requests: 8900, success: 8450, failed: 450, avgResponse: 180 },
        { endpoint: '/api/auth/login', requests: 6700, success: 6365, failed: 335, avgResponse: 320 },
        { endpoint: '/api/upload', requests: 3400, success: 3230, failed: 170, avgResponse: 450 },
        { endpoint: '/api/analytics', requests: 2100, success: 1995, failed: 105, avgResponse: 150 },
    ]
}

const chartConfig = {
    requests: {
        label: "Requests",
        color: "hsl(var(--chart-1))",
    },
    success: {
        label: "Success",
        color: "hsl(var(--chart-2))",
    },
    failed: {
        label: "Failed",
        color: "hsl(var(--chart-3))",
    },
    avgResponse: {
        label: "Avg Response (ms)",
        color: "hsl(var(--chart-4))",
    },
}

const pieChartConfig = {
    success: {
        label: "Success",
        color: "hsl(var(--chart-2))",
    },
    failed: {
        label: "Failed",
        color: "hsl(var(--chart-3))",
    },
}

const AnalyticsPage = () => {
    const [timeRange, setTimeRange] = useState('daily')
    const [analyticsData, setAnalyticsData] = useState(mockData)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat().format(num)
    }

    const getTotalStats = (data: any[]) => {
        return data.reduce((acc, item) => ({
            requests: acc.requests + item.requests,
            success: acc.success + item.success,
            failed: acc.failed + item.failed,
            avgResponse: Math.round((acc.avgResponse + item.avgResponse) / 2)
        }), { requests: 0, success: 0, failed: 0, avgResponse: 0 })
    }

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true)
            setError(null)
            const data = await getAnalyticsData()
            setAnalyticsData(data)
        } catch (err) {
            console.error('Failed to fetch analytics data:', err)
            setError('Failed to load analytics data. Using mock data.')
            // Keep using mock data on error
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAnalyticsData()
    }, [])

    const currentData = analyticsData[timeRange as keyof typeof analyticsData] as (DailyData | WeeklyData | MonthlyData)[]
    const totalStats = getTotalStats(currentData)

    const getDataKey = () => {
        switch (timeRange) {
            case 'daily': return 'date'
            case 'weekly': return 'week'
            case 'monthly': return 'month'
            default: return 'date'
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex items-center space-x-2">
                    <Loader2 className="h-6 w-6 animate-spin" />
                    <span>Loading analytics data...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
                    <p className="text-muted-foreground">
                        Monitor API request usage and performance metrics
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchAnalyticsData}
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-800">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totalStats.requests)}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+12.5%</span> from last period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {((totalStats.success / totalStats.requests) * 100).toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">+2.1%</span> from last period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Failed Requests</CardTitle>
                        <TrendingDown className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatNumber(totalStats.failed)}</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-red-600">+5.2%</span> from last period
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalStats.avgResponse}ms</div>
                        <p className="text-xs text-muted-foreground">
                            <span className="text-green-600">-8.3%</span> from last period
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Request Trends</CardTitle>
                        <CardDescription>
                            API request volume over time
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer config={chartConfig}>
                            <LineChart data={currentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey={getDataKey()}
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="requests"
                                    stroke="hsl(var(--chart-1))"
                                    strokeWidth={2}
                                    dot={false}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="success"
                                    stroke="hsl(var(--chart-2))"
                                    strokeWidth={2}
                                    dot={false}
                                />
                            </LineChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </div>
            {/* Detailed Data Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Detailed {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Data</CardTitle>
                    <CardDescription>
                        Complete breakdown of API requests by {timeRange} period
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{timeRange === 'daily' ? 'Date' : timeRange === 'weekly' ? 'Week' : 'Month'}</TableHead>
                                <TableHead>Total Requests</TableHead>
                                <TableHead>Successful</TableHead>
                                <TableHead>Failed</TableHead>
                                <TableHead>Success Rate</TableHead>
                                <TableHead>Avg Response (ms)</TableHead>
                                <TableHead>Trend</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {currentData.map((item, index) => (
                                <TableRow key={index}>
                                    <TableCell className="font-medium">
                                        {timeRange === 'daily' ? (item as DailyData).date :
                                            timeRange === 'weekly' ? (item as WeeklyData).week :
                                                (item as MonthlyData).month}
                                    </TableCell>
                                    <TableCell>{formatNumber(item.requests)}</TableCell>
                                    <TableCell>{formatNumber(item.success)}</TableCell>
                                    <TableCell>{formatNumber(item.failed)}</TableCell>
                                    <TableCell>
                                        {((item.success / item.requests) * 100).toFixed(1)}%
                                    </TableCell>
                                    <TableCell>{item.avgResponse}ms</TableCell>
                                    <TableCell>
                                        <div className="flex items-center">
                                            {index > 0 && item.requests > currentData[index - 1].requests ? (
                                                <TrendingUp className="h-4 w-4 text-green-600" />
                                            ) : (
                                                <TrendingDown className="h-4 w-4 text-red-600" />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div >
    )
}

export default AnalyticsPage