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

// Agents table for tour operations
export const agents = pgTable("agents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person"),
  email: text("email"),
  phone: text("phone"),
  country: text("country"),
  region: text("region"),
  commissionRate: numeric("commission_rate").default("0.00"),
  paymentTerms: text("payment_terms"),
  isActive: text("is_active").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tour Categories
export const tourCategories = pgTable("tour_categories", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  isActive: text("is_active").default("true"),
});

// Quotes table
export const quotes = pgTable("quotes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteNumber: text("quote_number").notNull().unique(),
  tourId: uuid("tour_id").references(() => tours.id),
  agentId: uuid("agent_id").references(() => agents.id),
  quoteDate: date("quote_date").notNull(),
  validUntil: date("valid_until"),
  status: text("status").notNull().default("draft"), // draft, sent, accepted, declined, expired
  totalAmount: numeric("total_amount"),
  currency: text("currency").default("ZAR"),
  exchangeRate: numeric("exchange_rate"),
  followUpDate: date("follow_up_date"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Quote Items table
export const quoteItems = pgTable("quote_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  quoteId: uuid("quote_id").references(() => quotes.id).notNull(),
  dayNumber: integer("day_number"),
  serviceType: text("service_type").notNull(), // accommodation, activity, transport, meal, park_fee, other
  serviceName: text("service_name").notNull(),
  supplier: text("supplier"),
  description: text("description"),
  unitPrice: numeric("unit_price"),
  quantity: integer("quantity").default(1),
  totalPrice: numeric("total_price"),
  isIncluded: text("is_included").default("true"),
  notes: text("notes"),
});

// Overnight Lists table
export const overnightLists = pgTable("overnight_lists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  dayNumber: integer("day_number").notNull(),
  date: date("date"),
  location: text("location"),
  accommodation: text("accommodation"),
  accommodationType: text("accommodation_type"), // camping, dorm, twin, single, family, luxury
  paxCount: integer("pax_count"),
  roomConfiguration: text("room_configuration"),
  mealsBreakfast: text("meals_breakfast"), // x, 0, 1
  mealsLunch: text("meals_lunch"), // x, 0, 1
  mealsDinner: text("meals_dinner"), // x, 0, 1
  activities: text("activities"),
  supplier: text("supplier"),
  bookingReference: text("booking_reference"),
  status: text("status").default("provisional"), // provisional, confirmed, waitlisted, alternative, cancelled
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking Checklists table
export const bookingChecklists = pgTable("booking_checklists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  checklistType: text("checklist_type").notNull(), // pre_tour, during_tour, post_tour, booking, payment, supplier
  itemName: text("item_name").notNull(),
  isCompleted: text("is_completed").default("false"),
  completedBy: uuid("completed_by"),
  completedAt: timestamp("completed_at"),
  dueDate: date("due_date"),
  priority: text("priority").default("medium"), // low, medium, high, critical
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoices table
export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: text("invoice_number").notNull().unique(),
  tourId: uuid("tour_id").references(() => tours.id),
  agentId: uuid("agent_id").references(() => agents.id),
  invoiceDate: date("invoice_date").notNull(),
  dueDate: date("due_date").notNull(),
  totalAmount: numeric("total_amount").notNull(),
  currency: text("currency").default("ZAR"),
  exchangeRate: numeric("exchange_rate"),
  status: text("status").default("pending"), // pending, paid, overdue, cancelled
  paymentDate: date("payment_date"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Invoice Items table
export const invoiceItems = pgTable("invoice_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid("invoice_id").references(() => invoices.id).notNull(),
  description: text("description").notNull(),
  quantity: integer("quantity").default(1),
  unitPrice: numeric("unit_price"),
  totalPrice: numeric("total_price"),
  notes: text("notes"),
});

// Tour Crew table
export const tourCrew = pgTable("tour_crew", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  crewType: text("crew_type").notNull(), // driver, guide, cook, camp_assistant
  name: text("name"),
  phone: text("phone"),
  email: text("email"),
  isConfirmed: text("is_confirmed").default("false"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tour Equipment table
export const tourEquipment = pgTable("tour_equipment", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  equipmentType: text("equipment_type"),
  equipmentName: text("equipment_name"),
  quantity: integer("quantity").default(1),
  isRequired: text("is_required").default("true"),
  isAvailable: text("is_available").default("false"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tour Manuals table
export const tourManuals = pgTable("tour_manuals", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  tourCode: text("tour_code").notNull(),
  departureReference: text("departure_reference").notNull(),
  clientCount: integer("client_count").notNull(),
  crewCount: integer("crew_count").notNull(),
  roomingConfig: text("rooming_config"), // e.g., "3x Double, 2x Twin, 3x Single, 1x Twin (Nomad Crew)"
  generalNotes: text("general_notes"),
  includedServices: text("included_services"),
  includedActivities: text("included_activities"),
  notIncluded: text("not_included"),
  borderCrossings: text("border_crossings"),
  supplierReferences: text("supplier_references"), // JSON string of supplier refs
  createdAt: timestamp("created_at").defaultNow(),
});

// Rooming Lists table
export const roomingLists = pgTable("rooming_lists", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  roomNumber: text("room_number").notNull(),
  roomType: text("room_type").notNull(), // Double, Twin, Single, Crew Twin
  clientName: text("client_name").notNull(),
  bookingReference: text("booking_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Flight Details table
export const flightDetails = pgTable("flight_details", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  flightNumber: text("flight_number").notNull(),
  arrivalDate: date("arrival_date").notNull(),
  arrivalTime: text("arrival_time").notNull(),
  totalPassengers: integer("total_passengers").notNull(),
  passengers: text("passengers"), // JSON string of passenger details
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Client Confirmations table (tracks client/agent confirmations)
export const clientConfirmations = pgTable("client_confirmations", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  clientType: text("client_type").notNull(), // direct_client, travel_agent
  clientId: uuid("client_id"), // Reference to client or agent
  confirmationType: text("confirmation_type").notNull(), // provisional, final
  confirmationDate: date("confirmation_date").notNull(),
  depositAmount: numeric("deposit_amount"),
  depositPaid: text("deposit_paid").default("false"),
  depositDate: date("deposit_date"),
  finalPaymentAmount: numeric("final_payment_amount"),
  finalPaymentPaid: text("final_payment_paid").default("false"),
  finalPaymentDate: date("final_payment_date"),
  paymentMethod: text("payment_method"),
  paymentReference: text("payment_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Supplier Notifications table (tracks notifications sent to suppliers)
export const supplierNotifications = pgTable("supplier_notifications", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  notificationType: text("notification_type").notNull(), // provisional_booking, final_confirmation, release
  clientConfirmationId: uuid("client_confirmation_id").references(() => clientConfirmations.id),
  sentDate: timestamp("sent_date").notNull(),
  emailSubject: text("email_subject"),
  emailBody: text("email_body"),
  status: text("status").default("sent"), // sent, delivered, failed
  responseReceived: text("response_received").default("false"),
  responseDate: timestamp("response_date"),
  confirmationNumber: text("confirmation_number"),
  responseNotes: text("response_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking Requests table (provisional bookings sent to suppliers)
export const bookingRequests = pgTable("booking_requests", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  supplierId: uuid("supplier_id").references(() => suppliers.id).notNull(),
  accommodationId: uuid("accommodation_id"), // Reference to specific accommodation
  clientConfirmationId: uuid("client_confirmation_id").references(() => clientConfirmations.id),
  requestDate: date("request_date").notNull(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  paxCount: integer("pax_count").notNull(),
  roomType: text("room_type"),
  roomConfiguration: text("room_configuration"), // e.g., "2x Double, 1x Twin"
  mealPlan: text("meal_plan"), // BB, HB, FB, etc.
  specialRequests: text("special_requests"),
  status: text("status").default("pending"), // pending, confirmed, declined, cancelled
  confirmationNumber: text("confirmation_number"),
  responseDate: date("response_date"),
  responseNotes: text("response_notes"),
  emailSent: text("email_sent").default("false"),
  emailSentDate: timestamp("email_sent_date"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tour Codes table
export const tourCodes = pgTable("tour_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  tourId: uuid("tour_id").references(() => tours.id).notNull(),
  code: text("code").notNull().unique(), // e.g., "ZZK250828R"
  type: text("type").notNull(), // FIT, Group, Charter
  status: text("status").default("provisional"), // provisional, confirmed, released, cancelled
  assignedDate: date("assigned_date").notNull(),
  releasedDate: date("released_date"),
  accountingReference: text("accounting_reference"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Email Templates table
export const emailTemplates = pgTable("email_templates", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // booking_request, confirmation, release
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  variables: text("variables"), // JSON string of available variables
  isActive: text("is_active").default("true"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Booking Status History table
export const bookingStatusHistory = pgTable("booking_status_history", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingRequestId: uuid("booking_request_id").references(() => bookingRequests.id).notNull(),
  status: text("status").notNull(),
  changedBy: text("changed_by"),
  changedAt: timestamp("changed_at").defaultNow(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertSupplierSchema = createInsertSchema(suppliers).omit({
  id: true,
  createdAt: true,
}).extend({
  contactName: z.string().optional(),
  contactEmail: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  rateSheetUrl: z.string().optional(),
});

export const insertRateSchema = createInsertSchema(rates).omit({
  id: true,
});

export const insertTourSchema = createInsertSchema(tours).omit({
  id: true,
  createdAt: true,
}).extend({
  depositDue: z.string().optional(),
  releaseDate: z.string().optional(),
  finalPayment: z.string().optional(),
  notes: z.string().optional(),
  excelQuoteUrl: z.string().optional(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
}).extend({
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  confirmationNo: z.string().optional(),
  notes: z.string().optional(),
});

export const insertGuideSchema = createInsertSchema(guides).omit({
  id: true,
});

// New insert schemas for tour operations
export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
}).extend({
  contactPerson: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  country: z.string().optional(),
  region: z.string().optional(),
  commissionRate: z.string().optional(),
  paymentTerms: z.string().optional(),
  isActive: z.string().optional(),
});

export const insertTourCategorySchema = createInsertSchema(tourCategories).omit({
  id: true,
}).extend({
  description: z.string().optional(),
  isActive: z.string().optional(),
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
}).extend({
  tourId: z.string().optional(),
  agentId: z.string().optional(),
  validUntil: z.string().optional(),
  totalAmount: z.string().optional(),
  exchangeRate: z.string().optional(),
  followUpDate: z.string().optional(),
  notes: z.string().optional(),
});

export const insertQuoteItemSchema = createInsertSchema(quoteItems).omit({
  id: true,
}).extend({
  dayNumber: z.number().optional(),
  supplier: z.string().optional(),
  description: z.string().optional(),
  unitPrice: z.string().optional(),
  quantity: z.number().optional(),
  totalPrice: z.string().optional(),
  isIncluded: z.string().optional(),
  notes: z.string().optional(),
});

export const insertOvernightListSchema = createInsertSchema(overnightLists).omit({
  id: true,
  createdAt: true,
}).extend({
  date: z.string().optional(),
  location: z.string().optional(),
  accommodation: z.string().optional(),
  accommodationType: z.string().optional(),
  paxCount: z.number().optional(),
  roomConfiguration: z.string().optional(),
  mealsBreakfast: z.string().optional(),
  mealsLunch: z.string().optional(),
  mealsDinner: z.string().optional(),
  activities: z.string().optional(),
  supplier: z.string().optional(),
  bookingReference: z.string().optional(),
  notes: z.string().optional(),
});

export const insertBookingChecklistSchema = createInsertSchema(bookingChecklists).omit({
  id: true,
  createdAt: true,
}).extend({
  completedBy: z.string().optional(),
  completedAt: z.string().optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
}).extend({
  tourId: z.string().optional(),
  agentId: z.string().optional(),
  exchangeRate: z.string().optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.string().optional(),
  paymentReference: z.string().optional(),
  notes: z.string().optional(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).omit({
  id: true,
}).extend({
  quantity: z.number().optional(),
  unitPrice: z.string().optional(),
  totalPrice: z.string().optional(),
  notes: z.string().optional(),
});

export const insertTourCrewSchema = createInsertSchema(tourCrew).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  isConfirmed: z.string().optional(),
  notes: z.string().optional(),
});

export const insertTourEquipmentSchema = createInsertSchema(tourEquipment).omit({
  id: true,
  createdAt: true,
}).extend({
  equipmentType: z.string().optional(),
  equipmentName: z.string().optional(),
  quantity: z.number().optional(),
  isRequired: z.string().optional(),
  isAvailable: z.string().optional(),
  notes: z.string().optional(),
});

export const insertClientConfirmationSchema = createInsertSchema(clientConfirmations).omit({
  id: true,
  createdAt: true,
});

export const insertSupplierNotificationSchema = createInsertSchema(supplierNotifications).omit({
  id: true,
  createdAt: true,
});

export const insertBookingRequestSchema = createInsertSchema(bookingRequests).omit({
  id: true,
  createdAt: true,
});

export const insertTourCodeSchema = createInsertSchema(tourCodes).omit({
  id: true,
  createdAt: true,
});

export const insertEmailTemplateSchema = createInsertSchema(emailTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertBookingStatusHistorySchema = createInsertSchema(bookingStatusHistory).omit({
  id: true,
  createdAt: true,
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

// New types for tour operations
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;

export type InsertTourCategory = z.infer<typeof insertTourCategorySchema>;
export type TourCategory = typeof tourCategories.$inferSelect;

export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;

export type InsertQuoteItem = z.infer<typeof insertQuoteItemSchema>;
export type QuoteItem = typeof quoteItems.$inferSelect;

export type InsertOvernightList = z.infer<typeof insertOvernightListSchema>;
export type OvernightList = typeof overnightLists.$inferSelect;

export type InsertBookingChecklist = z.infer<typeof insertBookingChecklistSchema>;
export type BookingChecklist = typeof bookingChecklists.$inferSelect;

export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;

export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;
export type InvoiceItem = typeof invoiceItems.$inferSelect;

export type InsertTourCrew = z.infer<typeof insertTourCrewSchema>;
export type TourCrew = typeof tourCrew.$inferSelect;

export type InsertTourEquipment = z.infer<typeof insertTourEquipmentSchema>;
export type TourEquipment = typeof tourEquipment.$inferSelect;

export type InsertClientConfirmation = z.infer<typeof insertClientConfirmationSchema>;
export type ClientConfirmation = typeof clientConfirmations.$inferSelect;

export type InsertSupplierNotification = z.infer<typeof insertSupplierNotificationSchema>;
export type SupplierNotification = typeof supplierNotifications.$inferSelect;

export type InsertBookingRequest = z.infer<typeof insertBookingRequestSchema>;
export type BookingRequest = typeof bookingRequests.$inferSelect;

export type InsertTourCode = z.infer<typeof insertTourCodeSchema>;
export type TourCode = typeof tourCodes.$inferSelect;

export type InsertEmailTemplate = z.infer<typeof insertEmailTemplateSchema>;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

export type InsertBookingStatusHistory = z.infer<typeof insertBookingStatusHistorySchema>;
export type BookingStatusHistory = typeof bookingStatusHistory.$inferSelect;

// Extended types for joined data
export type QuoteWithItems = Quote & {
  items?: QuoteItem[];
  tour?: Tour;
  agent?: Agent;
};

export type TourWithOperations = Tour & {
  quotes?: Quote[];
  overnightLists?: OvernightList[];
  checklists?: BookingChecklist[];
  invoices?: Invoice[];
  crew?: TourCrew[];
  equipment?: TourEquipment[];
  bookings?: (Booking & { supplier: Supplier })[];
};

export type OvernightListWithTour = OvernightList & {
  tour?: Tour;
};

export type BookingChecklistWithTour = BookingChecklist & {
  tour?: Tour;
};

export type InvoiceWithItems = Invoice & {
  items?: InvoiceItem[];
  tour?: Tour;
  agent?: Agent;
};
