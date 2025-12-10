import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getServerLocale } from "@/lib/utils"
import { getServerQueryClient } from "@/providers/server"
import { getFaqQuery } from "@/services/about/queries"
import { getTranslations } from "next-intl/server"
import { cookies } from "next/headers"

export default async function FAQSection() {
    const locale = await getServerLocale();
    const t = await getTranslations("profile");
    const queryClient = getServerQueryClient();
    const token = (await cookies()).get("access_token")?.value as string;

    await Promise.all([queryClient.prefetchQuery(getFaqQuery(locale, token))]);
    const faqDatas = queryClient.getQueryData(getFaqQuery(locale, token).queryKey);
    const faqs = faqDatas?.data;

    const tabs = faqs?.map((faq) => faq.name);

    return (
        <div className="col-span-3 lg:pl-8 lg:px-6 mt-5 lg:mt-0 space-y-6">
            <h1
                style={{
                    borderRadius: "8px",
                    border: "1px solid #F2F4F8",
                    background: "#FFF",
                    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                }} className="text-xl font-medium mb-8 text-gray-900 p-4">{t("help")}</h1>

            {/* Tab Navigation */}
            <div
                className="py-9 px-8"
                style={{
                    borderRadius: "8px",
                    border: "1px solid #F2F4F8",
                    background: "#FFF",
                    boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
                }}>
                <Tabs defaultValue={tabs?.[0]}>
                    <TabsList className={`grid gap-1 mb-8 bg-gray-100 p-1 rounded-lg`}
                        style={{
                            gridTemplateColumns: `repeat(${tabs?.length}, 1fr)`,
                        }}
                    >
                        {tabs?.map((tab) => (
                            <TabsTrigger
                                key={tab}
                                value={tab}
                                className="flex-1 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-gray-900 text-gray-600"
                            >
                                {tab}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {tabs?.map((tab) => {
                        const faqsData = faqs?.find((faq) => faq.name === tab)?.faqs;
                        return (
                            <TabsContent key={tab} value={tab}>
                                <Accordion type="single" collapsible className="space-y-4">
                                    {faqsData?.map((faq, index) => (
                                        <AccordionItem key={index} value={`item-${index}`} className="border-b border-[#F2F4F8] rounded-none px-6 py-2">
                                            <AccordionTrigger className="text-left text-gray-900 hover:no-underline py-4">
                                                {faq.question}
                                            </AccordionTrigger>
                                            <AccordionContent className="text-gray-600 pb-4">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                                    <p>{faq.answer}</p>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            </TabsContent>
                        )
                    })}
                </Tabs>
            </div>
        </div>
    )
}
