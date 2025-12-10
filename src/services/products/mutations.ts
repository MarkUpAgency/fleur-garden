import { CreateReviewPayload, OrderPayload, ApplyPromoPayload } from "@/types";
import { addComment, order, applyPromo   } from "./api";
import { mutationOptions } from "@tanstack/react-query";

const addCommentMutation = (data: CreateReviewPayload) => {
    return mutationOptions({
        mutationFn: () => addComment(data)
    });
};

const orderMutation = (data: OrderPayload) => {
    return mutationOptions({
        mutationFn: () => order(data),
    });
};

const applyPromoMutation = (data: ApplyPromoPayload) => {
    return mutationOptions({
        mutationFn: () => applyPromo(data),
    });
};

export { addCommentMutation, orderMutation, applyPromoMutation };