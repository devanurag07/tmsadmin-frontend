# Analytics Dashboard

A comprehensive analytics dashboard for monitoring API request usage and performance metrics with beautiful charts and tables.

## Features

### 📊 **Real-time Analytics**
- **Daily, Weekly, Monthly Views**: Switch between different time ranges to analyze API usage patterns
- **Live Data Integration**: Connects to backend API endpoints for real-time analytics
- **Fallback to Mock Data**: Gracefully handles API failures by falling back to mock data

### 📈 **Interactive Charts**
- **Request Trends Line Chart**: Visualize API request volume over time
- **Success vs Failed Pie Chart**: Distribution of successful vs failed requests
- **Response Time Area Chart**: Monitor average response time trends
- **Responsive Design**: Charts adapt to different screen sizes

### 📋 **Detailed Tables**
- **Endpoint Performance Table**: Breakdown of API performance by endpoint
- **Detailed Data Table**: Complete analytics data with trend indicators
- **Status Indicators**: Visual badges showing endpoint health (Good/Slow)

### 🎯 **Key Metrics Dashboard**
- **Total Requests**: Overall API request count
- **Success Rate**: Percentage of successful requests
- **Failed Requests**: Count of failed requests
- **Average Response Time**: Mean response time in milliseconds

## API Integration

### Backend Endpoints Required

The dashboard expects the following API endpoints:

```typescript
// Get all analytics data
GET /api/salon/analytics

// Get analytics by time range
GET /api/salon/analytics/daily
GET /api/salon/analytics/weekly  
GET /api/salon/analytics/monthly

// Get endpoint-specific analytics
GET /api/salon/analytics/endpoints

// Get real-time metrics
GET /api/salon/analytics/realtime
```

### Data Structure

```typescript
interface AnalyticsData {
  daily: DailyData[]
  weekly: WeeklyData[]
  monthly: MonthlyData[]
  endpoints: EndpointData[]
}

interface DailyData {
  date: string
  requests: number
  success: number
  failed: number
  avgResponse: number
}

interface EndpointData {
  endpoint: string
  requests: number
  success: number
  failed: number
  avgResponse: number
}
```

## Components Used

### UI Components
- **Card**: Container for analytics sections
- **Table**: Data display with sorting and filtering
- **Badge**: Status indicators for endpoint health
- **Select**: Time range selector
- **Button**: Refresh functionality
- **Chart**: Interactive charts using Recharts

### Icons
- **TrendingUp/TrendingDown**: Trend indicators
- **Database**: Total requests icon
- **Clock**: Response time icon
- **Loader2**: Loading spinner

## Features

### 🎨 **Modern UI/UX**
- Clean, modern design with consistent spacing
- Responsive layout that works on all devices
- Loading states and error handling
- Interactive elements with hover effects

### 🔄 **Real-time Updates**
- Refresh button to fetch latest data
- Automatic loading states
- Error handling with fallback to mock data
- Optimistic UI updates

### 📱 **Mobile Responsive**
- Grid layouts that adapt to screen size
- Touch-friendly interactive elements
- Readable charts on mobile devices

### 🎯 **Performance Optimized**
- Efficient data processing
- Memoized calculations
- Lazy loading of chart components

## Usage

1. **Navigate to Analytics**: Visit `/analytics` in your application
2. **Select Time Range**: Choose between Daily, Weekly, or Monthly views
3. **View Charts**: Interactive charts show trends and distributions
4. **Check Tables**: Detailed breakdowns of endpoint performance
5. **Refresh Data**: Click the refresh button to get latest data

## Error Handling

- **API Failures**: Gracefully falls back to mock data
- **Loading States**: Shows spinner during data fetching
- **Error Messages**: Clear error notifications
- **Retry Mechanism**: Refresh button to retry failed requests

## Customization

### Adding New Metrics
1. Update the API interface in `lib/api/analytics/analytics_api.ts`
2. Add new chart components as needed
3. Update the mock data structure
4. Add new UI components for display

### Styling
- Uses Tailwind CSS for consistent styling
- Chart colors are configurable via CSS variables
- Responsive design with mobile-first approach

### Data Sources
- Currently integrates with REST API endpoints
- Can be extended to support WebSocket for real-time updates
- Mock data available for development and testing

## Development

### Prerequisites
- Next.js 14+
- TypeScript
- Tailwind CSS
- Recharts for charts
- Lucide React for icons

### Setup
1. Ensure all UI components are available
2. Configure API endpoints in `lib/api/axios_api.ts`
3. Update analytics API service as needed
4. Test with mock data before connecting to real API

### Testing
- Test with mock data first
- Verify API integration
- Test responsive design on different screen sizes
- Validate error handling scenarios

## Future Enhancements

- **Real-time WebSocket Updates**: Live data streaming
- **Export Functionality**: PDF/CSV export of analytics
- **Advanced Filtering**: Date range picker, endpoint filters
- **Custom Dashboards**: User-configurable layouts
- **Alert System**: Performance threshold notifications
- **Historical Data**: Long-term trend analysis 