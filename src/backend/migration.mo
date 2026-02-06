import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Nat "mo:core/Nat";

module {
  type BookingStatus = {
    #active;
    #completed;
    #cancelled;
  };

  type VehicleType = {
    #cab;
    #van;
    #truck;
    #bus;
  };

  type Vehicle = {
    id : Nat;
    vehicleType : VehicleType;
    isAvailable : Bool;
    currentLocation : Text;
  };

  type OldBooking = {
    id : Nat;
    user : Principal;
    vehicleId : Nat;
    dateTime : Time.Time;
    pickupLocation : Text;
    destination : Text;
    status : BookingStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type NewBooking = {
    id : Nat;
    user : Principal;
    vehicleId : Nat;
    dateTime : Time.Time;
    pickupLocation : Text;
    destination : Text;
    status : BookingStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    vehicleNo : Text;
    customerName : Text;
    customerNo : Text;
    startingKm : Nat;
    endingKm : Nat;
    totalKm : Nat;
    ratePerKm : Nat;
    totalAmount : Nat;
    tollTax : Nat;
    dieselOrGasByCustomer : Nat;
    netAmount : Nat;
  };

  type OldActor = {
    bookings : Map.Map<Nat, OldBooking>;
    vehicles : Map.Map<Nat, Vehicle>;
    nextBookingId : Nat;
    nextVehicleId : Nat;
  };

  type NewActor = {
    bookings : Map.Map<Nat, NewBooking>;
    vehicles : Map.Map<Nat, Vehicle>;
    nextBookingId : Nat;
    nextVehicleId : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newBookings = old.bookings.map<Nat, OldBooking, NewBooking>(
      func(_id, oldBooking) {
        {
          oldBooking with
          vehicleNo = "";
          customerName = "";
          customerNo = "";
          startingKm = 0;
          endingKm = 0;
          totalKm = 0;
          ratePerKm = 0;
          totalAmount = 0;
          tollTax = 0;
          dieselOrGasByCustomer = 0;
          netAmount = 0;
        };
      }
    );
    {
      old with
      bookings = newBookings;
    };
  };
};
