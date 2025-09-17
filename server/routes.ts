import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSupplierSchema,
  insertRateSchema,
  insertTourSchema,
  insertBookingSchema,
  insertGuideSchema,
  insertAgentSchema,
  insertQuoteSchema,
  insertQuoteItemSchema,
  insertOvernightListSchema,
  insertBookingChecklistSchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertTourCrewSchema,
  insertTourEquipmentSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Suppliers routes
  app.get("/api/suppliers", async (req, res) => {
    try {
      const suppliers = await storage.getSuppliers();
      res.json(suppliers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch suppliers" });
    }
  });

  app.get("/api/suppliers/:id", async (req, res) => {
    try {
      const supplier = await storage.getSupplier(req.params.id);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch supplier" });
    }
  });

  app.post("/api/suppliers", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.parse(req.body);
      const supplier = await storage.createSupplier(validatedData);
      res.status(201).json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.patch("/api/suppliers/:id", async (req, res) => {
    try {
      const validatedData = insertSupplierSchema.partial().parse(req.body);
      const supplier = await storage.updateSupplier(req.params.id, validatedData);
      if (!supplier) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.json(supplier);
    } catch (error) {
      res.status(400).json({ message: "Invalid supplier data" });
    }
  });

  app.delete("/api/suppliers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSupplier(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Supplier not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete supplier" });
    }
  });

  // Rates routes
  app.get("/api/rates", async (req, res) => {
    try {
      const rates = await storage.getAllRates();
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rates" });
    }
  });

  app.get("/api/suppliers/:supplierId/rates", async (req, res) => {
    try {
      const rates = await storage.getRatesBySupplier(req.params.supplierId);
      res.json(rates);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rates" });
    }
  });

  app.post("/api/rates", async (req, res) => {
    try {
      const validatedData = insertRateSchema.parse(req.body);
      const rate = await storage.createRate(validatedData);
      res.status(201).json(rate);
    } catch (error) {
      res.status(400).json({ message: "Invalid rate data" });
    }
  });

  app.patch("/api/rates/:id", async (req, res) => {
    try {
      const validatedData = insertRateSchema.partial().parse(req.body);
      const rate = await storage.updateRate(req.params.id, validatedData);
      if (!rate) {
        return res.status(404).json({ message: "Rate not found" });
      }
      res.json(rate);
    } catch (error) {
      res.status(400).json({ message: "Invalid rate data" });
    }
  });

  app.delete("/api/rates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteRate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Rate not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete rate" });
    }
  });

  // Tours routes
  app.get("/api/tours", async (req, res) => {
    try {
      const tours = await storage.getTours();
      res.json(tours);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tours" });
    }
  });

  app.get("/api/tours/:id", async (req, res) => {
    try {
      const tour = await storage.getTour(req.params.id);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tour" });
    }
  });

  app.post("/api/tours", async (req, res) => {
    try {
      const validatedData = insertTourSchema.parse(req.body);
      const tour = await storage.createTour(validatedData);
      res.status(201).json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  app.patch("/api/tours/:id", async (req, res) => {
    try {
      const validatedData = insertTourSchema.partial().parse(req.body);
      const tour = await storage.updateTour(req.params.id, validatedData);
      if (!tour) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.json(tour);
    } catch (error) {
      res.status(400).json({ message: "Invalid tour data" });
    }
  });

  app.delete("/api/tours/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTour(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Tour not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete tour" });
    }
  });

  // Bookings routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.get("/api/tours/:tourId/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookingsByTour(req.params.tourId);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tour bookings" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(req.params.id, validatedData);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking data" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  // Guides routes
  app.get("/api/guides", async (req, res) => {
    try {
      const guides = await storage.getGuides();
      res.json(guides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch guides" });
    }
  });

  app.post("/api/guides", async (req, res) => {
    try {
      const validatedData = insertGuideSchema.parse(req.body);
      const guide = await storage.createGuide(validatedData);
      res.status(201).json(guide);
    } catch (error) {
      res.status(400).json({ message: "Invalid guide data" });
    }
  });

  // Agents routes
  app.get("/api/agents", async (req, res) => {
    try {
      const agents = await storage.getAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  app.get("/api/agents/:id", async (req, res) => {
    try {
      const agent = await storage.getAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  app.post("/api/agents", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.parse(req.body);
      const agent = await storage.createAgent(validatedData);
      res.status(201).json(agent);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent data" });
    }
  });

  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const validatedData = insertAgentSchema.partial().parse(req.body);
      const agent = await storage.updateAgent(req.params.id, validatedData);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(400).json({ message: "Invalid agent data" });
    }
  });

  // Quotes routes
  app.get("/api/quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuotes();
      res.json(quotes);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quotes" });
    }
  });

  app.get("/api/quotes/:id", async (req, res) => {
    try {
      const quote = await storage.getQuote(req.params.id);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote" });
    }
  });

  app.post("/api/quotes", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.parse(req.body);
      const quote = await storage.createQuote(validatedData);
      res.status(201).json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  app.patch("/api/quotes/:id", async (req, res) => {
    try {
      const validatedData = insertQuoteSchema.partial().parse(req.body);
      const quote = await storage.updateQuote(req.params.id, validatedData);
      if (!quote) {
        return res.status(404).json({ message: "Quote not found" });
      }
      res.json(quote);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote data" });
    }
  });

  // Quote Items routes
  app.get("/api/quotes/:quoteId/items", async (req, res) => {
    try {
      const items = await storage.getQuoteItems(req.params.quoteId);
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch quote items" });
    }
  });

  app.post("/api/quotes/:quoteId/items", async (req, res) => {
    try {
      const validatedData = insertQuoteItemSchema.parse({
        ...req.body,
        quoteId: req.params.quoteId
      });
      const item = await storage.createQuoteItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote item data" });
    }
  });

  app.patch("/api/quote-items/:id", async (req, res) => {
    try {
      const validatedData = insertQuoteItemSchema.partial().parse(req.body);
      const item = await storage.updateQuoteItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Quote item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: "Invalid quote item data" });
    }
  });

  app.delete("/api/quote-items/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteQuoteItem(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Quote item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete quote item" });
    }
  });

  // Overnight Lists routes
  app.get("/api/tours/:tourId/overnight-lists", async (req, res) => {
    try {
      const lists = await storage.getOvernightLists(req.params.tourId);
      res.json(lists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch overnight lists" });
    }
  });

  app.post("/api/tours/:tourId/overnight-lists", async (req, res) => {
    try {
      const validatedData = insertOvernightListSchema.parse({
        ...req.body,
        tourId: req.params.tourId
      });
      const list = await storage.createOvernightList(validatedData);
      res.status(201).json(list);
    } catch (error) {
      res.status(400).json({ message: "Invalid overnight list data" });
    }
  });

  app.patch("/api/overnight-lists/:id", async (req, res) => {
    try {
      const validatedData = insertOvernightListSchema.partial().parse(req.body);
      const list = await storage.updateOvernightList(req.params.id, validatedData);
      if (!list) {
        return res.status(404).json({ message: "Overnight list not found" });
      }
      res.json(list);
    } catch (error) {
      res.status(400).json({ message: "Invalid overnight list data" });
    }
  });

  app.delete("/api/overnight-lists/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOvernightList(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Overnight list not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete overnight list" });
    }
  });

  // Booking Checklists routes
  app.get("/api/tours/:tourId/checklists", async (req, res) => {
    try {
      const checklists = await storage.getBookingChecklists(req.params.tourId);
      res.json(checklists);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch booking checklists" });
    }
  });

  app.post("/api/tours/:tourId/checklists", async (req, res) => {
    try {
      const validatedData = insertBookingChecklistSchema.parse({
        ...req.body,
        tourId: req.params.tourId
      });
      const checklist = await storage.createBookingChecklist(validatedData);
      res.status(201).json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking checklist data" });
    }
  });

  app.patch("/api/booking-checklists/:id", async (req, res) => {
    try {
      const validatedData = insertBookingChecklistSchema.partial().parse(req.body);
      const checklist = await storage.updateBookingChecklist(req.params.id, validatedData);
      if (!checklist) {
        return res.status(404).json({ message: "Booking checklist not found" });
      }
      res.json(checklist);
    } catch (error) {
      res.status(400).json({ message: "Invalid booking checklist data" });
    }
  });

  app.delete("/api/booking-checklists/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBookingChecklist(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Booking checklist not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking checklist" });
    }
  });

  // Invoices routes
  app.get("/api/invoices", async (req, res) => {
    try {
      const invoices = await storage.getInvoices();
      res.json(invoices);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoices" });
    }
  });

  app.get("/api/invoices/:id", async (req, res) => {
    try {
      const invoice = await storage.getInvoice(req.params.id);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch invoice" });
    }
  });

  app.post("/api/invoices", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(validatedData);
      res.status(201).json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  app.patch("/api/invoices/:id", async (req, res) => {
    try {
      const validatedData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(req.params.id, validatedData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      res.status(400).json({ message: "Invalid invoice data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
