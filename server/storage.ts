import { 
  type Supplier, 
  type InsertSupplier,
  type Rate,
  type InsertRate,
  type Tour,
  type InsertTour,
  type Booking,
  type InsertBooking,
  type Guide,
  type InsertGuide,
  type SupplierWithRates,
  type TourWithBookings,
  type BookingWithSupplier
} from "@shared/schema";

export interface IStorage {
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<SupplierWithRates | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Rates
  getRatesBySupplier(supplierId: string): Promise<Rate[]>;
  createRate(rate: InsertRate): Promise<Rate>;
  updateRate(id: string, rate: Partial<InsertRate>): Promise<Rate | undefined>;
  deleteRate(id: string): Promise<boolean>;

  // Tours
  getTours(): Promise<Tour[]>;
  getTour(id: string): Promise<TourWithBookings | undefined>;
  createTour(tour: InsertTour): Promise<Tour>;
  updateTour(id: string, tour: Partial<InsertTour>): Promise<Tour | undefined>;
  deleteTour(id: string): Promise<boolean>;

  // Bookings
  getBookings(): Promise<BookingWithSupplier[]>;
  getBookingsByTour(tourId: string): Promise<BookingWithSupplier[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;

  // Guides
  getGuides(): Promise<Guide[]>;
  createGuide(guide: InsertGuide): Promise<Guide>;
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
