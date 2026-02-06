import { useState, useEffect } from 'react';
import { useCreateBooking, useUpdateBooking, useGetAvailableVehicles, useGetVehicle } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { Booking } from '../backend';
import { VehicleType } from '../backend';

interface BookingFormProps {
  onClose: () => void;
  booking?: Booking;
}

const vehicleTypeLabels: Record<VehicleType, string> = {
  [VehicleType.cab]: 'Cab',
  [VehicleType.van]: 'Van',
  [VehicleType.truck]: 'Truck',
  [VehicleType.bus]: 'Bus',
};

export default function BookingForm({ onClose, booking }: BookingFormProps) {
  const isEditing = !!booking;

  const [dateTime, setDateTime] = useState(() => {
    if (booking) {
      const date = new Date(Number(booking.dateTime) / 1_000_000);
      return date.toISOString().slice(0, 16);
    }
    return '';
  });
  const [pickupLocation, setPickupLocation] = useState(booking?.pickupLocation || '');
  const [destination, setDestination] = useState(booking?.destination || '');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    booking?.vehicleId.toString() || ''
  );

  // New fields
  const [vehicleNo, setVehicleNo] = useState(booking?.vehicleNo || '');
  const [customerName, setCustomerName] = useState(booking?.customerName || '');
  const [customerNo, setCustomerNo] = useState(booking?.customerNo || '');
  const [startingKm, setStartingKm] = useState(booking?.startingKm.toString() || '');
  const [endingKm, setEndingKm] = useState(booking?.endingKm.toString() || '');
  const [ratePerKm, setRatePerKm] = useState(booking?.ratePerKm.toString() || '');
  const [tollTax, setTollTax] = useState(booking?.tollTax.toString() || '');
  const [dieselOrGasByCustomer, setDieselOrGasByCustomer] = useState(booking?.dieselOrGasByCustomer.toString() || '');

  // Calculated fields
  const [totalKm, setTotalKm] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const { data: availableVehicles = [], isLoading: vehiclesLoading } = useGetAvailableVehicles();
  const { data: currentVehicle } = useGetVehicle(booking?.vehicleId ?? null);
  const createBooking = useCreateBooking();
  const updateBooking = useUpdateBooking();

  // Calculate derived values whenever inputs change
  useEffect(() => {
    const start = parseInt(startingKm) || 0;
    const end = parseInt(endingKm) || 0;
    const rate = parseInt(ratePerKm) || 0;
    const toll = parseInt(tollTax) || 0;
    const diesel = parseInt(dieselOrGasByCustomer) || 0;

    const km = end >= start ? end - start : 0;
    const amount = km * rate;
    const net = amount - toll - diesel;

    setTotalKm(km);
    setTotalAmount(amount);
    setNetAmount(net);
  }, [startingKm, endingKm, ratePerKm, tollTax, dieselOrGasByCustomer]);

  useEffect(() => {
    if (isEditing && currentVehicle && !availableVehicles.find(v => v.id === currentVehicle.id)) {
      // Current vehicle is already selected, keep it as an option
    }
  }, [isEditing, currentVehicle, availableVehicles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedVehicleId) {
      return;
    }

    const dateTimeNanos = BigInt(new Date(dateTime).getTime()) * BigInt(1_000_000);
    const vehicleId = BigInt(selectedVehicleId);

    // Parse numeric values
    const startingKmValue = BigInt(parseInt(startingKm) || 0);
    const endingKmValue = BigInt(parseInt(endingKm) || 0);
    const ratePerKmValue = BigInt(parseInt(ratePerKm) || 0);
    const tollTaxValue = BigInt(parseInt(tollTax) || 0);
    const dieselOrGasByCustomerValue = BigInt(parseInt(dieselOrGasByCustomer) || 0);

    if (isEditing) {
      await updateBooking.mutateAsync({
        bookingId: booking.id,
        vehicleId: vehicleId !== booking.vehicleId ? vehicleId : undefined,
        dateTime: dateTimeNanos,
        pickupLocation,
        destination,
        vehicleNo,
        customerName,
        customerNo,
        startingKm: startingKmValue,
        endingKm: endingKmValue,
        ratePerKm: ratePerKmValue,
        tollTax: tollTaxValue,
        dieselOrGasByCustomer: dieselOrGasByCustomerValue,
      });
    } else {
      await createBooking.mutateAsync({
        vehicleId,
        dateTime: dateTimeNanos,
        pickupLocation,
        destination,
        vehicleNo,
        customerName,
        customerNo,
        startingKm: startingKmValue,
        endingKm: endingKmValue,
        ratePerKm: ratePerKmValue,
        tollTax: tollTaxValue,
        dieselOrGasByCustomer: dieselOrGasByCustomerValue,
      });
    }

    onClose();
  };

  const isPending = createBooking.isPending || updateBooking.isPending;

  // Combine available vehicles with current vehicle if editing
  const vehicleOptions = isEditing && currentVehicle
    ? availableVehicles.find(v => v.id === currentVehicle.id)
      ? availableVehicles
      : [...availableVehicles, currentVehicle]
    : availableVehicles;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Booking' : 'New Booking'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your booking details below.' : 'Fill in the details for your vehicle booking.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicle">Vehicle</Label>
            <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId} required>
              <SelectTrigger id="vehicle">
                <SelectValue placeholder="Select a vehicle" />
              </SelectTrigger>
              <SelectContent>
                {vehiclesLoading ? (
                  <SelectItem value="loading" disabled>
                    Loading vehicles...
                  </SelectItem>
                ) : vehicleOptions.length === 0 ? (
                  <SelectItem value="none" disabled>
                    No vehicles available
                  </SelectItem>
                ) : (
                  vehicleOptions.map((vehicle) => (
                    <SelectItem key={vehicle.id.toString()} value={vehicle.id.toString()}>
                      {vehicleTypeLabels[vehicle.vehicleType]} #{vehicle.id.toString()} - {vehicle.currentLocation}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleNo">Vehicle Number</Label>
              <Input
                id="vehicleNo"
                placeholder="e.g., ABC-1234"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTime">Date & Time</Label>
              <Input
                id="dateTime"
                type="datetime-local"
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                required
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          <Separator />

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  placeholder="Enter customer name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerNo">Customer Phone</Label>
                <Input
                  id="customerNo"
                  placeholder="Enter phone number"
                  value={customerNo}
                  onChange={(e) => setCustomerNo(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Location Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Location Details</h3>
            <div className="space-y-2">
              <Label htmlFor="pickup">Pickup Location</Label>
              <Textarea
                id="pickup"
                placeholder="Enter pickup address"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Textarea
                id="destination"
                placeholder="Enter destination address"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
                rows={2}
              />
            </div>
          </div>

          <Separator />

          {/* Distance & Financial Details */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Distance & Financial Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startingKm">Starting Km</Label>
                <Input
                  id="startingKm"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={startingKm}
                  onChange={(e) => setStartingKm(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endingKm">Ending Km</Label>
                <Input
                  id="endingKm"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={endingKm}
                  onChange={(e) => setEndingKm(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ratePerKm">Rate per Km</Label>
                <Input
                  id="ratePerKm"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={ratePerKm}
                  onChange={(e) => setRatePerKm(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tollTax">Toll Tax</Label>
                <Input
                  id="tollTax"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={tollTax}
                  onChange={(e) => setTollTax(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="dieselOrGasByCustomer">Diesel/Gas by Customer</Label>
                <Input
                  id="dieselOrGasByCustomer"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={dieselOrGasByCustomer}
                  onChange={(e) => setDieselOrGasByCustomer(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          {/* Calculated Summary */}
          <div className="rounded-lg bg-muted p-4 space-y-2">
            <h3 className="text-sm font-semibold mb-3">Calculated Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Total Km</p>
                <p className="font-semibold text-lg">{totalKm}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Amount</p>
                <p className="font-semibold text-lg">{totalAmount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Net Amount</p>
                <p className="font-semibold text-lg text-primary">{netAmount}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isPending || !selectedVehicleId}>
              {isPending ? 'Saving...' : isEditing ? 'Update Booking' : 'Create Booking'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
