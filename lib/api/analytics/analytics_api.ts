import api from '../axios_api'

export interface AnalyticsData {
    daily: DailyData[]
    weekly: WeeklyData[]
    monthly: MonthlyData[]
    endpoints: EndpointData[]
}

export interface DailyData {
    date: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

export interface WeeklyData {
    week: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

export interface MonthlyData {
    month: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

export interface EndpointData {
    endpoint: string
    requests: number
    success: number
    failed: number
    avgResponse: number
}

export const getAnalyticsData = async (): Promise<AnalyticsData> => {
    try {
        const response = await api.get('/analytics')
        return response.data
    } catch (error) {
        console.error('Error fetching analytics data:', error)
        throw error
    }
}

export const getAnalyticsByTimeRange = async (timeRange: 'daily' | 'weekly' | 'monthly'): Promise<any[]> => {
    try {
        const response = await api.get(`/analytics/${timeRange}`)
        return response.data
    } catch (error) {
        console.error(`Error fetching ${timeRange} analytics:`, error)
        throw error
    }
}

export const getEndpointAnalytics = async (): Promise<EndpointData[]> => {
    try {
        const response = await api.get('/analytics/endpoints')
        return response.data
    } catch (error) {
        console.error('Error fetching endpoint analytics:', error)
        throw error
    }
}

export const getRealTimeMetrics = async () => {
    try {
        const response = await api.get('/analytics/realtime')
        return response.data
    } catch (error) {
        console.error('Error fetching real-time metrics:', error)
        throw error
    }
} 