import Container from "@/components/shared/container";
import Image from "next/image";
import { getServerLocale } from "@/lib/utils";
import { getServerQueryClient } from "@/providers/server";
import { getPartnerQuery } from "@/services/home/queries";
import { getTranslations } from "next-intl/server";

export default async function Partner({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const t = await getTranslations("navigation");
  const locale = await getServerLocale();
  const queryClient = getServerQueryClient();

  await Promise.all([queryClient.prefetchQuery(getPartnerQuery(locale, slug))]);
  const partnerData = queryClient.getQueryData(getPartnerQuery(locale, slug).queryKey);
  const partner = partnerData?.data;

  return (
    <div className="py-9">
      <Container>
        {/* Breadcrumb */}
        <div className="text-sm text-muted-foreground mb-6">
          <span className="hover:text-foreground transition-colors">{t("partners")}</span>
          <span className="mx-2">/</span>
          <span className="text-foreground">{partner?.name}</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-light text-gray-900 mb-8 flex items-center gap-2">
          {partner?.name}
          <div className="border border-[#F2F4F8] rounded-full p-2">
            <Image src={partner?.logo || ""} alt={`${partner?.name} logo`} width={1200} height={800} className="w-24 object-contain" />
          </div>
        </h1>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
          <div className="text-[#77777B] leading-7 text-base space-y-4 [&_span]:!text-[#77777B]">
            <p dangerouslySetInnerHTML={{ __html: partner?.description || "" }} />
          </div>

          <div className="w-full sticky top-40">
            <div className="overflow-hidden h-[384px] rounded-2xl border border-[#F2F4F8] shadow-[0_8px_12px_rgba(0,0,0,0.03)]">
              <Image
                src={partner?.image || ""}
                alt={`${partner?.name} cover`}
                width={1200}
                height={800}
                className="h-full w-full object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}