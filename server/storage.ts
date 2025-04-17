import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  expenses, type Expense, type InsertExpense,
  reports, type Report, type InsertReport
} from "@shared/schema";
import { db } from './db';
import { eq, and, gte, sql, inArray } from 'drizzle-orm';

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Expense methods
  getExpenses(userId: number): Promise<Expense[]>;
  getExpenseById(id: number): Promise<Expense | undefined>;
  getExpensesByUserId(userId: number): Promise<Expense[]>;
  getExpensesByCategory(userId: number, categoryId: number): Promise<Expense[]>;
  getBusinessExpenses(userId: number): Promise<Expense[]>;
  getTaxDeductibleExpenses(userId: number): Promise<Expense[]>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Report methods
  getReports(userId: number): Promise<Report[]>;
  getReportById(id: number): Promise<Report | undefined>;
  createReport(report: InsertReport): Promise<Report>;
  
  // Summary methods
  getTodayTotal(userId: number): Promise<number>;
  getMonthlyDeductibleTotal(userId: number): Promise<number>;
  getTaxSavings(userId: number): Promise<number>;
  getCategoryBreakdown(userId: number, businessOnly: boolean): Promise<{categoryId: number, categoryName: string, percentage: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private expenses: Map<number, Expense>;
  private reports: Map<number, Report>;
  private currentUserId: number;
  private currentCategoryId: number;
  private currentExpenseId: number;
  private currentReportId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.expenses = new Map();
    this.reports = new Map();
    this.currentUserId = 1;
    this.currentCategoryId = 1;
    this.currentExpenseId = 1;
    this.currentReportId = 1;
    
    // Initialize with a demo user
    this.createUser({
      username: "demo",
      password: "password",
      name: "Mike Johnson",
      email: "mike@example.com"
    });
    
    // Initialize with default categories
    this.initCategories();
    
    // Add some sample expenses for the demo user
    this.initExpenses();
  }
  
  private initCategories() {
    const defaultCategories = [
      { name: "Office Supplies", icon: "coffee", color: "#3B82F6" },
      { name: "Software", icon: "laptop", color: "#8B5CF6" },
      { name: "Travel", icon: "car", color: "#10B981" },
      { name: "Meals", icon: "utensils", color: "#F59E0B" },
      { name: "Marketing", icon: "bullhorn", color: "#EF4444" }
    ];
    
    defaultCategories.forEach(cat => {
      this.createCategory(cat as InsertCategory);
    });
  }
  
  private initExpenses() {
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    
    const lastWeek = new Date(now);
    lastWeek.setDate(now.getDate() - 7);
    
    const sampleExpenses = [
      {
        userId: 1,
        amount: 8.50,
        vendor: "Starbucks",
        date: now,
        categoryId: 4,
        notes: "Coffee - Client Meeting",
        isBusinessExpense: true,
        isTaxDeductible: true,
        deductiblePercentage: 100
      },
      {
        userId: 1,
        amount: 52.99,
        vendor: "Adobe Creative Cloud",
        date: yesterday,
        categoryId: 2,
        notes: "Software Subscription",
        isBusinessExpense: true,
        isTaxDeductible: true,
        deductiblePercentage: 100
      },
      {
        userId: 1,
        amount: 12.45,
        vendor: "Chipotle",
        date: yesterday,
        categoryId: 4,
        notes: "Lunch",
        isBusinessExpense: false,
        isTaxDeductible: false,
        deductiblePercentage: 0
      },
      {
        userId: 1,
        amount: 45.32,
        vendor: "Shell Gas Station",
        date: lastWeek,
        categoryId: 3,
        notes: "Fuel",
        isBusinessExpense: true,
        isTaxDeductible: true,
        deductiblePercentage: 75
      },
      {
        userId: 1,
        amount: 124.99,
        vendor: "Office Depot",
        date: lastWeek,
        categoryId: 1,
        notes: "Printer paper and ink",
        isBusinessExpense: true,
        isTaxDeductible: true,
        deductiblePercentage: 100
      }
    ];
    
    sampleExpenses.forEach(exp => {
      this.createExpense(exp as InsertExpense);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }
  
  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }
  
  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const newCategory: Category = { ...category, id };
    this.categories.set(id, newCategory);
    return newCategory;
  }
  
  // Expense methods
  async getExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => expense.userId === userId);
  }
  
  async getExpenseById(id: number): Promise<Expense | undefined> {
    return this.expenses.get(id);
  }
  
  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(expense => expense.userId === userId);
  }
  
  async getExpensesByCategory(userId: number, categoryId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      expense => expense.userId === userId && expense.categoryId === categoryId
    );
  }
  
  async getBusinessExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      expense => expense.userId === userId && expense.isBusinessExpense
    );
  }
  
  async getTaxDeductibleExpenses(userId: number): Promise<Expense[]> {
    return Array.from(this.expenses.values()).filter(
      expense => expense.userId === userId && expense.isTaxDeductible
    );
  }
  
  async createExpense(expense: InsertExpense): Promise<Expense> {
    const id = this.currentExpenseId++;
    const newExpense: Expense = { ...expense, id };
    this.expenses.set(id, newExpense);
    return newExpense;
  }
  
  async updateExpense(id: number, expenseUpdate: Partial<InsertExpense>): Promise<Expense | undefined> {
    const expense = this.expenses.get(id);
    if (!expense) return undefined;
    
    const updatedExpense = { ...expense, ...expenseUpdate };
    this.expenses.set(id, updatedExpense);
    return updatedExpense;
  }
  
  async deleteExpense(id: number): Promise<boolean> {
    return this.expenses.delete(id);
  }
  
  // Report methods
  async getReports(userId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(report => report.userId === userId);
  }
  
  async getReportById(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }
  
  async createReport(report: InsertReport): Promise<Report> {
    const id = this.currentReportId++;
    const newReport: Report = { ...report, id };
    this.reports.set(id, newReport);
    return newReport;
  }
  
  // Summary methods
  async getTodayTotal(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        expenseDate.setHours(0, 0, 0, 0);
        return expense.userId === userId && expenseDate.getTime() === today.getTime();
      })
      .reduce((sum, expense) => sum + expense.amount, 0);
  }
  
  async getMonthlyDeductibleTotal(userId: number): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    return Array.from(this.expenses.values())
      .filter(expense => {
        const expenseDate = new Date(expense.date);
        return expense.userId === userId && 
               expense.isTaxDeductible && 
               expenseDate >= firstDayOfMonth;
      })
      .reduce((sum, expense) => sum + (expense.amount * expense.deductiblePercentage / 100), 0);
  }
  
  async getTaxSavings(userId: number): Promise<number> {
    // For demo purposes, calculate tax savings as 21% of tax deductible expenses
    const deductibleTotal = await this.getMonthlyDeductibleTotal(userId);
    return deductibleTotal * 0.21;
  }
  
  async getCategoryBreakdown(userId: number, businessOnly: boolean): Promise<{categoryId: number, categoryName: string, percentage: number}[]> {
    const userExpenses = Array.from(this.expenses.values()).filter(
      expense => expense.userId === userId && (!businessOnly || expense.isBusinessExpense)
    );
    
    if (userExpenses.length === 0) {
      return [];
    }
    
    // Group expenses by category
    const expensesByCategory = userExpenses.reduce<Record<number, number>>((acc, expense) => {
      const categoryId = expense.categoryId || 0;
      if (!acc[categoryId]) {
        acc[categoryId] = 0;
      }
      acc[categoryId] += expense.amount;
      return acc;
    }, {});
    
    // Calculate total
    const totalAmount = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    
    // Calculate percentage for each category
    const result = await Promise.all(
      Object.entries(expensesByCategory).map(async ([categoryIdStr, amount]) => {
        const categoryId = parseInt(categoryIdStr);
        const category = await this.getCategoryById(categoryId);
        return {
          categoryId,
          categoryName: category?.name || "Uncategorized",
          percentage: Math.round((amount / totalAmount) * 100)
        };
      })
    );
    
    // Sort by percentage (descending)
    return result.sort((a, b) => b.percentage - a.percentage);
  }
}

// DatabaseStorage 实现

// DatabaseStorage 实现
export class DatabaseStorage implements IStorage {
  // 用户方法
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // 分类方法
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // 支出方法
  async getExpenses(userId: number): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.userId, userId));
  }

  async getExpenseById(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async getExpensesByUserId(userId: number): Promise<Expense[]> {
    return await db.select().from(expenses).where(eq(expenses.userId, userId));
  }

  async getExpensesByCategory(userId: number, categoryId: number): Promise<Expense[]> {
    return await db.select().from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        eq(expenses.categoryId, categoryId)
      ));
  }

  async getBusinessExpenses(userId: number): Promise<Expense[]> {
    return await db.select().from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        eq(expenses.isBusinessExpense, true)
      ));
  }

  async getTaxDeductibleExpenses(userId: number): Promise<Expense[]> {
    return await db.select().from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        eq(expenses.isTaxDeductible, true)
      ));
  }

  async createExpense(expense: InsertExpense): Promise<Expense> {
    const [newExpense] = await db.insert(expenses).values(expense).returning();
    return newExpense;
  }

  async updateExpense(id: number, expenseUpdate: Partial<InsertExpense>): Promise<Expense | undefined> {
    const [updatedExpense] = await db.update(expenses)
      .set(expenseUpdate)
      .where(eq(expenses.id, id))
      .returning();
    return updatedExpense || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return result !== null;
  }

  // 报告方法
  async getReports(userId: number): Promise<Report[]> {
    return await db.select().from(reports).where(eq(reports.userId, userId));
  }

  async getReportById(id: number): Promise<Report | undefined> {
    const [report] = await db.select().from(reports).where(eq(reports.id, id));
    return report || undefined;
  }

  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db.insert(reports).values(report).returning();
    return newReport;
  }

  // 汇总方法
  async getTodayTotal(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const result = await db.select({
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      gte(expenses.date, today)
    ));
    
    return result[0]?.total || 0;
  }

  async getMonthlyDeductibleTotal(userId: number): Promise<number> {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const result = await db.select({
      total: sql<number>`sum(${expenses.amount} * ${expenses.deductiblePercentage} / 100)`
    })
    .from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      eq(expenses.isTaxDeductible, true),
      gte(expenses.date, firstDayOfMonth)
    ));
    
    return result[0]?.total || 0;
  }

  async getTaxSavings(userId: number): Promise<number> {
    const taxRate = 0.21; // 假设21%的税率
    
    const result = await db.select({
      total: sql<number>`sum(${expenses.amount} * ${expenses.deductiblePercentage} / 100 * ${taxRate})`
    })
    .from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      eq(expenses.isTaxDeductible, true)
    ));
    
    return result[0]?.total || 0;
  }

  async getCategoryBreakdown(userId: number, businessOnly: boolean): Promise<{categoryId: number, categoryName: string, percentage: number}[]> {
    // 首先获取总金额
    const totalResult = await db.select({
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(
      businessOnly 
        ? and(eq(expenses.userId, userId), eq(expenses.isBusinessExpense, true))
        : eq(expenses.userId, userId)
    );
    
    const total = totalResult[0]?.total || 0;
    
    if (total === 0) {
      return [];
    }
    
    // 获取每个分类的总额和百分比
    const query = db.select({
      categoryId: expenses.categoryId,
      categoryAmount: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(
      businessOnly 
        ? and(eq(expenses.userId, userId), eq(expenses.isBusinessExpense, true))
        : eq(expenses.userId, userId)
    )
    .groupBy(expenses.categoryId);
    
    const categoryAmounts = await query;
    
    // 获取分类名称
    const categoryIds = categoryAmounts.map(item => item.categoryId).filter(id => id !== null) as number[];
    const categoryData = categoryIds.length > 0
      ? await db.select().from(categories).where(inArray(categories.id, categoryIds))
      : [];
    
    // 转换数据格式
    return categoryAmounts.map(item => {
      const category = categoryData.find(c => c.id === item.categoryId);
      const percentage = (item.categoryAmount / total) * 100;
      
      return {
        categoryId: item.categoryId || 0,
        categoryName: category?.name || 'Uncategorized',
        percentage: Math.round(percentage * 100) / 100
      };
    });
  }
}

export const storage = new DatabaseStorage();
