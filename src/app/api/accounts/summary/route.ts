import { prisma } from '@/lib/prisma'
import { requireRole, successResponse, errorResponse } from '@/lib/api-helpers'
import { Role } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { error } = await requireRole(Role.ADMIN)
    if (error) return error

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') ?? String(new Date().getFullYear()))

    // Monthly breakdown
    const months = Array.from({ length: 12 }, (_, i) => {
      const start = new Date(year, i, 1)
      const end = new Date(year, i + 1, 0, 23, 59, 59)
      return { month: i + 1, start, end }
    })

    const monthlyData = await Promise.all(
      months.map(async ({ month, start, end }) => {
        const [incomeAgg, expenseAgg] = await Promise.all([
          prisma.income.aggregate({
            _sum: { amount: true },
            where: { date: { gte: start, lte: end } },
          }),
          prisma.expense.aggregate({
            _sum: { amount: true },
            where: { date: { gte: start, lte: end } },
          }),
        ])

        const income = incomeAgg._sum.amount ?? 0
        const expense = expenseAgg._sum.amount ?? 0

        return { month, income, expense, profit: income - expense }
      })
    )

    // Totals
    const [totalIncomeAgg, totalExpenseAgg] = await Promise.all([
      prisma.income.aggregate({ _sum: { amount: true } }),
      prisma.expense.aggregate({ _sum: { amount: true } }),
    ])

    const totalIncome = totalIncomeAgg._sum.amount ?? 0
    const totalExpense = totalExpenseAgg._sum.amount ?? 0

    // Expense breakdown by category
    const expenseByCategory = await prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      orderBy: { _sum: { amount: 'desc' } },
    })

    return successResponse({
      summary: {
        income: totalIncome,
        expense: totalExpense,
        profit: totalIncome - totalExpense,
      },
      monthly: monthlyData,
      expenseByCategory: expenseByCategory.map(e => ({
        category: e.category,
        amount: e._sum.amount ?? 0,
      })),
    })
  } catch (e) {
    console.error('[GET /api/accounts/summary]', e)
    return errorResponse('Internal server error', 500)
  }
}
