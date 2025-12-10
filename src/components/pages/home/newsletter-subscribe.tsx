import Container from "@/components/shared/container";
import { getTranslations } from "next-intl/server";
import { NewsletterSubscribeForm } from "./newsletter-subscribe-form";

export async function NewsletterSubscribe() {
  const t = await getTranslations("newsletter");

  return (
    <section className="pb-16 md:pb-[121px]">
      <Container>
        <div className="rounded-2xl bg-[#F6F6F6] px-4 py-8 md:px-10 md:py-10">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div className="space-y-6 max-w-[500px]">
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                {t("title")}
              </h2>
              <p className="text-muted-foreground md:text-base">
                {t("subtitle")}
              </p>
            </div>
            <NewsletterSubscribeForm
              placeholder={t("placeholder")}
              emailLabel={t("emailLabel")}
              cta={t("cta")}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}


