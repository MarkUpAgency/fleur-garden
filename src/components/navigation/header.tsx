import { getLocale } from "next-intl/server"
import { getServerQueryClient } from "@/providers/server"
import { getUserQuery } from "@/services/auth/queries"
import { cookies } from "next/headers"
import { getCategoriesQuery, getProductsQuery } from "@/services/products/queries"
import ClientHeader from "./client-header"
import { User, Category, Product } from "@/types"

export async function Header() {
  const locale = await getLocale()
  const token = (await cookies()).get("access_token")?.value as string;
  const queryClient = getServerQueryClient();

  await Promise.all([
    queryClient.prefetchQuery(getUserQuery(token)),
    queryClient.prefetchQuery(getCategoriesQuery()),
    queryClient.prefetchQuery(getProductsQuery(locale)),
  ]);
  const userData = queryClient.getQueryData(getUserQuery(token).queryKey);
  const user = userData?.data;

  const categoriesData = queryClient.getQueryData(getCategoriesQuery().queryKey);
  const categories = categoriesData?.data;
  const latestProductsData = queryClient.getQueryData(getProductsQuery(locale).queryKey);
  const latestProducts = latestProductsData?.data;

  return (
    <ClientHeader user={user as User} categories={categories as Category[]} latestProducts={latestProducts as Product[]} />
  )
}
