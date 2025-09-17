import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSupplierSchema,
  insertRateSchema,
  insertTourSchema,
  insertBookingSchema,
  insertGuideSchema
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

  const httpServer = createServer(app);
  return httpServer;
}
