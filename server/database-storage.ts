import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  suppliers, 
  rates, 
  tours, 
  bookings, 
  guides,
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
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    return await db.select().from(suppliers);
  }

  async getSupplier(id: string): Promise<SupplierWithRates | undefined> {
    const supplier = await db.select().from(suppliers).where(eq(suppliers.id, id)).limit(1);
    if (supplier.length === 0) return undefined;

    const supplierRates = await db.select().from(rates).where(eq(rates.supplierId, id));
    return { ...supplier[0], rates: supplierRates };
  }

  async createSupplier(insertSupplier: InsertSupplier): Promise<Supplier> {
    const result = await db.insert(suppliers).values(insertSupplier).returning();
    return result[0];
  }

  async updateSupplier(id: string, updates: Partial<InsertSupplier>): Promise<Supplier | undefined> {
    const result = await db.update(suppliers)
      .set(updates)
      .where(eq(suppliers.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteSupplier(id: string): Promise<boolean> {
    const result = await db.delete(suppliers).where(eq(suppliers.id, id)).returning();
    return result.length > 0;
  }

  // Rates
  async getRatesBySupplier(supplierId: string): Promise<Rate[]> {
    return await db.select().from(rates).where(eq(rates.supplierId, supplierId));
  }

  async createRate(insertRate: InsertRate): Promise<Rate> {
    const result = await db.insert(rates).values(insertRate).returning();
    return result[0];
  }

  async updateRate(id: string, updates: Partial<InsertRate>): Promise<Rate | undefined> {
    const result = await db.update(rates)
      .set(updates)
      .where(eq(rates.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteRate(id: string): Promise<boolean> {
    const result = await db.delete(rates).where(eq(rates.id, id)).returning();
    return result.length > 0;
  }

  // Tours
  async getTours(): Promise<Tour[]> {
    return await db.select().from(tours);
  }

  async getTour(id: string): Promise<TourWithBookings | undefined> {
    const tour = await db.select().from(tours).where(eq(tours.id, id)).limit(1);
    if (tour.length === 0) return undefined;

    const tourBookings = await this.getBookingsByTour(id);
    return { ...tour[0], bookings: tourBookings };
  }

  async createTour(insertTour: InsertTour): Promise<Tour> {
    const result = await db.insert(tours).values(insertTour).returning();
    return result[0];
  }

  async updateTour(id: string, updates: Partial<InsertTour>): Promise<Tour | undefined> {
    const result = await db.update(tours)
      .set(updates)
      .where(eq(tours.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteTour(id: string): Promise<boolean> {
    const result = await db.delete(tours).where(eq(tours.id, id)).returning();
    return result.length > 0;
  }

  // Bookings
  async getBookings(): Promise<BookingWithSupplier[]> {
    const allBookings = await db.select({
      id: bookings.id,
      tourId: bookings.tourId,
      supplierId: bookings.supplierId,
      serviceDesc: bookings.serviceDesc,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      pax: bookings.pax,
      confirmationNo: bookings.confirmationNo,
      depositStatus: bookings.depositStatus,
      notes: bookings.notes,
      supplier: suppliers
    })
    .from(bookings)
    .leftJoin(suppliers, eq(bookings.supplierId, suppliers.id));

    return allBookings.map(booking => ({
      ...booking,
      supplier: booking.supplier!
    }));
  }

  async getBookingsByTour(tourId: string): Promise<BookingWithSupplier[]> {
    const tourBookings = await db.select({
      id: bookings.id,
      tourId: bookings.tourId,
      supplierId: bookings.supplierId,
      serviceDesc: bookings.serviceDesc,
      checkIn: bookings.checkIn,
      checkOut: bookings.checkOut,
      pax: bookings.pax,
      confirmationNo: bookings.confirmationNo,
      depositStatus: bookings.depositStatus,
      notes: bookings.notes,
      supplier: suppliers
    })
    .from(bookings)
    .leftJoin(suppliers, eq(bookings.supplierId, suppliers.id))
    .where(eq(bookings.tourId, tourId));

    return tourBookings.map(booking => ({
      ...booking,
      supplier: booking.supplier!
    }));
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const result = await db.insert(bookings).values(insertBooking).returning();
    return result[0];
  }

  async updateBooking(id: string, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const result = await db.update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteBooking(id: string): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id)).returning();
    return result.length > 0;
  }

  // Guides
  async getGuides(): Promise<Guide[]> {
    return await db.select().from(guides);
  }

  async createGuide(insertGuide: InsertGuide): Promise<Guide> {
    const result = await db.insert(guides).values(insertGuide).returning();
    return result[0];
  }
}