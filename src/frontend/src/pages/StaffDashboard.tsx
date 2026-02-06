import { useState } from 'react';
import { useGetUserBookings } from '../hooks/useQueries';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Calendar, MapPin, Clock } from 'lucide-react';
import BookingForm from '../components/BookingForm';
import BookingList from '../components/BookingList';
import { BookingStatus } from '../backend';

export default function StaffDashboard() {
  const { data: bookings = [], isLoading } = useGetUserBookings();
  const [showBookingForm, setShowBookingForm] = useState(false);

  const activeBookings = bookings.filter((b) => b.status === BookingStatus.active);
  const pastBookings = bookings.filter(
    (b) => b.status === BookingStatus.completed || b.status === BookingStatus.cancelled
  );

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">Manage your vehicle reservations and view booking history</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings.length}</div>
            <p className="text-xs text-muted-foreground">Current reservations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookings.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bookings.filter((b) => b.status === BookingStatus.completed).length}
            </div>
            <p className="text-xs text-muted-foreground">Successful trips</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
      <div className="mb-6">
        <Button onClick={() => setShowBookingForm(true)} size="lg" className="gap-2">
          <Plus className="h-5 w-5" />
          New Booking
        </Button>
      </div>

      {/* Bookings Tabs */}
      <Tabs defaultValue="active" className="space-y-6">
        <TabsList>
          <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
          <TabsTrigger value="history">History ({pastBookings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Loading bookings...</p>
              </CardContent>
            </Card>
          ) : activeBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No active bookings</h3>
                <p className="mb-4 text-muted-foreground">Create your first booking to get started</p>
                <Button onClick={() => setShowBookingForm(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Booking
                </Button>
              </CardContent>
            </Card>
          ) : (
            <BookingList bookings={activeBookings} showActions />
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground">Loading history...</p>
              </CardContent>
            </Card>
          ) : pastBookings.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-lg font-semibold">No booking history</h3>
                <p className="text-muted-foreground">Your completed and cancelled bookings will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <BookingList bookings={pastBookings} showActions={false} />
          )}
        </TabsContent>
      </Tabs>

      {/* Booking Form Dialog */}
      {showBookingForm && <BookingForm onClose={() => setShowBookingForm(false)} />}
    </div>
  );
}
