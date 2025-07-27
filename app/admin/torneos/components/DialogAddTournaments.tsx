"use client";

import { useState } from "react";
import { z } from "zod";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { TOURNAMENT_CATEGORIES } from "@/lib/constants";
import { Button } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {
    Form, // Importar el componente Form de Shadcn
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

// Esquema Zod mejorado
const tournamentSchema = z
    .object({
        name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
        description: z.string().optional(),
        category: z.string({
            error: "La categoría es obligatoria"
        }),
        locality: z.string().min(3, "La localidad es obligatoria"),
        startDate: z.date({
            error: "Fecha de inicio inválida"
        }),
        endDate: z
            .date({
                error: "Fecha de fin inválida"
            })
            .optional()
    })
    .refine(
        (data) => {
            if (data.endDate && data.startDate) {
                // Asegurarse de que endDate no sea anterior a startDate
                // Usamos getTime() para comparar objetos Date
                return data.endDate.getTime() >= data.startDate.getTime();
            }
            return true; // Si endDate es opcional y no está, o startDate no está, no hay error aquí.
        },
        {
            message:
                "La fecha de fin no puede ser anterior a la fecha de inicio.",
            path: ["endDate"] // El error se asignará al campo 'endDate'
        }
    );

type TournamentFormValues = z.infer<typeof tournamentSchema>;

const DialogAddTournaments = () => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    // Inicializar useForm con zodResolver y defaultValues
    const form = useForm<TournamentFormValues>({
        resolver: zodResolver(tournamentSchema),
        defaultValues: {
            name: "",
            description: "",
            category: undefined, // undefined o el primer valor si la categoría es siempre obligatoria
            locality: "",
            startDate: undefined,
            endDate: undefined
        }
    });

    const onSubmit = async (data: TournamentFormValues) => {
        try {
            // Si startDate o endDate son objetos Date, quizás debas formatearlos a ISO string para la API
            const payload = {
                ...data,
                startDate: data.startDate
                    ? data.startDate.toISOString().split("T")[0]
                    : undefined, // Formato YYYY-MM-DD
                endDate: data.endDate
                    ? data.endDate.toISOString().split("T")[0]
                    : undefined // Formato YYYY-MM-DD
            };

            const res = await fetch("/api/tournaments", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setIsCreateDialogOpen(false);
                form.reset(); // Limpia el formulario después de un envío exitoso
            } else {
                const errorData = await res.json();
                console.error("Error al crear torneo:", errorData);
                // Aquí podrías mostrar un toast o mensaje de error al usuario
            }
        } catch (err) {
            console.error("Error en la petición:", err);
            // Aquí podrías manejar errores de red o del cliente
        }
    };
    return (
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    className="bg-gradient-to-r from-primary to-blue-600 rounded-3xl p-6 text-white
        hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
         cursor-pointer"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Torneo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Crear Nuevo Torneo</DialogTitle>
                    <DialogDescription>
                        Completa la información básica del torneo
                    </DialogDescription>
                </DialogHeader>

                {/* Formulario con react-hook-form */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="grid gap-4 py-4"
                    >
                        {/* Campo: Nombre del Torneo */}
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nombre del Torneo</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Copa de Verano 2024"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo: Localidad */}
                        <FormField
                            control={form.control}
                            name="locality"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Localidad</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Ej: Buenos Aires"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campo: Categoría (Select) */}
                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Categoría</FormLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecciona una categoría" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {TOURNAMENT_CATEGORIES.map(
                                                (cat) => (
                                                    <SelectItem
                                                        key={cat.value}
                                                        value={cat.value}
                                                    >
                                                        {cat.label}
                                                    </SelectItem>
                                                )
                                            )}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        {/* Campos de Fecha (Inicio y Fin) */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="startDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Inicio</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                // `field.value` para un input type="date" debe ser un string YYYY-MM-DD
                                                // Si Zod transforma a Date, necesitas transformar de vuelta para el input.
                                                value={
                                                    field.value
                                                        ? field.value
                                                              .toISOString()
                                                              .split("T")[0]
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    field.onChange(
                                                        new Date(e.target.value)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha de Fin</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="date"
                                                // `field.value` para un input type="date" debe ser un string YYYY-MM-DD
                                                value={
                                                    field.value
                                                        ? field.value
                                                              .toISOString()
                                                              .split("T")[0]
                                                        : ""
                                                }
                                                onChange={(e) =>
                                                    field.onChange(
                                                        new Date(e.target.value)
                                                    )
                                                }
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Campo: Descripción */}
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Descripción del torneo..."
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end space-x-2 pt-2">
                            <Button
                                type="button"
                                variant="default"
                                className="bg-red-500 hover:bg-red-600 hover:scale-105 transition-all duration-300 cursor-pointer"
                                onClick={() => {
                                    setIsCreateDialogOpen(false);
                                    form.reset(); // Resetear el formulario al cancelar
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                className="bg-gradient-to-r from-primary to-blue-600 text-white
                  hover:from-primary/80 hover:to-blue-700 hover:scale-105 transition-all duration-300
                  active:scale-95 cursor-pointer"
                            >
                                Crear Torneo
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default DialogAddTournaments;
