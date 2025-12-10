import { Contact } from "@/types/home";
import { postContact, subscribe } from "./api";
import { mutationOptions } from "@tanstack/react-query";
import { toast } from "sonner";

const subscribeMutation = mutationOptions<void, Error, string>({
    mutationFn: (email) => subscribe(email),
    onSuccess: () => {
        toast.success("Subscribed successfully");
    },
    onError: () => {
        toast.error("Failed to subscribe");
    },
});

const postContactMutation = mutationOptions<void, Error, Contact>({
    mutationFn: (data) => postContact(data)
});

export { subscribeMutation, postContactMutation };