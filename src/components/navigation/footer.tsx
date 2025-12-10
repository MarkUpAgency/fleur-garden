
import { getServerQueryClient } from "@/providers/server"
import { getContactQuery, getSocialsQuery } from "@/services/home/queries"
import ClientFooter from "./client-footer"
import { Contact, Social } from "@/types/home"

export default async function Footer() {
  const queryClient = getServerQueryClient();

  await Promise.all([queryClient.prefetchQuery(getContactQuery()), queryClient.prefetchQuery(getSocialsQuery())]);
  const contactData = queryClient.getQueryData(getContactQuery().queryKey);
  const contact = contactData?.data;
  const socialsData = queryClient.getQueryData(getSocialsQuery().queryKey);
  const socials = socialsData?.data;

  return (
    <ClientFooter contact={contact as Contact} socials={socials as Social[]} />
  )
}
