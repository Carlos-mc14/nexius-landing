"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, LineChart } from "@/components/charts"

export default function AnalyticsDashboard({ analyticsPromise }: { analyticsPromise: Promise<any> }) {
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await analyticsPromise
        setAnalytics(data)
      } catch (error) {
        console.error("Error loading analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [analyticsPromise])

  if (isLoading) {
    return <div className="py-10 text-center">Cargando datos de analítica...</div>
  }

  if (!analytics) {
    return (
      <div className="py-10 text-center">
        <p className="text-muted-foreground">No se pudieron cargar los datos de analítica</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Visitantes</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.visitors.total.toLocaleString()}</div>
            <p className={`text-xs ${analytics.visitors.change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {analytics.visitors.change >= 0 ? "↑" : "↓"} {Math.abs(analytics.visitors.change)}% vs. mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Páginas Vistas</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.pageviews.total.toLocaleString()}</div>
            <p className={`text-xs ${analytics.pageviews.change >= 0 ? "text-green-500" : "text-red-500"}`}>
              {analytics.pageviews.change >= 0 ? "↑" : "↓"} {Math.abs(analytics.pageviews.change)}% vs. mes anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Tasa de Rebote</CardTitle>
            <CardDescription>Últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.bounceRate.rate}%</div>
            <p className={`text-xs ${analytics.bounceRate.change <= 0 ? "text-green-500" : "text-red-500"}`}>
              {analytics.bounceRate.change <= 0 ? "↓" : "↑"} {Math.abs(analytics.bounceRate.change)}% vs. mes anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="traffic">
        <TabsList className="mb-4">
          <TabsTrigger value="traffic">Tráfico</TabsTrigger>
          <TabsTrigger value="pages">Páginas</TabsTrigger>
          <TabsTrigger value="devices">Dispositivos</TabsTrigger>
        </TabsList>

        <TabsContent value="traffic">
          <Card>
            <CardHeader>
              <CardTitle>Visitas por Día</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <LineChart data={analytics.trafficByDay} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pages">
          <Card>
            <CardHeader>
              <CardTitle>Páginas Más Visitadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <BarChart data={analytics.topPages} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="devices">
          <Card>
            <CardHeader>
              <CardTitle>Distribución por Dispositivos</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <div className="h-[300px] w-[300px]">
                <PieChart data={analytics.deviceDistribution} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Fuentes de Tráfico</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <PieChart data={analytics.trafficSources} />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Países</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <BarChart data={analytics.countries} horizontal />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

