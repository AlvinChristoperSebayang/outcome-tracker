import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { z } from 'zod'
import { EmptyState } from '#/components/EmptyState'
import { ErrorState } from '#/components/ErrorState'
import { IncomeDialog } from '#/components/budget/IncomeDialog'
import { PocketFormDialog } from '#/components/budget/PocketFormDialog'
import { PocketList } from '#/components/budget/PocketList'
import { DeletePocketDialog } from '#/components/budget/DeletePocketDialog'
import { DebtFormDialog } from '#/components/debt/DebtFormDialog'
import { DebtList } from '#/components/debt/DebtList'
import { DebtPaymentDialog } from '#/components/debt/DebtPaymentDialog'
import { DeleteDebtDialog } from '#/components/debt/DeleteDebtDialog'
import { MonthSelect } from '#/components/filters/MonthSelect'
import { DeleteWishlistItemDialog } from '#/components/savings/DeleteWishlistItemDialog'
import { TotalSavingsCard } from '#/components/savings/TotalSavingsCard'
import { WishlistFormDialog } from '#/components/savings/WishlistFormDialog'
import { WishlistList } from '#/components/savings/WishlistList'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Skeleton } from '#/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { monthlyBudgetQueryOptions } from '#/lib/queries/budgets'
import { debtsQueryOptions } from '#/lib/queries/debts'
import { savingsSummaryQueryOptions } from '#/lib/queries/savings'
import { wishlistQueryOptions } from '#/lib/queries/wishlist'
import { formatCurrency } from '#/lib/utils/currency'
import { currentMonthValue } from '#/lib/utils/date'
import type { BudgetPocketWithSpending } from '#/types/budget'
import type { DebtWithProgress } from '#/types/debt'
import type { WishlistItemRow } from '#/types/savings'

export const Route = createFileRoute('/_authenticated/anggaran')({
  validateSearch: z.object({ bulan: z.string().optional() }),
  component: AnggaranPage,
})

function AnggaranPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Anggaran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Rencanakan pengeluaran bulanan dan pantau hutang Anda.
        </p>
      </div>

      <Tabs defaultValue="kantong">
        <TabsList>
          <TabsTrigger value="kantong">Kantong Anggaran</TabsTrigger>
          <TabsTrigger value="tabungan">Tabungan</TabsTrigger>
          <TabsTrigger value="hutang">Hutang</TabsTrigger>
        </TabsList>
        <TabsContent value="kantong" className="mt-4">
          <BudgetPocketsTab />
        </TabsContent>
        <TabsContent value="tabungan" className="mt-4">
          <SavingsTab />
        </TabsContent>
        <TabsContent value="hutang" className="mt-4">
          <DebtTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BudgetPocketsTab() {
  const { bulan } = Route.useSearch()
  const navigate = Route.useNavigate()
  const monthValue = bulan ?? currentMonthValue()

  const [incomeDialogOpen, setIncomeDialogOpen] = useState(false)
  const [pocketFormOpen, setPocketFormOpen] = useState(false)
  const [editingPocket, setEditingPocket] = useState<
    BudgetPocketWithSpending | undefined
  >(undefined)
  const [deletingPocket, setDeletingPocket] =
    useState<BudgetPocketWithSpending | null>(null)

  const budgetQuery = useQuery(monthlyBudgetQueryOptions(monthValue))
  const incomeAmount = Number(budgetQuery.data?.budget?.income_amount ?? 0)

  function openCreatePocket() {
    setEditingPocket(undefined)
    setPocketFormOpen(true)
  }

  function openEditPocket(pocket: BudgetPocketWithSpending) {
    setEditingPocket(pocket)
    setPocketFormOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <MonthSelect
          value={monthValue}
          onChange={(value) => navigate({ search: { bulan: value } })}
        />
        <Button onClick={openCreatePocket}>
          <Plus className="h-4 w-4" />
          Tambah Kantong
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Pemasukan Bulan Ini</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIncomeDialogOpen(true)}
          >
            Ubah
          </Button>
        </CardHeader>
        <CardContent>
          {budgetQuery.isPending ? (
            <Skeleton className="h-8 w-40" />
          ) : (
            <p className="text-2xl font-semibold tracking-tight">
              {formatCurrency(incomeAmount)}
            </p>
          )}
          {budgetQuery.data && budgetQuery.data.pockets.length > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              Teralokasikan {formatCurrency(budgetQuery.data.totalAllocated)} ·
              Belum dialokasikan{' '}
              {formatCurrency(
                Math.max(incomeAmount - budgetQuery.data.totalAllocated, 0),
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {budgetQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : budgetQuery.isError ? (
        <ErrorState onRetry={() => budgetQuery.refetch()} />
      ) : budgetQuery.data.pockets.length === 0 ? (
        <EmptyState
          title="Belum ada kantong anggaran"
          description="Buat kantong anggaran untuk mengontrol pengeluaran per kebutuhan setiap bulan, misalnya Kebutuhan Sehari-hari atau Tabungan."
          actionLabel="Tambah Kantong"
          onAction={openCreatePocket}
        />
      ) : (
        <PocketList
          pockets={budgetQuery.data.pockets}
          onEdit={openEditPocket}
          onDelete={setDeletingPocket}
        />
      )}

      <PocketFormDialog
        open={pocketFormOpen}
        onOpenChange={setPocketFormOpen}
        monthValue={monthValue}
        incomeAmount={incomeAmount}
        pocket={editingPocket}
      />
      <IncomeDialog
        open={incomeDialogOpen}
        onOpenChange={setIncomeDialogOpen}
        monthValue={monthValue}
        currentIncome={incomeAmount}
      />
      <DeletePocketDialog
        pocket={deletingPocket}
        monthValue={monthValue}
        onOpenChange={(open) => !open && setDeletingPocket(null)}
      />
    </div>
  )
}

function SavingsTab() {
  const monthValue = currentMonthValue()

  const [pocketFormOpen, setPocketFormOpen] = useState(false)
  const [wishlistFormOpen, setWishlistFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<WishlistItemRow | undefined>(
    undefined,
  )
  const [deletingItem, setDeletingItem] = useState<WishlistItemRow | null>(null)

  const savingsQuery = useQuery(savingsSummaryQueryOptions())
  const wishlistQuery = useQuery(wishlistQueryOptions())
  const currentBudgetQuery = useQuery(monthlyBudgetQueryOptions(monthValue))
  const incomeAmount = Number(
    currentBudgetQuery.data?.budget?.income_amount ?? 0,
  )

  function openCreateWishlist() {
    setEditingItem(undefined)
    setWishlistFormOpen(true)
  }

  function openEditWishlist(item: WishlistItemRow) {
    setEditingItem(item)
    setWishlistFormOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setPocketFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Sisihkan Tabungan Bulan Ini
        </Button>
      </div>

      {savingsQuery.isPending ? (
        <Skeleton className="h-32 w-full rounded-xl" />
      ) : savingsQuery.isError ? (
        <ErrorState onRetry={() => savingsQuery.refetch()} />
      ) : (
        <TotalSavingsCard summary={savingsQuery.data} />
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Wishlist</h2>
          <Button variant="outline" size="sm" onClick={openCreateWishlist}>
            <Plus className="h-4 w-4" />
            Tambah Wishlist
          </Button>
        </div>

        {wishlistQuery.isPending ? (
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl" />
            <Skeleton className="h-20 w-full rounded-xl" />
          </div>
        ) : wishlistQuery.isError ? (
          <ErrorState onRetry={() => wishlistQuery.refetch()} />
        ) : wishlistQuery.data.length === 0 ? (
          <EmptyState
            title="Belum ada wishlist"
            description="Catat barang yang ingin Anda beli dari tabungan, lengkap dengan link produk kalau ada."
            actionLabel="Tambah Wishlist"
            onAction={openCreateWishlist}
          />
        ) : (
          <WishlistList
            items={wishlistQuery.data}
            totalSavings={savingsQuery.data?.total ?? 0}
            onEdit={openEditWishlist}
            onDelete={setDeletingItem}
          />
        )}
      </div>

      <PocketFormDialog
        open={pocketFormOpen}
        onOpenChange={setPocketFormOpen}
        monthValue={monthValue}
        incomeAmount={incomeAmount}
        defaultIsSavings
      />
      <WishlistFormDialog
        open={wishlistFormOpen}
        onOpenChange={setWishlistFormOpen}
        item={editingItem}
      />
      <DeleteWishlistItemDialog
        item={deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
      />
    </div>
  )
}

function DebtTab() {
  const [formOpen, setFormOpen] = useState(false)
  const [payingDebt, setPayingDebt] = useState<DebtWithProgress | null>(null)
  const [deletingDebt, setDeletingDebt] = useState<DebtWithProgress | null>(
    null,
  )

  const debtsQuery = useQuery(debtsQueryOptions())

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" />
          Tambah Hutang
        </Button>
      </div>

      {debtsQuery.isPending ? (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-28 w-full rounded-xl" />
        </div>
      ) : debtsQuery.isError ? (
        <ErrorState onRetry={() => debtsQuery.refetch()} />
      ) : debtsQuery.data.length === 0 ? (
        <EmptyState
          title="Belum ada hutang"
          description="Catat hutang Anda di sini agar tetap terpantau sampai lunas."
          actionLabel="Tambah Hutang"
          onAction={() => setFormOpen(true)}
        />
      ) : (
        <DebtList
          debts={debtsQuery.data}
          onPay={setPayingDebt}
          onDelete={setDeletingDebt}
        />
      )}

      <DebtFormDialog open={formOpen} onOpenChange={setFormOpen} />
      <DebtPaymentDialog
        debt={payingDebt}
        onOpenChange={(open) => !open && setPayingDebt(null)}
      />
      <DeleteDebtDialog
        debt={deletingDebt}
        onOpenChange={(open) => !open && setDeletingDebt(null)}
      />
    </div>
  )
}
