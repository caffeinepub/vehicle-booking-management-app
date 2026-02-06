import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { Booking, UserRole, Time, Vehicle, VehicleType } from '../backend';
import { toast } from 'sonner';

// User Role Queries
export function useGetCallerUserRole() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<UserRole>({
    queryKey: ['userRole', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserRole();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isAdmin'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Booking Queries
export function useGetUserBookings() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Booking[]>({
    queryKey: ['userBookings', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUserBookings();
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetBooking(bookingId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Booking | null>({
    queryKey: ['booking', bookingId?.toString()],
    queryFn: async () => {
      if (!actor || !bookingId) return null;
      return actor.getBooking(bookingId);
    },
    enabled: !!actor && !actorFetching && bookingId !== null,
  });
}

export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      dateTime,
      pickupLocation,
      destination,
      vehicleNo,
      customerName,
      customerNo,
      startingKm,
      endingKm,
      ratePerKm,
      tollTax,
      dieselOrGasByCustomer,
    }: {
      vehicleId: bigint;
      dateTime: Time;
      pickupLocation: string;
      destination: string;
      vehicleNo: string;
      customerName: string;
      customerNo: string;
      startingKm: bigint;
      endingKm: bigint;
      ratePerKm: bigint;
      tollTax: bigint;
      dieselOrGasByCustomer: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createBooking(
        vehicleId,
        dateTime,
        pickupLocation,
        destination,
        vehicleNo,
        customerName,
        customerNo,
        startingKm,
        endingKm,
        ratePerKm,
        tollTax,
        dieselOrGasByCustomer
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      toast.success('Booking created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create booking: ${error.message}`);
    },
  });
}

export function useUpdateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      bookingId,
      vehicleId,
      dateTime,
      pickupLocation,
      destination,
      vehicleNo,
      customerName,
      customerNo,
      startingKm,
      endingKm,
      ratePerKm,
      tollTax,
      dieselOrGasByCustomer,
    }: {
      bookingId: bigint;
      vehicleId?: bigint;
      dateTime?: Time;
      pickupLocation?: string;
      destination?: string;
      vehicleNo?: string;
      customerName?: string;
      customerNo?: string;
      startingKm?: bigint;
      endingKm?: bigint;
      ratePerKm?: bigint;
      tollTax?: bigint;
      dieselOrGasByCustomer?: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBooking(
        bookingId,
        vehicleId ?? null,
        dateTime ?? null,
        pickupLocation ?? null,
        destination ?? null,
        vehicleNo ?? null,
        customerName ?? null,
        customerNo ?? null,
        startingKm ?? null,
        endingKm ?? null,
        ratePerKm ?? null,
        tollTax ?? null,
        dieselOrGasByCustomer ?? null
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      toast.success('Booking updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update booking: ${error.message}`);
    },
  });
}

export function useCancelBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.cancelBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userBookings'] });
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      toast.success('Booking cancelled successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel booking: ${error.message}`);
    },
  });
}

export function useCompleteBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookingId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.completeBooking(bookingId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['booking'] });
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      toast.success('Booking marked as completed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to complete booking: ${error.message}`);
    },
  });
}

// Vehicle Queries
export function useGetAvailableVehicles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Vehicle[]>({
    queryKey: ['availableVehicles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAvailableVehicles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetAllVehicles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Vehicle[]>({
    queryKey: ['allVehicles'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllVehicles();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useGetVehicle(vehicleId: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Vehicle | null>({
    queryKey: ['vehicle', vehicleId?.toString()],
    queryFn: async () => {
      if (!actor || !vehicleId) return null;
      return actor.getVehicle(vehicleId);
    },
    enabled: !!actor && !actorFetching && vehicleId !== null,
  });
}

export function useAddVehicle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleType,
      currentLocation,
    }: {
      vehicleType: VehicleType;
      currentLocation: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addVehicle(vehicleType, currentLocation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['allVehicles'] });
      toast.success('Vehicle added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add vehicle: ${error.message}`);
    },
  });
}

export function useUpdateVehicle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      vehicleId,
      vehicleType,
      currentLocation,
    }: {
      vehicleId: bigint;
      vehicleType?: VehicleType;
      currentLocation?: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVehicle(vehicleId, vehicleType ?? null, currentLocation ?? null);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['allVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['vehicle'] });
      toast.success('Vehicle updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vehicle: ${error.message}`);
    },
  });
}

export function useDeleteVehicle() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (vehicleId: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVehicle(vehicleId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['allVehicles'] });
      toast.success('Vehicle deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete vehicle: ${error.message}`);
    },
  });
}

export function useSetVehicleAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, isAvailable }: { vehicleId: bigint; isAvailable: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.setVehicleAvailability(vehicleId, isAvailable);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['allVehicles'] });
      toast.success('Vehicle availability updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vehicle availability: ${error.message}`);
    },
  });
}

export function useUpdateVehicleLocation() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ vehicleId, newLocation }: { vehicleId: bigint; newLocation: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVehicleLocation(vehicleId, newLocation);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availableVehicles'] });
      queryClient.invalidateQueries({ queryKey: ['allVehicles'] });
      toast.success('Vehicle location updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update vehicle location: ${error.message}`);
    },
  });
}
