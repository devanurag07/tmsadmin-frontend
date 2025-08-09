import { AnalyticsData, DailyData, WeeklyData, MonthlyData } from '@/lib/api/analytics/analytics_api'

// Generate dummy daily data for the last 30 days
const generateDailyData = (): DailyData[] => {
    const data: DailyData[] = []
    const today = new Date()

    for (let i = 29; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)

        const requests = Math.floor(Math.random() * 500) + 100 // 100-600 requests
        const successRate = Math.random() * 0.2 + 0.85 // 85-95% success rate
        const success = Math.floor(requests * successRate)
        const failed = requests - success
        const avgResponse = Math.random() * 200 + 50 // 50-250ms response time

        data.push({
            date: date.toISOString().split('T')[0],
            requests,
            success,
            failed,
            avgResponse: Math.round(avgResponse)
        })
    }

    return data
}

// Generate dummy weekly data for the last 12 weeks
const generateWeeklyData = (): WeeklyData[] => {
    const data: WeeklyData[] = []

    for (let i = 11; i >= 0; i--) {
        const weekStart = new Date()
        weekStart.setDate(weekStart.getDate() - (i * 7))

        const requests = Math.floor(Math.random() * 2000) + 500 // 500-2500 requests
        const successRate = Math.random() * 0.15 + 0.88 // 88-95% success rate
        const success = Math.floor(requests * successRate)
        const failed = requests - success
        const avgResponse = Math.random() * 150 + 60 // 60-210ms response time

        data.push({
            week: `Week ${12 - i}`,
            requests,
            success,
            failed,
            avgResponse: Math.round(avgResponse)
        })
    }

    return data
}

// Generate dummy monthly data for the last 12 months
const generateMonthlyData = (): MonthlyData[] => {
    const data: MonthlyData[] = []
    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]

    for (let i = 11; i >= 0; i--) {
        const requests = Math.floor(Math.random() * 8000) + 2000 // 2000-10000 requests
        const successRate = Math.random() * 0.12 + 0.89 // 89-95% success rate
        const success = Math.floor(requests * successRate)
        const failed = requests - success
        const avgResponse = Math.random() * 120 + 70 // 70-190ms response time

        data.push({
            month: months[i],
            requests,
            success,
            failed,
            avgResponse: Math.round(avgResponse)
        })
    }

    return data
}

// Usage limits configuration
export const usageLimits = {
    monthly: 500,
    daily: 20,
    weekly: 100
}

export const dummyAnalyticsData: AnalyticsData = {
    daily: generateDailyData(),
    weekly: generateWeeklyData(),
    monthly: generateMonthlyData(),
    endpoints: [
        {
            endpoint: '/api/products',
            requests: 15420,
            success: 14850,
            failed: 570,
            avgResponse: 125
        },
        {
            endpoint: '/api/users',
            requests: 12340,
            success: 11980,
            failed: 360,
            avgResponse: 89
        },
        {
            endpoint: '/api/orders',
            requests: 9870,
            success: 9450,
            failed: 420,
            avgResponse: 156
        },
        {
            endpoint: '/api/analytics',
            requests: 5430,
            success: 5280,
            failed: 150,
            avgResponse: 78
        },
        {
            endpoint: '/api/auth',
            requests: 4320,
            success: 4180,
            failed: 140,
            avgResponse: 95
        }
    ]
} 