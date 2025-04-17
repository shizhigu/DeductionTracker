import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertReportSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  
  // User routes
  apiRouter.get("/users/me", async (req, res) => {
    try {
      // For demo, always return the demo user
      const user = await storage.getUser(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't send the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Category routes
  apiRouter.get("/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  
  // Expense routes
  apiRouter.get("/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses(1); // For demo, use user ID 1
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });
  
  apiRouter.get("/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });
  
  apiRouter.post("/expenses", async (req, res) => {
    try {
      const expenseData = insertExpenseSchema.parse(req.body);
      const newExpense = await storage.createExpense(expenseData);
      res.status(201).json(newExpense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });
  
  apiRouter.patch("/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const expense = await storage.getExpenseById(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      const updateData = req.body;
      const updatedExpense = await storage.updateExpense(id, updateData);
      res.json(updatedExpense);
    } catch (error) {
      res.status(500).json({ message: "Failed to update expense" });
    }
  });
  
  apiRouter.delete("/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }
      
      const success = await storage.deleteExpense(id);
      if (!success) {
        return res.status(404).json({ message: "Expense not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });
  
  // Reports routes
  apiRouter.get("/reports", async (req, res) => {
    try {
      const reports = await storage.getReports(1); // For demo, use user ID 1
      res.json(reports);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch reports" });
    }
  });
  
  apiRouter.post("/reports", async (req, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      const newReport = await storage.createReport(reportData);
      res.status(201).json(newReport);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid report data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create report" });
    }
  });
  
  // Summary routes
  apiRouter.get("/summary/today", async (req, res) => {
    try {
      const todayTotal = await storage.getTodayTotal(1); // For demo, use user ID 1
      res.json({ total: todayTotal });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate today's total" });
    }
  });
  
  apiRouter.get("/summary/monthly-deductible", async (req, res) => {
    try {
      const monthlyDeductible = await storage.getMonthlyDeductibleTotal(1); // For demo, use user ID 1
      res.json({ total: monthlyDeductible });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate monthly deductible" });
    }
  });
  
  apiRouter.get("/summary/tax-savings", async (req, res) => {
    try {
      const taxSavings = await storage.getTaxSavings(1); // For demo, use user ID 1
      res.json({ total: taxSavings });
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate tax savings" });
    }
  });
  
  apiRouter.get("/summary/category-breakdown", async (req, res) => {
    try {
      const businessOnly = req.query.businessOnly === "true";
      const breakdown = await storage.getCategoryBreakdown(1, businessOnly); // For demo, use user ID 1
      res.json(breakdown);
    } catch (error) {
      res.status(500).json({ message: "Failed to calculate category breakdown" });
    }
  });

  // Prefix all routes with /api
  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
