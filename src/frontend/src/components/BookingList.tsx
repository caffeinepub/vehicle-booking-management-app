import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Navigation, Edit, Trash2, CheckCircle, Car, User, Phone, Gauge, DollarSign } from 'lucide-react';
import { useCancelBooking, useCompleteBooking, useGetVehicle } from '../hooks/useQueries';
import BookingForm from './BookingForm';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import type { Booking } from '../backend';
import { BookingStatus, VehicleType } from '../backend';

interface BookingListProps {
  bookings: Booking[];
  showActions: boolean;
  isAdmin?: boolean;
}

const vehicleTypeLabels: Record<VehicleType, string> = {
  [VehicleType.cab]: 'Cab',
  [VehicleType.van]: 'Van',
  [VehicleType.truck]: 'Truck',
  [VehicleType.bus]: 'Bus',
};

function VehicleInfo({ vehicleId }: { vehicleId: bigint }) {
  const { data: vehicle, isLoading } = useGetVehicle(vehicleId);

  if (isLoading) {
    return <span className="text-sm text-muted-foreground">Loading...</span>;
  }

  if (!vehicle) {
    return <span className="text-sm text-muted-foreground">Vehicle #{vehicleId.toString()}</span>;
  }

  return (
    <span className="text-sm text-muted-foreground">
      {vehicleTypeLabels[vehicle.vehicleType]} #{vehicle.id.toString()}
    </span>
  );
}

export default function BookingList({ bookings, showActions, isAdmin = false }: BookingListProps) {
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [completingBooking, setCompletingBooking] = useState<Booking | null>(null);

  const cancelBooking = useCancelBooking();
  const completeBooking = useCompleteBooking();

  const handleCancel = async () => {
    if (cancellingBooking) {
      await cancelBooking.mutateAsync(cancellingBooking.id);
      setCancellingBooking(null);
    }
  };

  const handleComplete = async () => {
    if (completingBooking) {
      await completeBooking.mutateAsync(completingBooking.id);
      setCompletingBooking(null);
    }
  };

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1_000_000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case BookingStatus.active:
        return <Badge className="bg-blue-600">Active</Badge>;
      case BookingStatus.completed:
        return <Badge className="bg-green-600">Completed</Badge>;
      case BookingStatus.cancelled:
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-4">
        {bookings.map((booking) => (
          <Card key={booking.id.toString()}>
            <CardContent className="p-6">
              <div className="flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      {getStatusBadge(booking.status)}
                      <span className="text-sm text-muted-foreground">#{booking.id.toString()}</span>
                    </div>
                    {isAdmin && (
                      <p className="mb-2 text-sm text-muted-foreground">
                        Staff: {booking.user.toString().slice(0, 8)}...
                      </p>
                    )}
                  </div>
                  {showActions && booking.status === BookingStatus.active && (
                    <div className="flex gap-2">
                      {!isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingBooking(booking)}
                          className="gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      {isAdmin && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCompletingBooking(booking)}
                          className="gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </Button>
                      )}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setCancellingBooking(booking)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column - Vehicle & Location */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <Car className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Vehicle</p>
                        <VehicleInfo vehicleId={booking.vehicleId} />
                        <p className="text-xs text-muted-foreground mt-1">{booking.vehicleNo}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Booking Time</p>
                        <p className="text-sm text-muted-foreground">{formatDate(booking.dateTime)}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Pickup</p>
                        <p className="text-sm text-muted-foreground">{booking.pickupLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Navigation className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Destination</p>
                        <p className="text-sm text-muted-foreground">{booking.destination}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Customer & Financial */}
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Customer</p>
                        <p className="text-sm text-muted-foreground">{booking.customerName}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Phone className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Phone</p>
                        <p className="text-sm text-muted-foreground">{booking.customerNo}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Gauge className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Distance</p>
                        <p className="text-sm text-muted-foreground">
                          {booking.totalKm.toString()} km ({booking.startingKm.toString()} - {booking.endingKm.toString()})
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <DollarSign className="mt-0.5 h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Rate</p>
                        <p className="text-sm text-muted-foreground">{booking.ratePerKm.toString()} per km</p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Financial Summary */}
                <div className="rounded-lg bg-muted p-3">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Total Amount</p>
                      <p className="font-semibold">{booking.totalAmount.toString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Toll Tax</p>
                      <p className="font-semibold">{booking.tollTax.toString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Diesel/Gas</p>
                      <p className="font-semibold">{booking.dieselOrGasByCustomer.toString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Net Amount</p>
                      <p className="font-semibold text-primary">{booking.netAmount.toString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      {editingBooking && (
        <BookingForm booking={editingBooking} onClose={() => setEditingBooking(null)} />
      )}

      {/* Cancel Confirmation */}
      <AlertDialog open={!!cancellingBooking} onOpenChange={() => setCancellingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Yes, cancel booking
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Complete Confirmation */}
      <AlertDialog open={!!completingBooking} onOpenChange={() => setCompletingBooking(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Mark this booking as completed? This will update the booking status.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete}>
              Yes, mark as completed
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
