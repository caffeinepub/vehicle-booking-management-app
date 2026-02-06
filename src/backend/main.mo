import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Migration "migration";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

// Apply state migration using data-migration library in with-clause!
(with migration = Migration.run)
actor {
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

  type Booking = {
    id : Nat;
    user : Principal;
    vehicleId : Nat;
    dateTime : Time.Time;
    pickupLocation : Text;
    destination : Text;
    status : BookingStatus;
    createdAt : Time.Time;
    updatedAt : Time.Time;

    // New fields
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

  public type UserProfile = {
    name : Text;
    role : Text; // "Staff" or "Admin"
  };

  module Booking {
    public func compare(b1 : Booking, b2 : Booking) : Order.Order {
      Int.compare(b1.dateTime, b2.dateTime);
    };
  };

  var nextBookingId = 1;
  var nextVehicleId = 1;

  let bookings = Map.empty<Nat, Booking>();
  let vehicles = Map.empty<Nat, Vehicle>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Management
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Vehicle Management
  public shared ({ caller }) func addVehicle(
    vehicleType : VehicleType,
    currentLocation : Text
  ) : async Nat {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can add vehicles");
    };

    let id = nextVehicleId;
    let vehicle : Vehicle = {
      id;
      vehicleType;
      isAvailable = true;
      currentLocation;
    };

    vehicles.add(id, vehicle);
    nextVehicleId += 1;
    id;
  };

  public shared ({ caller }) func updateVehicle(
    vehicleId : Nat,
    vehicleType : ?VehicleType,
    currentLocation : ?Text
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update vehicles");
    };

    switch (vehicles.get(vehicleId)) {
      case (null) {
        Runtime.trap("Vehicle not found");
      };
      case (?vehicle) {
        let updatedVehicle = {
          vehicle with
          vehicleType = switch (vehicleType) {
            case (null) { vehicle.vehicleType };
            case (?newType) { newType };
          };
          currentLocation = switch (currentLocation) {
            case (null) { vehicle.currentLocation };
            case (?newLocation) { newLocation };
          };
        };
        vehicles.add(vehicleId, updatedVehicle);
      };
    };
  };

  public shared ({ caller }) func deleteVehicle(vehicleId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can delete vehicles");
    };

    switch (vehicles.get(vehicleId)) {
      case (null) {
        Runtime.trap("Vehicle not found");
      };
      case (?_vehicle) {
        // Check if vehicle has active bookings
        let hasActiveBookings = bookings.values().toArray().any(
          func(booking) {
            booking.vehicleId == vehicleId and booking.status == #active;
          }
        );

        if (hasActiveBookings) {
          Runtime.trap("Cannot delete vehicle with active bookings");
        };

        vehicles.remove(vehicleId);
      };
    };
  };

  public shared ({ caller }) func setVehicleAvailability(
    vehicleId : Nat,
    isAvailable : Bool
  ) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can set vehicle availability");
    };

    switch (vehicles.get(vehicleId)) {
      case (null) {
        Runtime.trap("Vehicle not found");
      };
      case (?vehicle) {
        let updatedVehicle = {
          vehicle with
          isAvailable;
        };
        vehicles.add(vehicleId, updatedVehicle);
      };
    };
  };

  // Booking Management
  public shared ({ caller }) func createBooking(
    vehicleId : Nat,
    dateTime : Time.Time,
    pickupLocation : Text,
    destination : Text,
    vehicleNo : Text,
    customerName : Text,
    customerNo : Text,
    startingKm : Nat,
    endingKm : Nat,
    ratePerKm : Nat,
    tollTax : Nat,
    dieselOrGasByCustomer : Nat
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can create bookings");
    };

    switch (vehicles.get(vehicleId)) {
      case (null) {
        Runtime.trap("Vehicle not found");
      };
      case (?vehicle) {
        if (not vehicle.isAvailable) {
          Runtime.trap("Selected vehicle is not available");
        };

        let totalKm = if (endingKm >= startingKm) {
          endingKm - startingKm;
        } else {
          Runtime.trap("Invalid kilometer range");
        };

        let totalAmount = totalKm * ratePerKm;
        let netAmount = totalAmount - tollTax - dieselOrGasByCustomer;

        let id = nextBookingId;
        let booking : Booking = {
          id;
          user = caller;
          vehicleId;
          dateTime;
          pickupLocation;
          destination;
          status = #active;
          createdAt = Time.now();
          updatedAt = Time.now();

          vehicleNo;
          customerName;
          customerNo;
          startingKm;
          endingKm;
          totalKm;
          ratePerKm;
          totalAmount;
          tollTax;
          dieselOrGasByCustomer;
          netAmount;
        };

        bookings.add(id, booking);
        nextBookingId += 1;
        id;
      };
    };
  };

  public shared ({ caller }) func updateBooking(
    bookingId : Nat,
    vehicleId : ?Nat,
    dateTime : ?Time.Time,
    pickupLocation : ?Text,
    destination : ?Text,
    vehicleNo : ?Text,
    customerName : ?Text,
    customerNo : ?Text,
    startingKm : ?Nat,
    endingKm : ?Nat,
    ratePerKm : ?Nat,
    tollTax : ?Nat,
    dieselOrGasByCustomer : ?Nat
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can update bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        // Authorization: Users can only update their own bookings, admins can update any
        if (booking.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only update your own bookings");
        };

        // Validate new vehicleId if provided
        let finalVehicleId = switch (vehicleId) {
          case (null) { booking.vehicleId };
          case (?newVehicleId) {
            switch (vehicles.get(newVehicleId)) {
              case (null) {
                Runtime.trap("Vehicle not found");
              };
              case (?vehicle) {
                if (not vehicle.isAvailable) {
                  Runtime.trap("Selected vehicle is not available");
                };
                newVehicleId;
              };
            };
          };
        };

        let finalStartingKm = switch (startingKm) {
          case (null) { booking.startingKm };
          case (?newStartingKm) { newStartingKm };
        };

        let finalEndingKm = switch (endingKm) {
          case (null) { booking.endingKm };
          case (?newEndingKm) { newEndingKm };
        };

        if (finalEndingKm < finalStartingKm) {
          Runtime.trap("Invalid kilometer range");
        };

        let finalTotalKm = finalEndingKm - finalStartingKm;
        let finalRatePerKm = switch (ratePerKm) {
          case (null) { booking.ratePerKm };
          case (?newRate) { newRate };
        };

        let finalTotalAmount = finalTotalKm * finalRatePerKm;
        let finalTollTax = switch (tollTax) {
          case (null) { booking.tollTax };
          case (?newTollTax) { newTollTax };
        };

        let finalDieselOrGasByCustomer = switch (dieselOrGasByCustomer) {
          case (null) { booking.dieselOrGasByCustomer };
          case (?newDieselOrGasByCustomer) { newDieselOrGasByCustomer };
        };

        let finalNetAmount = finalTotalAmount - finalTollTax - finalDieselOrGasByCustomer;

        let updatedBooking = {
          booking with
          vehicleId = finalVehicleId;
          dateTime = switch (dateTime) {
            case (null) { booking.dateTime };
            case (?newDateTime) { newDateTime };
          };
          pickupLocation = switch (pickupLocation) {
            case (null) { booking.pickupLocation };
            case (?newLocation) { newLocation };
          };
          destination = switch (destination) {
            case (null) { booking.destination };
            case (?newDestination) { newDestination };
          };
          vehicleNo = switch (vehicleNo) {
            case (null) { booking.vehicleNo };
            case (?newVehicleNo) { newVehicleNo };
          };
          customerName = switch (customerName) {
            case (null) { booking.customerName };
            case (?newCustomerName) { newCustomerName };
          };
          customerNo = switch (customerNo) {
            case (null) { booking.customerNo };
            case (?newCustomerNo) { newCustomerNo };
          };
          startingKm = finalStartingKm;
          endingKm = finalEndingKm;
          totalKm = finalTotalKm;
          ratePerKm = finalRatePerKm;
          totalAmount = finalTotalAmount;
          tollTax = finalTollTax;
          dieselOrGasByCustomer = finalDieselOrGasByCustomer;
          netAmount = finalNetAmount;
          updatedAt = Time.now();
        };

        bookings.add(bookingId, updatedBooking);
      };
    };
  };

  public shared ({ caller }) func cancelBooking(bookingId : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can cancel bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        // Authorization: Users can only cancel their own bookings, admins can cancel any
        if (booking.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only cancel your own bookings");
        };

        let cancelledBooking = {
          booking with
          status = #cancelled;
          updatedAt = Time.now();
        };

        bookings.add(bookingId, cancelledBooking);
      };
    };
  };

  public shared ({ caller }) func completeBooking(bookingId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can complete bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) {
        Runtime.trap("Booking not found");
      };
      case (?booking) {
        let completedBooking = {
          booking with
          status = #completed;
          updatedAt = Time.now();
        };

        bookings.add(bookingId, completedBooking);
      };
    };
  };

  // Query Functions
  public query ({ caller }) func getUserBookings() : async [Booking] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view bookings");
    };

    let userBookings = bookings.values().toArray().filter(
      func(booking) {
        booking.user == caller;
      }
    );
    userBookings.sort();
  };

  public query ({ caller }) func getAllBookings() : async [Booking] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can get all bookings");
    };

    bookings.values().toArray().sort();
  };

  public query ({ caller }) func getBooking(bookingId : Nat) : async ?Booking {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view bookings");
    };

    switch (bookings.get(bookingId)) {
      case (null) { null };
      case (?booking) {
        // Authorization: Users can only view their own bookings, admins can view any
        if (booking.user != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
        ?booking;
      };
    };
  };

  public query ({ caller }) func getAvailableVehicles() : async [Vehicle] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view available vehicles");
    };

    let availableVehicles = vehicles.values().toArray().filter(
      func(vehicle) {
        vehicle.isAvailable;
      }
    );
    availableVehicles;
  };

  public query ({ caller }) func getAllVehicles() : async [Vehicle] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all vehicles");
    };

    vehicles.values().toArray();
  };

  public query ({ caller }) func getVehicle(vehicleId : Nat) : async ?Vehicle {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only authenticated users can view vehicles");
    };

    vehicles.get(vehicleId);
  };

  public shared ({ caller }) func updateVehicleLocation(vehicleId : Nat, newLocation : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can update vehicle locations");
    };

    switch (vehicles.get(vehicleId)) {
      case (null) {
        Runtime.trap("Vehicle not found");
      };
      case (?vehicle) {
        let updatedVehicle = {
          vehicle with
          currentLocation = newLocation;
        };
        vehicles.add(vehicleId, updatedVehicle);
      };
    };
  };
};
