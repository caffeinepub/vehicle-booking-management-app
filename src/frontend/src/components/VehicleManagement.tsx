import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Car, Plus, MapPin, Trash2 } from 'lucide-react';
import { useAddVehicle, useDeleteVehicle, useSetVehicleAvailability } from '../hooks/useQueries';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { Vehicle } from '../backend';
import { VehicleType } from '../backend';

interface VehicleManagementProps {
  vehicles: Vehicle[];
  isLoading: boolean;
}

const vehicleTypeLabels: Record<VehicleType, string> = {
  [VehicleType.cab]: 'Cab',
  [VehicleType.van]: 'Van',
  [VehicleType.truck]: 'Truck',
  [VehicleType.bus]: 'Bus',
};

const vehicleTypeOptions: VehicleType[] = [VehicleType.cab, VehicleType.van, VehicleType.truck, VehicleType.bus];

export default function VehicleManagement({ vehicles, isLoading }: VehicleManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.cab);
  const [location, setLocation] = useState('');
  const [deletingVehicle, setDeletingVehicle] = useState<Vehicle | null>(null);

  const addVehicle = useAddVehicle();
  const deleteVehicle = useDeleteVehicle();
  const setVehicleAvailability = useSetVehicleAvailability();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      await addVehicle.mutateAsync({
        vehicleType,
        currentLocation: location.trim(),
      });
      setLocation('');
      setVehicleType(VehicleType.cab);
      setShowAddForm(false);
    }
  };

  const handleDelete = async () => {
    if (deletingVehicle) {
      await deleteVehicle.mutateAsync(deletingVehicle.id);
      setDeletingVehicle(null);
    }
  };

  const handleToggleAvailability = async (vehicle: Vehicle) => {
    await setVehicleAvailability.mutateAsync({
      vehicleId: vehicle.id,
      isAvailable: !vehicle.isAvailable,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vehicle Fleet</CardTitle>
              <CardDescription>Manage available vehicles and their locations</CardDescription>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Vehicle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">Loading vehicles...</p>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-12 text-center">
              <Car className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="mb-2 text-lg font-semibold">No vehicles available</h3>
              <p className="mb-4 text-muted-foreground">Add vehicles to start managing your fleet</p>
              <Button onClick={() => setShowAddForm(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add First Vehicle
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id.toString()}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Car className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {vehicleTypeLabels[vehicle.vehicleType]} #{vehicle.id.toString()}
                          </p>
                          <Badge
                            variant={vehicle.isAvailable ? 'default' : 'secondary'}
                            className="mt-1 cursor-pointer"
                            onClick={() => handleToggleAvailability(vehicle)}
                          >
                            {vehicle.isAvailable ? 'Available' : 'In Use'}
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingVehicle(vehicle)}
                        className="h-8 w-8 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span>{vehicle.currentLocation}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Vehicle Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Vehicle</DialogTitle>
            <DialogDescription>Add a new vehicle to your fleet with its type and current location.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select value={vehicleType} onValueChange={(value) => setVehicleType(value as VehicleType)}>
                <SelectTrigger id="vehicleType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {vehicleTypeOptions.map((type) => (
                    <SelectItem key={type} value={type}>
                      {vehicleTypeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Current Location</Label>
              <Input
                id="location"
                placeholder="Enter vehicle location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                className="flex-1"
                disabled={addVehicle.isPending}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={addVehicle.isPending || !location.trim()}>
                {addVehicle.isPending ? 'Adding...' : 'Add Vehicle'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingVehicle} onOpenChange={() => setDeletingVehicle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this vehicle? This action cannot be undone. Vehicles with active bookings cannot be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete Vehicle
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
