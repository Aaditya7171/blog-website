import { z } from "zod";

export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["writer", "reader", "admin"]).optional(),
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

