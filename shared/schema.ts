import { sql } from "drizzle-orm";
import { pgTable, text, varchar, uuid, date, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Suppliers table
export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  region: text("region").notNull(),
  serviceType: text("service_type").notNull(),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  phone: text("phone"),
  notes: text("notes"),
  rateSheetUrl: text("rate_sheet_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Rates table
export const rates = pgTable("rates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  season: text("season").notNull(),
  validFrom: date("valid_from").notNull(),
  validTo: date("valid_to").notNull(),
  roomType: text("room_type"),
  boardBasis: text("board_basis"),
  pricePerPerson: numeric("price_per_person").notNull(),
  currency: text("currency").notNull(),
  notes: text("notes"),
});

// Tours table
export const tours = pgTable("tours", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientName: text("client_name").notNull(),
  quoteRef: text("quote_ref").notNull(),
  tourType: text("tour_type").notNull(), // 'FIT' or 'Group'
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  status: text("status").notNull(), // 'Quote', 'Provisional', 'Confirmed', 'Cancelled'
  depositDue: date("deposit_due"),
  releaseDate: date("release_date"),
  finalPayment: date("final_payment"),
  notes: text("notes"),
  excelQuoteUrl: text("excel_quote_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Bookings table
export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  serviceDesc: text("service_desc").notNull(),
  checkIn: date("check_in"),
  checkOut: date("check_out"),
  pax: integer("pax").notNull(),
  confirmationNo: text("confirmation_no"),
  depositStatus: text("deposit_status").notNull(), // 'Not Required', 'Pending', 'Paid'
  notes: text("notes"),
});

// Guides table (optional)
export const guides = pgTable("guides", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contact: text("contact"),
  linkedTours: uuid("linked_tours").array(),
});

// Insert schemas
export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
});

export const insertRateSchema = createInsertSchema(rates).omit({
  id: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
});

// Types
export type InsertSupplier = z.infer<typeof insertSupplierSchema>;
export type Supplier = typeof suppliers.$inferSelect;

export type InsertRate = z.infer<typeof insertRateSchema>;
export type Rate = typeof rates.$inferSelect;

export type InsertTour = z.infer<typeof insertTourSchema>;
export type Tour = typeof tours.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertGuide = z.infer<typeof insertGuideSchema>;
export type Guide = typeof guides.$inferSelect;

// Extended types for joined data
export type SupplierWithRates = Supplier & {
  rates?: Rate[];
};

export type TourWithBookings = Tour & {
  bookings?: (Booking & { supplier: Supplier })[];
};

export type BookingWithSupplier = Booking & {
  supplier: Supplier;
};
