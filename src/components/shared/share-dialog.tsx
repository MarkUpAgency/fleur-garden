import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";

function ShareDialog() {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const t = useTranslations();

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error("Failed to copy URL:", err);
    }
  };

  const handleWhatsAppShare = () => {
    const text = t('share.whatsapp_share_text');
    const url = `https://wa.me/?text=${encodeURIComponent(
      text + " " + currentUrl
    )}`;
    window.open(url, "_blank");
  };

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      currentUrl
    )}`;
    window.open(url, "_blank");
  };

  const handleEmailShare = () => {
    const subject = t('share.email_subject');
    const body = `${t('share.email_body')} ${currentUrl}`;
    const url = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.open(url);
  };
  
  return (
    <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center border-none shadow-none cursor-pointer gap-2"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white rounded-2xl p-0 gap-0">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center">
            Fleur Garden
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t('share.share_page_title')}
            </h2>
            <p className="text-gray-600 text-sm">{t('share.share_page_description')}</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* WhatsApp */}
            <button
              onClick={handleWhatsAppShare}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.785" />
                </svg>
              </div>
              <span className="text-sm font-medium">{t('share.whatsapp')}</span>
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookShare}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <span className="text-sm font-medium">{t('share.facebook')}</span>
            </button>

            {/* Email */}
            <button
              onClick={handleEmailShare}
              className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">{t('share.email')}</span>
            </button>
          </div>

          <div className="relative">
            <Input
              type="text"
              placeholder={t('share.link_placeholder')}
              value={currentUrl}
              readOnly
              className="pr-12 bg-gray-50 border-gray-200"
            />
            <Button
              onClick={handleCopyUrl}
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200"
            >
              {copySuccess ? (
                <svg
                  className="h-4 w-4 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ShareDialog;
