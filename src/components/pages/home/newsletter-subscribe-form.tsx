"use client";

import { useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { subscribe } from "@/services/home/api";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NewsletterSubscribeFormProps {
  placeholder: string;
  emailLabel: string;
  cta: string;
}

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

type FormValues = z.infer<typeof schema>;

export function NewsletterSubscribeForm({ placeholder, emailLabel, cta }: NewsletterSubscribeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
    mode: "onSubmit",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (email: string) => subscribe(email),
    onSuccess: () => {
      toast.success("Subscribed successfully");
      form.reset();
    },
    onError: () => {
      toast.error("Failed to subscribe");
    },
  });

  const onSubmit = useCallback(
    (values: FormValues) => {
      mutate(values.email);
    },
    [mutate]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center gap-3 md:justify-end">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full max-w-[520px] md:w-[520px]">
              <FormControl>
                <Input
                  type="email"
                  placeholder={placeholder}
                  aria-label={emailLabel}
                  className="h-12 rounded-lg border-[#8E8E93]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="h-12 rounded-lg px-6 md:px-8 bg-[#20201E] text-white" disabled={isPending}>
          {isPending ? "..." : cta}
        </Button>
      </form>
    </Form>
  );
}


