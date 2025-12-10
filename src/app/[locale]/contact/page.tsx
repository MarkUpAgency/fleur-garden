"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Phone, Mail, MapPin } from "lucide-react"
import Container from "@/components/shared/container"
import PhoneInput from "react-phone-input-2"
import { useLocale, useTranslations } from "next-intl"
import { useMutation, useQuery } from "@tanstack/react-query"
import { postContactMutation } from "@/services/home/mutations"
import { Contact } from "@/types/home"
import { toast } from "sonner"
import { getContactQuery } from "@/services/about/queries"

export default function ContactPage() {
  const t = useTranslations("contact")
  const locale = useLocale()
  const { mutate: postContact } = useMutation(postContactMutation)
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    message: "",
  })

  const { data: contact } = useQuery(getContactQuery(locale)) 

  const contactData = contact?.data

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    postContact(formData as Contact, {
      onSuccess: () => {
        toast.success("Contact form submitted successfully")
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          message: "",
        })
      },
      onError: () => {
        toast.error("Failed to submit contact form")
      },
    })
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="py-9">
      <Container>
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-[32px] font-semibold text-gray-900 mb-8">{t("title")}</h1>

          {/* Contact Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white border-r border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("phone")}</p>
                    <p className="text-lg font-semibold text-gray-900">{contactData?.phone}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-r border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("email")}</p>
                    <p className="text-lg font-semibold text-gray-900">{contactData?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-gray-200">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <MapPin className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-500 mb-1">{t("address")}</p>
                    <p className="text-lg font-semibold text-gray-900">{contactData?.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:py-12 py-4 px-4 md:px-[115px]"
          style={{
            boxShadow: "0 8px 12px 0 rgba(0, 0, 0, 0.03)",
            borderRadius: "12px",
            border: "1px solid #F2F4F8",
            background: "#FFF",
          }}
        >
          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{t("question")}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("name")}</label>
                <Input
                  type="text"
                  placeholder={t("name_placeholder")}
                  value={formData.full_name}
                  onChange={(e) => handleInputChange("full_name", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("email")}</label>
                <Input
                  type="email"
                  placeholder={t("email_placeholder")}
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("phone")}</label>
                <PhoneInput
                  country={"az"}
                  value={formData.phone}
                  onChange={(value) => handleInputChange("phone", value)}
                  inputProps={{
                    name: "phone",
                    required: true,
                  }}
                  inputClass="!w-full !h-10 !text-sm !bg-white !text-gray-900 !border !border-gray-200 !rounded-md !pl-12"
                  buttonClass="!border !border-gray-200 !bg-white !rounded-l-md"
                  containerClass="!w-full"
                  dropdownClass="!text-sm"
                  placeholder={t("phone_placeholder")}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t("message")}</label>
                <Textarea
                  placeholder={t("message_placeholder")}
                  value={formData.message}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  className="w-full min-h-32"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 rounded-lg font-medium"
              >
                {t("send")} →
              </Button>
            </form>
          </div>

          {/* Map */}
          <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
            <div className="w-full h-96 lg:h-full min-h-96">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3037.8267!2d49.8671!3d40.4093!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40307d6bd6211cf9%3A0x343f69143d0b9e6b!2sAzadliq%20Avenue%20215%2C%20Baku%2C%20Azerbaijan!5e0!3m2!1sen!2s!4v1635789012345!5m2!1sen!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Fleurgarden Location"
              />
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
