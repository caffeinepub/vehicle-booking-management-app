import { useGetAllBookings, useGetAllVehicles } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Car, Users, CheckCircle, XCircle, Clock } from 'lucide-react';
import BookingList from '../components/BookingList';
import VehicleManagement from '../components/VehicleManagement';
import { BookingStatus } from '../backend';

export default function AdminDashboard() {
  const { data: allBookings = [], isLoading: bookingsLoading } = useGetAllBookings();
  const { data: vehicles = [], isLoading: vehiclesLoading } = useGetAllVehicles();

  const activeBookings = allBookings.filter((b) => b.status === BookingStatus.active);
  const completedBookings = allBookings.filter((b) => b.status === BookingStatus.completed);
  const cancelledBookings = allBookings.filter((b) => b.status === BookingStatus.cancelled);

  // Get unique users
  const uniqueUsers = new Set(allBookings.map((b) => b.user.toString())).size;

  // Count available vehicles
  const availableVehicles = vehicles.filter((v) => v.isAvailable).length;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor all bookings and manage vehicle availability</p>
      </div>

      {/* Stats Grid */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allBookings.length}</div>
            <p className="text-xs text-muted-foreground">All time bookings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableVehicles}</div>
            <p className="text-xs text-muted-foreground">Ready for booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{cancelledBookings.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {allBookings.length > 0
                ? Math.round((completedBookings.length / allBookings.length) * 100)
                : 0}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for Bookings and Vehicles */}
      <Tabs defaultValue="bookings" className="space-y-6">
        <TabsList>
          <TabsTrigger value="bookings">All Bookings ({allBookings.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="vehicles">Vehicle Management ({vehicles.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="space-y-4">
          {bookingsLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Loading bookings...</p>
              </CardContent>
            </Card>
          ) : allBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No bookings yet</h3>
                <p className="text-muted-foreground">Bookings will appear here once staff start making reservations</p>
              </CardContent>
            </Card>
          ) : (
            <BookingList bookings={allBookings} showActions isAdmin />
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          {bookingsLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Loading active bookings...</p>
              </CardContent>
            </Card>
          ) : activeBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No active bookings</h3>
                <p className="text-muted-foreground">Active bookings will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <BookingList bookings={activeBookings} showActions isAdmin />
          )}
        </TabsContent>

        <TabsContent value="vehicles" className="space-y-4">
          <VehicleManagement vehicles={vehicles} isLoading={vehiclesLoading} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
