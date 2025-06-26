"use client"
import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Users, Calendar, DollarSign, Scissors } from 'lucide-react'

const stats = [
    {
        title: "Total Products",
        value: "124",
        change: "+12%",
        changeType: "positive",
        icon: Package,
        description: "Products in catalog"
    },
    {
        title: "Active Customers",
        value: "1,234",
        change: "+8%",
        changeType: "positive",
        icon: Users,
        description: "Registered customers"
    },
    {
        title: "Appointments Today",
        value: "23",
        change: "+5%",
        changeType: "positive",
        icon: Calendar,
        description: "Scheduled appointments"
    },
    {
        title: "Revenue This Month",
        value: "$12,450",
        change: "+15%",
        changeType: "positive",
        icon: DollarSign,
        description: "Monthly revenue"
    }
]

const recentActivities = [
    { id: 1, action: "New product added", item: "Hair Serum Pro", time: "2 minutes ago" },
    { id: 2, action: "Appointment booked", item: "Sarah Johnson", time: "15 minutes ago" },
    { id: 3, action: "Product updated", item: "Shampoo Collection", time: "1 hour ago" },
    { id: 4, action: "New customer registered", item: "Mike Wilson", time: "2 hours ago" },
    { id: 5, action: "Service completed", item: "Haircut & Styling", time: "3 hours ago" }
]

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
                <h1 className="text-2xl font-bold mb-2">Welcome back to TryMyStyle!</h1>
                <p className="text-purple-100">Manage your salon operations, products, and customer relationships all in one place.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat) => (
                    <Card key={stat.title} className="shadow-lg border-0">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-slate-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
                            <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
                            <div className="flex items-center mt-2">
                                <span className={`text-xs font-medium ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                    {stat.change}
                                </span>
                                <span className="text-xs text-slate-500 ml-1">from last month</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Quick Actions</CardTitle>
                        <CardDescription>Common tasks to manage your salon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                <Package className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-slate-700">Add New Product</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                <Calendar className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-slate-700">Schedule Appointment</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                <Users className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-slate-700">Add Customer</span>
                            </button>
                            <button className="w-full flex items-center space-x-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                                <Scissors className="h-5 w-5 text-purple-600" />
                                <span className="text-sm font-medium text-slate-700">Manage Services</span>
                            </button>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="shadow-lg border-0">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-slate-800">Recent Activity</CardTitle>
                        <CardDescription>Latest updates from your salon</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentActivities.map((activity) => (
                                <div key={activity.id} className="flex items-start space-x-3">
                                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-slate-800">
                                            {activity.action}: <span className="text-purple-600">{activity.item}</span>
                                        </p>
                                        <p className="text-xs text-slate-500">{activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Performance Overview */}
            <Card className="shadow-lg border-0">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold text-slate-800">Performance Overview</CardTitle>
                    <CardDescription>Key metrics for your salon business</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">98%</div>
                            <div className="text-sm text-slate-600 mt-1">Customer Satisfaction</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">156</div>
                            <div className="text-sm text-slate-600 mt-1">Appointments This Week</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600">$2,340</div>
                            <div className="text-sm text-slate-600 mt-1">Average Daily Revenue</div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
} 