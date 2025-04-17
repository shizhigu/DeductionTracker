import { db } from './db';
import { users, categories, expenses } from '@shared/schema';

async function initDatabase() {
  try {
    console.log('初始化数据库...');

    // 1. 创建演示用户
    const existingUsers = await db.select().from(users);
    if (existingUsers.length === 0) {
      console.log('添加演示用户...');
      const [user] = await db.insert(users).values({
        username: "demo",
        password: "password",
        name: "Mike Johnson",
        email: "mike@example.com"
      }).returning();
      console.log('已创建用户:', user.id);

      // 2. 添加默认分类
      console.log('添加默认分类...');
      const defaultCategories = [
        { name: "Office Supplies", icon: "coffee", color: "#3B82F6" },
        { name: "Software", icon: "laptop", color: "#8B5CF6" },
        { name: "Travel", icon: "car", color: "#10B981" },
        { name: "Meals", icon: "utensils", color: "#F59E0B" },
        { name: "Marketing", icon: "bullhorn", color: "#EF4444" }
      ];
      
      const createdCategories = await Promise.all(
        defaultCategories.map(async (cat) => {
          const [category] = await db.insert(categories).values(cat).returning();
          return category;
        })
      );
      
      console.log(`已创建 ${createdCategories.length} 个分类`);
      
      // 3. 添加示例支出
      console.log('添加示例支出...');
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const lastWeek = new Date(now);
      lastWeek.setDate(now.getDate() - 7);
      
      const sampleExpenses = [
        {
          userId: user.id,
          amount: 8.50,
          vendor: "Starbucks",
          date: now,
          categoryId: createdCategories[3].id,
          notes: "Coffee - Client Meeting",
          isBusinessExpense: true,
          isTaxDeductible: true,
          deductiblePercentage: 100,
          receiptUrl: null
        },
        {
          userId: user.id,
          amount: 52.99,
          vendor: "Adobe Creative Cloud",
          date: yesterday,
          categoryId: createdCategories[1].id,
          notes: "Software Subscription",
          isBusinessExpense: true,
          isTaxDeductible: true,
          deductiblePercentage: 100,
          receiptUrl: null
        },
        {
          userId: user.id,
          amount: 12.45,
          vendor: "Chipotle",
          date: yesterday,
          categoryId: createdCategories[3].id,
          notes: "Lunch",
          isBusinessExpense: false,
          isTaxDeductible: false,
          deductiblePercentage: 0,
          receiptUrl: null
        },
        {
          userId: user.id,
          amount: 45.32,
          vendor: "Shell Gas Station",
          date: lastWeek,
          categoryId: createdCategories[2].id,
          notes: "Fuel",
          isBusinessExpense: true,
          isTaxDeductible: true,
          deductiblePercentage: 75,
          receiptUrl: null
        },
        {
          userId: user.id,
          amount: 124.99,
          vendor: "Office Depot",
          date: lastWeek,
          categoryId: createdCategories[0].id,
          notes: "Printer paper and ink",
          isBusinessExpense: true,
          isTaxDeductible: true,
          deductiblePercentage: 100,
          receiptUrl: null
        }
      ];
      
      const createdExpenses = await Promise.all(
        sampleExpenses.map(async (exp) => {
          const [expense] = await db.insert(expenses).values(exp).returning();
          return expense;
        })
      );
      
      console.log(`已创建 ${createdExpenses.length} 个支出记录`);
    } else {
      console.log('数据库已经有用户数据，跳过初始化');
    }
    
    console.log('数据库初始化完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
  }
}

export { initDatabase };