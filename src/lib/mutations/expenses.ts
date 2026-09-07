import { useMutation, useQueryClient } from '@tanstack/react-query'
import { getSupabaseBrowserClient } from '#/lib/supabase/client'
import type { ExpenseInput } from '#/lib/validations/expense'
import type { ExpenseRow } from '#/types/expense'

function toRow(input: ExpenseInput, userId: string) {
  return {
    user_id: userId,
    amount: input.amount,
    description: input.description,
    category: input.category,
    expense_date: input.expenseDate,
    notes: input.notes || null,
  }
}

async function createExpense(input: ExpenseInput): Promise<ExpenseRow> {
  const supabase = getSupabaseBrowserClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Pengeluaran gagal disimpan. Silakan coba lagi.')

  const { data, error } = await supabase
    .from('expenses')
    .insert(toRow(input, user.id))
    .select()
    .single()

  if (error) throw new Error('Pengeluaran gagal disimpan. Silakan coba lagi.')
  return data
}

async function updateExpense(
  id: string,
  input: ExpenseInput,
): Promise<ExpenseRow> {
  const supabase = getSupabaseBrowserClient()
  const { data, error } = await supabase
    .from('expenses')
    .update({
      amount: input.amount,
      description: input.description,
      category: input.category,
      expense_date: input.expenseDate,
      notes: input.notes || null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error('Pengeluaran gagal disimpan. Silakan coba lagi.')
  return data
}

async function deleteExpense(id: string): Promise<void> {
  const supabase = getSupabaseBrowserClient()
  const { error } = await supabase.from('expenses').delete().eq('id', id)
  if (error) throw new Error('Pengeluaran gagal dihapus. Silakan coba lagi.')
}

function useInvalidateExpenseQueries() {
  const queryClient = useQueryClient()
  return () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] })
    queryClient.invalidateQueries({ queryKey: ['expense-summary'] })
    queryClient.invalidateQueries({ queryKey: ['report'] })
  }
}

export function useCreateExpense() {
  const invalidate = useInvalidateExpenseQueries()
  return useMutation({
    mutationFn: createExpense,
    onSuccess: invalidate,
  })
}

export function useUpdateExpense() {
  const invalidate = useInvalidateExpenseQueries()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: ExpenseInput }) =>
      updateExpense(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteExpense() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateExpenseQueries()

  return useMutation({
    mutationFn: deleteExpense,
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ['expenses'] })
      const previous = queryClient.getQueriesData<Array<ExpenseRow>>({
        queryKey: ['expenses'],
      })

      queryClient.setQueriesData<Array<ExpenseRow>>(
        { queryKey: ['expenses'] },
        (old) => (old ? old.filter((expense) => expense.id !== id) : old),
      )

      return { previous }
    },
    onError: (_err, _id, context) => {
      context?.previous.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },
    onSettled: invalidate,
  })
}
