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
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private suppliers: Map<string, Supplier> = new Map();
  private rates: Map<string, Rate> = new Map();
  private tours: Map<string, Tour> = new Map();
  private bookings: Map<string, Booking> = new Map();
  private guides: Map<string, Guide> = new Map();

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return Array.from(this.suppliers.values());
  }

  async getSupplier(id: string): Promise<SupplierWithRates | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;

    const rates = Array.from(this.rates.values()).filter(rate => rate.supplierId === id);
    return { ...supplier, rates };
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const id = randomUUID();
    const supplier: Supplier = { 
      ...insertSupplier, 
      id,
      createdAt: new Date()
    };
    this.suppliers.set(id, supplier);
    return supplier;
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const supplier = this.suppliers.get(id);
    if (!supplier) return undefined;

    const updated = { ...supplier, ...updates };
    this.suppliers.set(id, updated);
    return updated;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    return this.suppliers.delete(id);
  }

  // Rates
  async getRatesBySupplier(supplierId: string): Promise<Rate[]> {
    return Array.from(this.rates.values()).filter(rate => rate.supplierId === supplierId);
  }

  async createRate(insertRate: InsertRate): Promise<Rate> {
    const id = randomUUID();
    const rate: Rate = { ...insertRate, id };
    this.rates.set(id, rate);
    return rate;
  }

  async updateRate(id: string, updates: Partial<InsertRate>): Promise<Rate | undefined> {
    const rate = this.rates.get(id);
    if (!rate) return undefined;

    const updated = { ...rate, ...updates };
    this.rates.set(id, updated);
    return updated;
  }

  async deleteRate(id: string): Promise<boolean> {
    return this.rates.delete(id);
  }

  // Tours
  async getTours(): Promise<Tour[]> {
    return Array.from(this.tours.values());
  }

  async getTour(id: string): Promise<TourWithBookings | undefined> {
    const tour = this.tours.get(id);
    if (!tour) return undefined;

    const bookings = await this.getBookingsByTour(id);
    return { ...tour, bookings };
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const id = randomUUID();
    const tour: Tour = { 
      ...insertTour, 
      id,
      createdAt: new Date()
    };
    this.tours.set(id, tour);
    return tour;
  }

  async updateTour(id: string, updates: Partial<InsertTour>): Promise<Tour | undefined> {
    const tour = this.tours.get(id);
    if (!tour) return undefined;

    const updated = { ...tour, ...updates };
    this.tours.set(id, updated);
    return updated;
  }

  async deleteTour(id: string): Promise<boolean> {
    return this.tours.delete(id);
  }

  // Bookings
  async getBookings(): Promise<BookingWithSupplier[]> {
    const bookings = Array.from(this.bookings.values());
    const results: BookingWithSupplier[] = [];

    for (const booking of bookings) {
      const supplier = this.suppliers.get(booking.supplierId);
      if (supplier) {
        results.push({ ...booking, supplier });
      }
    }

    return results;
  }

  async getBookingsByTour(tourId: string): Promise<BookingWithSupplier[]> {
    const bookings = Array.from(this.bookings.values()).filter(booking => booking.tourId === tourId);
    const results: BookingWithSupplier[] = [];

    for (const booking of bookings) {
      const supplier = this.suppliers.get(booking.supplierId);
      if (supplier) {
        results.push({ ...booking, supplier });
      }
    }

    return results;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const booking: Booking = { ...insertBooking, id };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updated = { ...booking, ...updates };
    this.bookings.set(id, updated);
    return updated;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    return Array.from(this.guides.values());
  }

  async createGuide(insertGuide: InsertGuide): Promise<Guide> {
    const id = randomUUID();
    const guide: Guide = { ...insertGuide, id };
    this.guides.set(id, guide);
    return guide;
  }
}

export const storage = new MemStorage();
