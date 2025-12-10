import Container from "@/components/shared/container"
import { getServerLocale } from "@/lib/utils";
import { getServerQueryClient } from "@/providers/server";
import { getAboutQuery, getAdvantagesQuery } from "@/services/about/queries";
import { getMetaTags } from "@/services/home/api";
import Image from "next/image"

export async function generateMetadata() {
  const metaTagsData = await getMetaTags();
  const metaTags = metaTagsData?.data?.find((metaTag) => metaTag.title === "About");

  return {
    title: metaTags?.meta_title,
    description: metaTags?.meta_desc,
    keywords: metaTags?.meta_keywords,
  };
}

export default async function AboutPage() {
  const locale = await getServerLocale();
  const queryClient = getServerQueryClient();

  await Promise.all([queryClient.prefetchQuery(getAboutQuery(locale)), queryClient.prefetchQuery(getAdvantagesQuery(locale))]);
  const aboutData = queryClient.getQueryData(getAboutQuery(locale).queryKey);
  const advantagesData = queryClient.getQueryData(getAdvantagesQuery(locale).queryKey);

  const about = aboutData?.data;
  const advantages = advantagesData?.data;

  return (
    <div className="py-9">
      <Container>
        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 items-start gap-12 mb-20">
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold text-foreground text-balance">{about?.title}</h1>
            <p dangerouslySetInnerHTML={{ __html: about?.description || "" }} className="text-lg text-muted-foreground leading-relaxed"></p>
          </div>
          <div className="flex sticky top-40 justify-center lg:justify-end h-[384px] rounded-[12px] overflow-hidden">
            <Image
              src={about?.image || ""}
              alt="Elegant perfume bottle"
              width={300}
              height={300}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-8 border-y border-[#F2F4F8] py-8">
          {advantages?.map((advantage) => (
            <div className="space-y-4" key={advantage.title}>
            <div className="flex">
              <Image src={advantage.image || ""} alt={advantage.title} width={32} height={36} />
            </div>
            <h3 className="text-2xl font-semibold text-foreground">{advantage.title}</h3>
            <p className="text-[#77777B]">
              {advantage.description}
            </p>
          </div>
          ))}
        </div>
      </Container>
    </div>
  )
}
