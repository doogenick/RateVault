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

export interface IStorage {
  // Suppliers
  getSuppliers(): Promise<Supplier[]>;
  getSupplier(id: string): Promise<SupplierWithRates | undefined>;
  createSupplier(supplier: InsertSupplier): Promise<Supplier>;
  updateSupplier(id: string, supplier: Partial<InsertSupplier>): Promise<Supplier | undefined>;
  deleteSupplier(id: string): Promise<boolean>;

  // Rates
  getAllRates(): Promise<Rate[]>;
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

  // Agents
  getAgents(): Promise<Agent[]>;
  getAgent(id: string): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: string, agent: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: string): Promise<boolean>;

  // Quotes
  getQuotes(): Promise<Quote[]>;
  getQuote(id: string): Promise<QuoteWithItems | undefined>;
  createQuote(quote: InsertQuote): Promise<Quote>;
  updateQuote(id: string, quote: Partial<InsertQuote>): Promise<Quote | undefined>;
  deleteQuote(id: string): Promise<boolean>;

  // Quote Items
  getQuoteItems(quoteId: string): Promise<QuoteItem[]>;
  createQuoteItem(item: InsertQuoteItem): Promise<QuoteItem>;
  updateQuoteItem(id: string, item: Partial<InsertQuoteItem>): Promise<QuoteItem | undefined>;
  deleteQuoteItem(id: string): Promise<boolean>;

  // Overnight Lists
  getOvernightLists(tourId: string): Promise<OvernightList[]>;
  createOvernightList(list: InsertOvernightList): Promise<OvernightList>;
  updateOvernightList(id: string, list: Partial<InsertOvernightList>): Promise<OvernightList | undefined>;
  deleteOvernightList(id: string): Promise<boolean>;

  // Booking Checklists
  getBookingChecklists(tourId: string): Promise<BookingChecklist[]>;
  createBookingChecklist(checklist: InsertBookingChecklist): Promise<BookingChecklist>;
  updateBookingChecklist(id: string, checklist: Partial<InsertBookingChecklist>): Promise<BookingChecklist | undefined>;
  deleteBookingChecklist(id: string): Promise<boolean>;

  // Invoices
  getInvoices(): Promise<Invoice[]>;
  getInvoice(id: string): Promise<InvoiceWithItems | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: string, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: string): Promise<boolean>;

  // Invoice Items
  getInvoiceItems(invoiceId: string): Promise<InvoiceItem[]>;
  createInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: string, item: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: string): Promise<boolean>;

  // Tour Crew
  getTourCrew(tourId: string): Promise<TourCrew[]>;
  createTourCrew(crew: InsertTourCrew): Promise<TourCrew>;
  updateTourCrew(id: string, crew: Partial<InsertTourCrew>): Promise<TourCrew | undefined>;
  deleteTourCrew(id: string): Promise<boolean>;

  // Tour Equipment
  getTourEquipment(tourId: string): Promise<TourEquipment[]>;
  createTourEquipment(equipment: InsertTourEquipment): Promise<TourEquipment>;
  updateTourEquipment(id: string, equipment: Partial<InsertTourEquipment>): Promise<TourEquipment | undefined>;
  deleteTourEquipment(id: string): Promise<boolean>;
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
