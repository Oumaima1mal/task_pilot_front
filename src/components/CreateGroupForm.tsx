"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import type { Group, CreateGroupInput } from "@/types/group"
import { useGroupContext } from "@/context/GroupContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const groupFormSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof groupFormSchema>

interface CreateGroupFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Partial<Group>
  isEditing?: boolean
}

const CreateGroupForm: React.FC<CreateGroupFormProps> = ({ open, onOpenChange, initialValues, isEditing = false }) => {
  const { addGroup, updateGroup } = useGroupContext()

  const form = useForm<CreateGroupInput>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      name: initialValues?.name || "",
      description: initialValues?.description || "",
    },
  })

  const onSubmit = (values: FormValues) => {
    // Ensure name is always provided as required by CreateGroupInput
    const groupData: CreateGroupInput = {
      name: values.name, // This is guaranteed by the form validation
      description: values.description,
    }

    if (isEditing && initialValues?.id) {
      updateGroup(initialValues.id, groupData)
    } else {
      addGroup(groupData)
    }
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Modifier le groupe" : "Créer un groupe"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom du groupe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Description (optionnel)" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit">{isEditing ? "Enregistrer" : "Créer"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateGroupForm
