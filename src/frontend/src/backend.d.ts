import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Booking {
    id: bigint;
    customerName: string;
    status: BookingStatus;
    destination: string;
    netAmount: bigint;
    ratePerKm: bigint;
    endingKm: bigint;
    totalKm: bigint;
    startingKm: bigint;
    createdAt: Time;
    user: Principal;
    dieselOrGasByCustomer: bigint;
    updatedAt: Time;
    totalAmount: bigint;
    tollTax: bigint;
    customerNo: string;
    dateTime: Time;
    vehicleId: bigint;
    vehicleNo: string;
    pickupLocation: string;
}
export interface Vehicle {
    id: bigint;
    vehicleType: VehicleType;
    isAvailable: boolean;
    currentLocation: string;
}
export interface UserProfile {
    name: string;
    role: string;
}
export enum BookingStatus {
    active = "active",
    cancelled = "cancelled",
    completed = "completed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum VehicleType {
    bus = "bus",
    cab = "cab",
    van = "van",
    truck = "truck"
}
export interface backendInterface {
    addVehicle(vehicleType: VehicleType, currentLocation: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelBooking(bookingId: bigint): Promise<void>;
    completeBooking(bookingId: bigint): Promise<void>;
    createBooking(vehicleId: bigint, dateTime: Time, pickupLocation: string, destination: string, vehicleNo: string, customerName: string, customerNo: string, startingKm: bigint, endingKm: bigint, ratePerKm: bigint, tollTax: bigint, dieselOrGasByCustomer: bigint): Promise<bigint>;
    deleteVehicle(vehicleId: bigint): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getAllVehicles(): Promise<Array<Vehicle>>;
    getAvailableVehicles(): Promise<Array<Vehicle>>;
    getBooking(bookingId: bigint): Promise<Booking | null>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserBookings(): Promise<Array<Booking>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVehicle(vehicleId: bigint): Promise<Vehicle | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setVehicleAvailability(vehicleId: bigint, isAvailable: boolean): Promise<void>;
    updateBooking(bookingId: bigint, vehicleId: bigint | null, dateTime: Time | null, pickupLocation: string | null, destination: string | null, vehicleNo: string | null, customerName: string | null, customerNo: string | null, startingKm: bigint | null, endingKm: bigint | null, ratePerKm: bigint | null, tollTax: bigint | null, dieselOrGasByCustomer: bigint | null): Promise<void>;
    updateVehicle(vehicleId: bigint, vehicleType: VehicleType | null, currentLocation: string | null): Promise<void>;
    updateVehicleLocation(vehicleId: bigint, newLocation: string): Promise<void>;
}
