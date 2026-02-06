# Vehicle Booking Management App

## Overview
A vehicle booking management application that allows staff members to book, manage, and track their vehicle reservations while providing administrators with comprehensive oversight capabilities.

## Authentication & Authorization
- Users authenticate using Internet Identity
- Two user roles: Staff and Admin
- Role-based access control restricts data visibility based on user permissions

## Core Features

### Staff Features
- Book new vehicle reservations by selecting date, time, pickup location, destination, and available vehicle
- Enter detailed booking information including vehicle number, customer details, distance tracking, and financial calculations
- View all personal bookings (current and past) with vehicle details and financial information
- Edit existing bookings (modify time, locations, financial details, or other information)
- Cancel bookings
- Dashboard showing personal booking history and status with vehicle and financial information

### Admin Features
- Overview dashboard displaying all staff bookings across the organization with financial summaries
- View vehicle availability and utilization
- Access detailed booking information for all staff members including financial data
- Monitor booking patterns, statistics, and financial metrics
- Manage vehicle fleet (add, edit, remove vehicles)

## Data Storage (Backend)
- User profiles with role assignments (Staff/Admin)
- Vehicle records including:
  - Vehicle ID
  - Vehicle type (Cab, Van, Truck, Bus)
  - Availability status
- Booking records including:
  - Staff member ID
  - Vehicle ID reference
  - Booking date and time
  - Pickup and destination locations
  - Booking status (active, completed, cancelled)
  - Creation and modification timestamps
  - Vehicle number (vehicleNo)
  - Customer name (customerName)
  - Customer number (customerNo)
  - Starting kilometer reading (startingKm)
  - Ending kilometer reading (endingKm)
  - Total kilometers (totalKm - calculated as endingKm - startingKm)
  - Rate per kilometer (ratePerKm)
  - Total amount (totalAmount - calculated as totalKm * ratePerKm)
  - Toll tax amount (tollTax)
  - Diesel or gas paid by customer (dieselOrGasByCustomer)
  - Net amount (netAmount - calculated as totalAmount - tollTax - dieselOrGasByCustomer)

## Backend Operations
- Create, read, update, delete vehicles
- Create new bookings with vehicle assignment and financial calculations
- Retrieve user-specific bookings (for staff)
- Retrieve all bookings (for admins)
- Update existing bookings including financial data
- Cancel bookings
- Manage user roles and permissions
- Check vehicle availability before booking
- Retrieve available vehicles for booking selection
- Perform automatic calculations for totalKm, totalAmount, and netAmount fields
- Validate numeric fields for kilometers and amounts

## User Interface
- Clean, responsive design optimized for desktop and mobile
- Separate dashboard views for staff and admin users
- Comprehensive booking form with date/time pickers, location inputs, vehicle selection dropdown, and financial input fields
- Real-time calculation display for totalKm, totalAmount, and netAmount as users input values
- Booking list with filtering and sorting capabilities showing vehicle details and financial information
- Status indicators for booking states
- Vehicle management interface for admins
- Vehicle type and identifier display in booking listings
- Financial summary displays in booking details and lists
- Numeric field validation for all kilometer and amount inputs
