import MainProfile from "@/components/pages/profile/main-profile"
import { getServerQueryClient } from "@/providers/server";
import { getUserQuery } from "@/services/auth/queries";
import { cookies } from "next/headers";
import { User } from "@/types";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const token = (await cookies()).get("access_token")?.value as string;
  const queryClient = getServerQueryClient();
  await Promise.all([queryClient.prefetchQuery(getUserQuery(token))]);
  const userData = queryClient.getQueryData(getUserQuery(token).queryKey);
  const user = userData?.data;
  const t = await getTranslations("profile")

  return (
    <div className="col-span-3 lg:pl-8 h-full mt-5 lg:mt-0">
      <h1 className="text-xl font-medium text-gray-900 mb-5 p-4 border border-[#F2F4F8]"
        style={{
          borderRadius: "8px",
          border: "1px solid #F2F4F8",
          background: "#FFF",
          boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
        }}>{t("profile_and_help")}</h1>
      <div>
        <MainProfile user={user as User}/>
      </div>
    </div>
  )
}
