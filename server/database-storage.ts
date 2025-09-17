import { eq } from "drizzle-orm";
import { db } from "./db";
import { 
  suppliers, 
  rates, 
  tours, 
  bookings, 
  guides,
  agents,
  quotes,
  quoteItems,
  overnightLists,
  bookingChecklists,
  invoices,
  invoiceItems,
  tourCrew,
  tourEquipment,
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
  type BookingWithSupplier,
  type Agent,
  type InsertAgent,
  type Quote,
  type InsertQuote,
  type QuoteItem,
  type InsertQuoteItem,
  type OvernightList,
  type InsertOvernightList,
  type BookingChecklist,
  type InsertBookingChecklist,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type TourCrew,
  type InsertTourCrew,
  type TourEquipment,
  type InsertTourEquipment,
  type QuoteWithItems,
  type TourWithOperations,
  type OvernightListWithTour,
  type BookingChecklistWithTour,
  type InvoiceWithItems
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
  async getAllRates(): Promise<Rate[]> {
    return await db.select().from(rates);
  }

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

  // Agents
  async getAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: string): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const result = await db.insert(agents).values(insertAgent).returning();
    return result[0];
  }

  async updateAgent(id: string, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
    const result = await db.update(agents)
      .set(updates)
      .where(eq(agents.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteAgent(id: string): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id)).returning();
    return result.length > 0;
  }

  // Quotes
  async getQuotes(): Promise<Quote[]> {
    return await db.select().from(quotes);
  }

  async getQuote(id: string): Promise<QuoteWithItems | undefined> {
    const quote = await db.select().from(quotes).where(eq(quotes.id, id)).limit(1);
    if (quote.length === 0) return undefined;

    const items = await db.select().from(quoteItems).where(eq(quoteItems.quoteId, id));
    return { ...quote[0], items };
  }

  async createQuote(insertQuote: InsertQuote): Promise<Quote> {
    const result = await db.insert(quotes).values(insertQuote).returning();
    return result[0];
  }

  async updateQuote(id: string, updates: Partial<InsertQuote>): Promise<Quote | undefined> {
    const result = await db.update(quotes)
      .set(updates)
      .where(eq(quotes.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteQuote(id: string): Promise<boolean> {
    const result = await db.delete(quotes).where(eq(quotes.id, id)).returning();
    return result.length > 0;
  }

  // Quote Items
  async getQuoteItems(quoteId: string): Promise<QuoteItem[]> {
    return await db.select().from(quoteItems).where(eq(quoteItems.quoteId, quoteId));
  }

  async createQuoteItem(insertItem: InsertQuoteItem): Promise<QuoteItem> {
    const result = await db.insert(quoteItems).values(insertItem).returning();
    return result[0];
  }

  async updateQuoteItem(id: string, updates: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined> {
    const result = await db.update(quoteItems)
      .set(updates)
      .where(eq(quoteItems.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteQuoteItem(id: string): Promise<boolean> {
    const result = await db.delete(quoteItems).where(eq(quoteItems.id, id)).returning();
    return result.length > 0;
  }

  // Overnight Lists
  async getOvernightLists(tourId: string): Promise<OvernightList[]> {
    return await db.select().from(overnightLists)
      .where(eq(overnightLists.tourId, tourId))
      .orderBy(overnightLists.dayNumber);
  }

  async createOvernightList(insertList: InsertOvernightList): Promise<OvernightList> {
    const result = await db.insert(overnightLists).values(insertList).returning();
    return result[0];
  }

  async updateOvernightList(id: string, updates: Partial<InsertOvernightList>): Promise<OvernightList | undefined> {
    const result = await db.update(overnightLists)
      .set(updates)
      .where(eq(overnightLists.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteOvernightList(id: string): Promise<boolean> {
    const result = await db.delete(overnightLists).where(eq(overnightLists.id, id)).returning();
    return result.length > 0;
  }

  // Booking Checklists
  async getBookingChecklists(tourId: string): Promise<BookingChecklist[]> {
    return await db.select().from(bookingChecklists)
      .where(eq(bookingChecklists.tourId, tourId))
      .orderBy(bookingChecklists.priority, bookingChecklists.dueDate);
  }

  async createBookingChecklist(insertChecklist: InsertBookingChecklist): Promise<BookingChecklist> {
    const result = await db.insert(bookingChecklists).values(insertChecklist).returning();
    return result[0];
  }

  async updateBookingChecklist(id: string, updates: Partial<InsertBookingChecklist>): Promise<BookingChecklist | undefined> {
    const result = await db.update(bookingChecklists)
      .set(updates)
      .where(eq(bookingChecklists.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteBookingChecklist(id: string): Promise<boolean> {
    const result = await db.delete(bookingChecklists).where(eq(bookingChecklists.id, id)).returning();
    return result.length > 0;
  }

  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices);
  }

  async getInvoice(id: string): Promise<InvoiceWithItems | undefined> {
    const invoice = await db.select().from(invoices).where(eq(invoices.id, id)).limit(1);
    if (invoice.length === 0) return undefined;

    const items = await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, id));
    return { ...invoice[0], items };
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<Invoice> {
    const result = await db.insert(invoices).values(insertInvoice).returning();
    return result[0];
  }

  async updateInvoice(id: string, updates: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const result = await db.update(invoices)
      .set(updates)
      .where(eq(invoices.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteInvoice(id: string): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id)).returning();
    return result.length > 0;
  }

  // Invoice Items
  async getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }

  async createInvoiceItem(insertItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const result = await db.insert(invoiceItems).values(insertItem).returning();
    return result[0];
  }

  async updateInvoiceItem(id: string, updates: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const result = await db.update(invoiceItems)
      .set(updates)
      .where(eq(invoiceItems.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteInvoiceItem(id: string): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id)).returning();
    return result.length > 0;
  }

  // Tour Crew
  async getTourCrew(tourId: string): Promise<TourCrew[]> {
    return await db.select().from(tourCrew).where(eq(tourCrew.tourId, tourId));
  }

  async createTourCrew(insertCrew: InsertTourCrew): Promise<TourCrew> {
    const result = await db.insert(tourCrew).values(insertCrew).returning();
    return result[0];
  }

  async updateTourCrew(id: string, updates: Partial<InsertTourCrew>): Promise<TourCrew | undefined> {
    const result = await db.update(tourCrew)
      .set(updates)
      .where(eq(tourCrew.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteTourCrew(id: string): Promise<boolean> {
    const result = await db.delete(tourCrew).where(eq(tourCrew.id, id)).returning();
    return result.length > 0;
  }

  // Tour Equipment
  async getTourEquipment(tourId: string): Promise<TourEquipment[]> {
    return await db.select().from(tourEquipment).where(eq(tourEquipment.tourId, tourId));
  }

  async createTourEquipment(insertEquipment: InsertTourEquipment): Promise<TourEquipment> {
    const result = await db.insert(tourEquipment).values(insertEquipment).returning();
    return result[0];
  }

  async updateTourEquipment(id: string, updates: Partial<InsertTourEquipment>): Promise<TourEquipment | undefined> {
    const result = await db.update(tourEquipment)
      .set(updates)
      .where(eq(tourEquipment.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteTourEquipment(id: string): Promise<boolean> {
    const result = await db.delete(tourEquipment).where(eq(tourEquipment.id, id)).returning();
    return result.length > 0;
  }
}