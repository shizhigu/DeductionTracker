import { pgTable, serial, varchar, decimal, boolean, timestamp, text } from "drizzle-orm/pg-core"
import { createInsertSchema } from "drizzle-zod"
import { z } from "zod"

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 100 }).notNull(),
  password: varchar("password", { length: 100 }).notNull(),
})

// Categories table
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  icon: varchar("icon", { length: 20 }), // Icon name for display
  color: varchar("color", { length: 20 }), // Color code for display
})

// Expenses table
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  vendor: varchar("vendor", { length: 100 }).notNull(),
  description: text("description"),
  date: timestamp("date").defaultNow().notNull(),
  categoryId: serial("category_id").references(() => categories.id),
  receiptUrl: varchar("receipt_url", { length: 255 }),
  isBusinessExpense: boolean("is_business_expense").default(false).notNull(),
  isTaxDeductible: boolean("is_tax_deductible").default(false).notNull(),
})

// Tax reports table
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: serial("user_id").references(() => users.id).notNull(),
  title: varchar("title", { length: 100 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deductibleAmount: decimal("deductible_amount", { precision: 10, scale: 2 }).notNull(),
  taxSavings: decimal("tax_savings", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})

// Zod schemas for insertions
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  name: true,
  password: true,
})

export const insertCategorySchema = createInsertSchema(categories)

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true, // Auto-generated
})

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true, // Auto-generated
  createdAt: true, // Auto-generated
})

// TypeScript types
export type InsertUser = z.infer<typeof insertUserSchema>
export type User = typeof users.$inferSelect

export type InsertCategory = z.infer<typeof insertCategorySchema>
export type Category = typeof categories.$inferSelect

export type InsertExpense = z.infer<typeof insertExpenseSchema>
export type Expense = typeof expenses.$inferSelect

export type InsertReport = z.infer<typeof insertReportSchema>
export type Report = typeof reports.$inferSelect