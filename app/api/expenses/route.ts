import { NextResponse } from "next/server"
import { drizzleClient as db } from "@/database/client"
import { expenses } from "@/database/schema"
import { eq } from "drizzle-orm"

// Get all expenses
export async function GET(request: Request) {
  try {
    // In a real-world app, we would get the user ID from the session
    // For now, use a hardcoded user ID
    const userId = 1
    
    const allExpenses = await db
      .select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(expenses.date)
      
    return NextResponse.json(allExpenses)
  } catch (error) {
    console.error("Failed to get expenses:", error)
    return NextResponse.json(
      { error: "Failed to get expenses" },
      { status: 500 }
    )
  }
}

// Create a new expense
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Validate the body
    if (!body.amount || !body.vendor || !body.date) {
      return NextResponse.json(
        { message: "Invalid expense data", errors: [{ message: "Missing required fields" }] },
        { status: 400 }
      )
    }
    
    // Hardcoded user ID for now
    const userId = 1
    
    // Create the expense
    const [newExpense] = await db
      .insert(expenses)
      .values({
        ...body,
        userId,
        // Ensure date is a Date object
        date: new Date(body.date),
      })
      .returning()
      
    return NextResponse.json(newExpense, { status: 201 })
  } catch (error) {
    console.error("Failed to create expense:", error)
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 }
    )
  }
}