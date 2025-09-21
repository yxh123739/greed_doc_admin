'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  updateCategory,
  type CategoryUpdatePatch,
  type DbCategory,
} from '@/lib/supabase/queries'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

export function CategoryEditDialog({
  category,
  onUpdated,
}: {
  category: DbCategory
  onUpdated?: () => void
}) {
  const [open, setOpen] = useState(false)
  const form = useForm<CategoryUpdatePatch>({
    defaultValues: {
      name: category.name,
      description: category.description,
      max_points: category.max_points,
      levels: category.levels,
      strategies: category.strategies,
      icon_key: category.icon_key,
    },
  })

  const onSubmit = async (values: CategoryUpdatePatch) => {
    try {
      await updateCategory(category.id, values)
      toast('Category updated')
      setOpen(false)
      // Notify parent to refetch
      onUpdated?.()
    } catch (e: any) {
      toast(e?.message || String(e))
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-xl'>
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-3'>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <label className='text-sm font-medium'>
              Name
              <Input {...form.register('name', { required: true })} />
            </label>
            <label className='text-sm font-medium'>
              Max Points
              <Input
                type='number'
                {...form.register('max_points', { valueAsNumber: true })}
              />
            </label>
          </div>
          <label className='text-sm font-medium'>
            Description
            <Textarea rows={3} {...form.register('description')} />
          </label>
          <label className='text-sm font-medium'>
            Strategies (JSON or text)
            <Textarea rows={3} {...form.register('strategies')} />
          </label>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <label className='text-sm font-medium'>
              Levels (comma separated)
              <Input
                {...form.register('levels', {
                  setValueAs: (v) =>
                    Array.isArray(v)
                      ? v
                      : String(v || '')
                          .split(',')
                          .map((s) => s.trim())
                          .filter(Boolean),
                })}
              />
            </label>
            <label className='text-sm font-medium'>
              Icon Key
              <Input {...form.register('icon_key')} />
            </label>
          </div>
          <div className='flex justify-end gap-2 pt-2'>
            <Button
              type='button'
              variant='ghost'
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type='submit' disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
