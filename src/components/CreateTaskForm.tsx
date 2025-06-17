"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import type { Task, TaskCategory, TaskPriority, CreateTaskInput } from "@/types/task"
import { useTaskContext } from "@/context/TaskContext"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Schéma de validation sans le champ reminder
const formSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(100),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["low", "medium", "high"]),
  category: z.enum(["work", "personal", "shopping", "health", "other"]),
})

type FormValues = z.infer<typeof formSchema>

interface CreateTaskFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialValues?: Partial<Task>
  isEditing?: boolean
  groupId?: string
}

const CreateTaskForm: React.FC<CreateTaskFormProps> = ({
  open,
  onOpenChange,
  initialValues,
  isEditing = false,
  groupId,
}) => {
  const { addTask, updateTask , refreshTasks } = useTaskContext()
  const [error, setError] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialValues?.title || "",
      description: initialValues?.description || "",
      priority: initialValues?.priority || "medium",
      category: initialValues?.category || "personal",
      dueDate: initialValues?.dueDate,
      // Suppression de la valeur par défaut pour reminder
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setIsSubmitting(true)
      setError(null)

      const taskData: CreateTaskInput = {
        ...values,
        title: values.title,
        priority: values.priority,
        category: values.category,
        completed: initialValues?.completed || false,
        groupId: groupId || initialValues?.groupId,
        // Pas de reminder dans les données envoyées
      }

      console.log("Soumission du formulaire de tâche:", {
        isEditing,
        initialValues: initialValues?.id,
        groupId,
        taskData,
      })

      if (isEditing && initialValues?.id) {
        await updateTask(initialValues.id, taskData)
      } else {
        await addTask(taskData)
        await refreshTasks()
      }
      onOpenChange(false)
      form.reset()
    } catch (error: any) {
      console.error("Erreur lors de la soumission du formulaire:", error)
      setError(error.message || "Une erreur est survenue lors de la création de la tâche")
    } finally {
      setIsSubmitting(false)
    }
  }

  const priorities: { value: TaskPriority; label: string }[] = [
    { value: "low", label: "Faible" },
    { value: "medium", label: "Important" },
    { value: "high", label: "Urgent" },
  ]

  const categories: { value: TaskCategory; label: string }[] = [
    { value: "work", label: "Travail" },
    { value: "personal", label: "Personnel" },
    { value: "shopping", label: "Achats" },
    { value: "health", label: "Santé" },
    { value: "other", label: "Autre" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Modifier la tâche" : groupId ? "Ajouter une tâche de groupe" : "Ajouter une tâche"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Titre de la tâche" {...field} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Catégorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une catégorie" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une priorité" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {priorities.map((priority) => (
                          <SelectItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Date d'échéance maintenant sur toute la largeur */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date d'échéance (optionnel)</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !field.value && "text-muted-foreground"
                          }`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, "dd/MM/yyyy") : <span>Sélectionner une date</span>}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        disabled={(date) => date < new Date("1900-01-01")}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {groupId && (
              <div className="bg-muted/30 p-3 rounded-md">
                <p className="text-sm">
                  Cette tâche sera partagée avec tous les membres du groupe. Chaque membre pourra mettre à jour son
                  statut individuellement.
                </p>
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    {isEditing ? "Enregistrement..." : "Ajout..."}
                  </div>
                ) : isEditing ? (
                  "Enregistrer"
                ) : (
                  "Ajouter"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default CreateTaskForm
