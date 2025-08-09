"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Camera, Clock, Image as ImageIcon, RefreshCw, Star, CheckCircle2, Hourglass } from "lucide-react"
import { getSalonSessions, SalonSession } from "@/lib/api/salon/sessions_api"

const formatSeconds = (secondsString: string | null): string => {
    if (!secondsString) return "-"
    const seconds = Math.max(0, Math.floor(parseFloat(secondsString)))
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
}

const DataPage = () => {
    const [sessions, setSessions] = useState<SalonSession[]>([])
    const [loading, setLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const fetchSessions = async () => {
        try {
            setLoading(true)
            setError(null)
            const res = await getSalonSessions()
            if (res.success && res.data) {
                setSessions(res.data)
            } else {
                setError(res.message || "Failed to fetch sessions")
            }
        } catch (e) {
            setError("Failed to fetch sessions")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSessions()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const metrics = useMemo(() => {
        const total = sessions.length
        const completed = sessions.filter(s => s.status === "C").length
        const active = sessions.filter(s => s.status === "A").length

        const times = sessions
            .map(s => (s.session_time ? parseFloat(s.session_time) : NaN))
            .filter(n => !Number.isNaN(n)) as number[]
        const avgSessionTime = times.length ? (times.reduce((a, b) => a + b, 0) / times.length) : 0

        const allRatings: number[] = []
        sessions.forEach(s => s.results.forEach(r => r.ratings.forEach(rt => allRatings.push(rt.rating))))
        const avgRating = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length) : 0

        return { total, completed, active, avgSessionTime, avgRating }
    }, [sessions])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[300px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading sessions…</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Salon Sessions</h1>
                    <p className="text-muted-foreground">Recent TryMyStyle sessions and results</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSessions}>
                    <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
            </div>

            {error && (
                <Card>
                    <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                        <Camera className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.total}</div>
                        <p className="text-xs text-muted-foreground">All sessions</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.completed}</div>
                        <p className="text-xs text-muted-foreground">Status C</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active</CardTitle>
                        <Hourglass className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{metrics.active}</div>
                        <p className="text-xs text-muted-foreground">Status A</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Session Time</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatSeconds(String(metrics.avgSessionTime))}</div>
                        <p className="text-xs text-muted-foreground">Average of recorded sessions</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Recent Sessions</CardTitle>
                    <CardDescription>Latest entries with generated results</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {sessions
                            .slice()
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            .map(session => (
                                <div key={session.id} className="border rounded-lg p-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-semibold">Session #{session.id}</h3>
                                                <Badge variant="outline">{session.status === "C" ? "Completed" : "Active"}</Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Started {new Date(session.created_at).toLocaleString()} {session.closed_at ? `• Closed ${new Date(session.closed_at).toLocaleString()}` : ""}
                                            </p>
                                            <p className="text-xs text-muted-foreground">Duration: {formatSeconds(session.session_time)}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm">Results: {session.results.length}</div>
                                        </div>
                                    </div>

                                    {session.results.length > 0 && (
                                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                                            {session.results.map(result => (
                                                <div key={result.id} className="rounded-md border p-3 flex gap-3">
                                                    <div className="w-24 h-24 bg-muted rounded-md overflow-hidden flex items-center justify-center">
                                                        {result.output_url ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img src={result.output_url} alt="Result" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-2 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <div className="text-xs text-muted-foreground truncate">{result.request_id}</div>
                                                            <div className="flex items-center gap-1 text-xs">
                                                                <Star className="h-3.5 w-3.5 text-yellow-500" />
                                                                {(() => {
                                                                    const ratings = result.ratings.map(r => r.rating)
                                                                    const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : "-"
                                                                    return <span>{avg}</span>
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div className="text-sm line-clamp-2">{result.prompt}</div>
                                                        <div className="text-xs text-muted-foreground">{new Date(result.created_at).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default DataPage